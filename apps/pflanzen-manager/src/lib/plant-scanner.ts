import { PlantSpecies } from '@/types';
import { PLANT_SPECIES } from '@/data/plants';

/**
 * Visual feature keywords for plant identification.
 * Maps plant IDs to recognizable visual characteristics.
 */
const VISUAL_FEATURES: Record<string, string[]> = {};

// Build visual features from existing plant data (tags, family, description keywords)
PLANT_SPECIES.forEach(plant => {
  const keywords: string[] = [
    plant.common_name.toLowerCase(),
    plant.botanical_name.toLowerCase(),
    plant.family.toLowerCase(),
    ...plant.tags.map(t => t.toLowerCase()),
  ];

  // Extract meaningful visual descriptors from description
  const descKeywords = plant.description.toLowerCase();
  const visualTerms = [
    'geschlitzt', 'herzförmig', 'panaschiert', 'geigenförmig', 'groß',
    'dick', 'fleischig', 'lanzettenförmig', 'gestreift', 'bunt',
    'rund', 'oval', 'spitz', 'glänzend', 'samtig', 'behaart',
    'gefleckt', 'marmoriert', 'gewellt', 'aufrecht', 'hängend',
    'ranke', 'blüte', 'rosa', 'rot', 'weiß', 'gelb', 'lila',
    'grün', 'dunkelgrün', 'hellgrün', 'silber', 'silbern',
    'kaktus', 'sukkulent', 'palm', 'farn', 'moos', 'orchidee',
    'kraut', 'basilikum', 'rosmarin', 'minze',
  ];

  visualTerms.forEach(term => {
    if (descKeywords.includes(term)) {
      keywords.push(term);
    }
  });

  VISUAL_FEATURES[plant.id] = keywords;
});

export interface ScanResult {
  species: PlantSpecies;
  confidence: number;
  matchedFeatures: string[];
}

export interface CareProtocol {
  species: PlantSpecies;
  weeklyTasks: CareTask[];
  seasonalNotes: string[];
  placement: string;
  warnings: string[];
}

export interface CareTask {
  type: 'water' | 'fertilize' | 'mist' | 'rotate' | 'prune' | 'repot';
  label: string;
  frequencyDays: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Analyze image dominant colors by drawing to a canvas.
 * Returns color category hints (e.g., "grün", "bunt", etc.)
 */
export function analyzeImageColors(imageElement: HTMLImageElement): string[] {
  const canvas = document.createElement('canvas');
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(imageElement, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size).data;

  let totalR = 0, totalG = 0, totalB = 0;
  let greenPixels = 0, brownPixels = 0, whitePixels = 0;
  const pixelCount = size * size;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;

    if (g > r * 1.2 && g > b * 1.1 && g > 60) greenPixels++;
    if (r > g && r > b && r - g < 80 && g > 40) brownPixels++;
    if (r > 200 && g > 200 && b > 200) whitePixels++;
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  const hints: string[] = [];
  if (greenPixels / pixelCount > 0.2) hints.push('grün');
  if (greenPixels / pixelCount > 0.5) hints.push('dunkelgrün');
  if (brownPixels / pixelCount > 0.15) hints.push('braun');
  if (whitePixels / pixelCount > 0.3) hints.push('weiß');
  if (avgR > avgG * 1.3 && avgR > avgB * 1.3) hints.push('rot');
  if (avgR > 150 && avgG > 100 && avgB < 100) hints.push('gelb');
  if (avgB > avgR * 1.2 && avgB > avgG * 1.1) hints.push('lila');

  // Shape heuristics based on color distribution
  const greenRatio = greenPixels / pixelCount;
  if (greenRatio > 0.4) hints.push('blattschmuck');
  if (greenRatio < 0.1 && brownPixels / pixelCount < 0.1) hints.push('blüte');

  return hints;
}

/**
 * Match a user text query + optional color hints against the plant database.
 * Returns ranked results sorted by confidence.
 */
export function identifyPlant(
  textQuery: string,
  colorHints: string[] = []
): ScanResult[] {
  const queryTerms = textQuery.toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const allTerms = [...queryTerms, ...colorHints.map(h => h.toLowerCase())];

  const results: ScanResult[] = [];

  PLANT_SPECIES.forEach(species => {
    const features = VISUAL_FEATURES[species.id] || [];
    const matchedFeatures: string[] = [];
    let score = 0;

    // Exact name match is strongest
    const nameLower = species.common_name.toLowerCase();
    const botanicalLower = species.botanical_name.toLowerCase();
    const queryLower = textQuery.toLowerCase().trim();

    if (nameLower === queryLower || botanicalLower === queryLower) {
      score += 100;
      matchedFeatures.push(species.common_name);
    } else if (nameLower.includes(queryLower) || botanicalLower.includes(queryLower)) {
      score += 60;
      matchedFeatures.push(species.common_name);
    }

    // Term-by-term matching
    allTerms.forEach(term => {
      if (term.length < 2) return;
      features.forEach(feature => {
        if (feature.includes(term) || term.includes(feature)) {
          score += 10;
          if (!matchedFeatures.includes(feature)) {
            matchedFeatures.push(feature);
          }
        }
      });

      // Family match
      if (species.family.toLowerCase().includes(term)) {
        score += 5;
        matchedFeatures.push(species.family);
      }
    });

    // Color hint bonus
    colorHints.forEach(hint => {
      const hintLower = hint.toLowerCase();
      if (species.tags.some(t => t.toLowerCase().includes(hintLower))) {
        score += 8;
      }
      if (species.description.toLowerCase().includes(hintLower)) {
        score += 3;
      }
    });

    if (score > 0) {
      // Normalize confidence to 0-100
      const confidence = Math.min(100, Math.round(score));
      results.push({ species, confidence, matchedFeatures: [...new Set(matchedFeatures)] });
    }
  });

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
}

/**
 * Generate a complete care protocol for a given plant species,
 * considering the current month and room conditions.
 */
export function generateCareProtocol(
  species: PlantSpecies,
  roomLight?: 'low' | 'medium' | 'bright' | 'direct'
): CareProtocol {
  const currentMonth = new Date().getMonth() + 1;
  const isGrowingSeason = [3, 4, 5, 6, 7, 8, 9].includes(currentMonth);
  const isWinter = [11, 12, 1, 2].includes(currentMonth);

  const weeklyTasks: CareTask[] = [];

  // Watering task
  const waterFreq = isWinter
    ? Math.round(species.water_frequency_days * 1.5)
    : species.water_frequency_days;
  weeklyTasks.push({
    type: 'water',
    label: 'Gießen',
    frequencyDays: waterFreq,
    description: getWaterDescription(species),
    priority: 'high',
  });

  // Fertilizing (only in growing season)
  if (species.fertilize_months.includes(currentMonth)) {
    weeklyTasks.push({
      type: 'fertilize',
      label: 'Düngen',
      frequencyDays: species.fertilize_frequency_days,
      description: `Mit Flüssigdünger alle ${species.fertilize_frequency_days} Tage düngen. ${species.difficulty === 'easy' ? 'Halbe Konzentration ist auch in Ordnung.' : 'Genaue Dosierung beachten.'}`,
      priority: 'medium',
    });
  }

  // Misting (for high humidity plants)
  if (species.humidity === 'high') {
    weeklyTasks.push({
      type: 'mist',
      label: 'Besprühen',
      frequencyDays: isWinter ? 2 : 3,
      description: 'Blätter regelmäßig mit kalkarmem Wasser besprühen, besonders bei trockener Heizungsluft.',
      priority: isWinter ? 'high' : 'medium',
    });
  }

  // Rotating
  weeklyTasks.push({
    type: 'rotate',
    label: 'Drehen',
    frequencyDays: 7,
    description: 'Um eine Vierteldrehung drehen für gleichmäßiges Wachstum.',
    priority: 'low',
  });

  // Seasonal notes
  const seasonalNotes: string[] = [];
  if (isWinter) {
    seasonalNotes.push('Winter: Weniger gießen, nicht düngen, auf Zugluft achten.');
    if (species.temperature_min > 15) {
      seasonalNotes.push(`Mindesttemperatur ${species.temperature_min}°C beachten – nicht am kalten Fenster stehen lassen.`);
    }
  }
  if (isGrowingSeason) {
    seasonalNotes.push('Wachstumszeit: Regelmäßig düngen und mehr gießen.');
    if (species.growth_speed === 'fast') {
      seasonalNotes.push('Schnellwachsend – ggf. Rankhilfe oder größeren Topf einplanen.');
    }
  }
  if (currentMonth === 3 || currentMonth === 4) {
    seasonalNotes.push('Guter Zeitpunkt zum Umtopfen, wenn der Topf zu eng wird.');
  }

  // Placement recommendation
  const placement = getPlacementRecommendation(species, roomLight);

  // Warnings
  const warnings: string[] = [];
  if (species.toxic_pets) {
    warnings.push('Giftig für Haustiere – außer Reichweite von Katzen und Hunden aufstellen.');
  }
  if (species.toxic_children) {
    warnings.push('Giftig bei Verschlucken – außer Reichweite von Kleinkindern aufstellen.');
  }
  if (species.water_amount === 'little') {
    warnings.push('Staunässe unbedingt vermeiden! Lieber zu wenig als zu viel gießen.');
  }

  return { species, weeklyTasks, seasonalNotes, placement, warnings };
}

function getWaterDescription(species: PlantSpecies): string {
  switch (species.water_amount) {
    case 'little':
      return `Alle ${species.water_frequency_days} Tage sparsam gießen. Erde zwischen dem Gießen vollständig antrocknen lassen.`;
    case 'moderate':
      return `Alle ${species.water_frequency_days} Tage mäßig gießen. Obere Erdschicht antrocknen lassen, dann gründlich wässern.`;
    case 'much':
      return `Alle ${species.water_frequency_days} Tage reichlich gießen. Die Erde gleichmäßig feucht halten, aber Staunässe vermeiden.`;
  }
}

function getPlacementRecommendation(
  species: PlantSpecies,
  roomLight?: string
): string {
  const lightMap: Record<string, string> = {
    low: 'Schattig bis halbschattig (Nordfenster oder Rauminneres)',
    medium: 'Halbschattig bis hell (Ost- oder Westfenster)',
    bright: 'Hell ohne direkte Sonne (helles Zimmer, gefiltertes Licht)',
    direct: 'Volle Sonne (Südfenster, Balkon)',
  };

  let recommendation = `Idealer Standort: ${lightMap[species.light] || 'Hell'}. `;
  recommendation += `Temperatur: ${species.temperature_min}–${species.temperature_max}°C. `;

  if (species.humidity === 'high') {
    recommendation += 'Hohe Luftfeuchtigkeit bevorzugt – ideal für Badezimmer oder Küche.';
  } else if (species.humidity === 'low') {
    recommendation += 'Kommt mit trockener Raumluft gut zurecht.';
  }

  if (roomLight && roomLight !== species.light) {
    const lightPriority = { low: 0, medium: 1, bright: 2, direct: 3 };
    const roomLevel = lightPriority[roomLight as keyof typeof lightPriority] ?? 1;
    const plantLevel = lightPriority[species.light] ?? 1;
    if (roomLevel < plantLevel) {
      recommendation += ' ⚠ Der aktuelle Raum ist dunkler als ideal – Pflanzlampe empfohlen.';
    } else if (roomLevel > plantLevel + 1) {
      recommendation += ' ⚠ Zu viel direktes Licht kann Blätter verbrennen – Abstand zum Fenster halten.';
    }
  }

  return recommendation;
}

/**
 * Convert a CareProtocol into a human-readable weekly schedule string.
 */
export function formatWeeklySchedule(protocol: CareProtocol): string {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const lines: string[] = [];

  protocol.weeklyTasks.forEach(task => {
    if (task.frequencyDays <= 7) {
      const interval = Math.max(1, Math.round(7 / (7 / task.frequencyDays)));
      const scheduleDays: string[] = [];
      for (let i = 0; i < 7; i += interval) {
        scheduleDays.push(days[Math.min(i, 6)]);
      }
      lines.push(`${task.label}: ${scheduleDays.join(', ')}`);
    } else {
      lines.push(`${task.label}: Alle ${task.frequencyDays} Tage`);
    }
  });

  return lines.join('\n');
}
