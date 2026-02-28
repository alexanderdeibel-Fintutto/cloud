import { PlantSpecies, PlantCareDetails } from '@/types';

/**
 * Generates detailed care information from a plant's base properties.
 * This ensures every plant has useful, specific care guidance
 * tailored to its actual needs - even without manual curation.
 */
function generateCareDetails(plant: PlantSpecies): PlantCareDetails {
  const isSucculent = plant.water_amount === 'little' && plant.humidity === 'low';
  const isTropical = plant.humidity === 'high';
  const isCactus = plant.family === 'Cactaceae';
  const isHerb = plant.family === 'Lamiaceae';
  const isFern = plant.family === 'Nephrolepidaceae' || plant.family === 'Pteridaceae';
  const isOrchid = plant.family === 'Orchidaceae';
  const isAroid = plant.family === 'Araceae';
  const isPalm = plant.family === 'Arecaceae';

  // Substrate
  let substrate: string;
  if (isCactus || isSucculent) {
    substrate = 'Kakteen- oder Sukkulentenerde aus dem Baumarkt oder Gartencenter. Alternativ: Normale Blumenerde mit 50% Sand oder Perlite mischen. Wichtig: Die Erde muss Wasser schnell ablaufen lassen, damit die Wurzeln nicht faulen. Im Topf muss unbedingt ein Abflussloch sein!';
  } else if (isOrchid) {
    substrate = 'Spezielle Orchideenerde (grobe Rindenstücke) aus dem Gartencenter. KEINE normale Blumenerde verwenden – Orchideen brauchen Luft an den Wurzeln! Das Substrat sieht aus wie Holzstücke, das ist normal und richtig so.';
  } else if (isFern) {
    substrate = 'Lockere, humusreiche Blumenerde. Am besten Blumenerde mit etwas Torf oder Kokosfaser mischen. Die Erde sollte Wasser gut speichern können, aber nicht matschig werden.';
  } else if (isHerb) {
    substrate = 'Normale Kräutererde oder Blumenerde aus dem Supermarkt reicht völlig. Wichtig: Ein Topf mit Abflussloch verwenden, damit überschüssiges Wasser ablaufen kann.';
  } else if (isTropical) {
    substrate = 'Hochwertige Zimmerpflanzenerde aus dem Gartencenter. Für bessere Drainage 20-30% Perlite (weiße Kügelchen, gibt es im Gartencenter) untermischen. Das verhindert, dass die Erde zu nass bleibt und die Wurzeln faulen.';
  } else if (isPalm) {
    substrate = 'Palmenerde oder hochwertige Zimmerpflanzenerde. Etwas Sand untermischen für bessere Drainage. Palmen mögen leicht saure Erde.';
  } else {
    substrate = 'Normale Zimmerpflanzenerde aus dem Baumarkt oder Gartencenter. Für die meisten Pflanzen reicht Standard-Blumenerde völlig aus. Tipp: Ein Topf mit Abflussloch und ein Untersetzer darunter sind Pflicht!';
  }

  // Watering detail
  let watering_detail: string;
  if (isSucculent || isCactus) {
    watering_detail = `Alle ${plant.water_frequency_days} Tage prüfen: Finger 3-4 cm tief in die Erde stecken. Nur gießen, wenn die Erde KOMPLETT trocken ist. Lieber einmal zu wenig als einmal zu viel! Beim Gießen die Erde durchfeuchten, überschüssiges Wasser aus dem Untersetzer nach 15 Minuten wegschütten. Im Winter noch seltener gießen (alle ${Math.round(plant.water_frequency_days * 2)} Tage).`;
  } else if (plant.water_amount === 'much') {
    watering_detail = `Alle ${plant.water_frequency_days} Tage gießen. Die Erde sollte immer leicht feucht sein – aber nicht matschig! Fingerprobe: Steck deinen Finger 2 cm in die Erde. Fühlt sie sich trocken an? Dann gießen. Feucht? Noch 1-2 Tage warten. Verwende am besten Wasser auf Zimmertemperatur. ${isTropical ? 'Zusätzlich die Blätter regelmäßig mit einer Sprühflasche besprühen – das mögen tropische Pflanzen besonders.' : ''}`;
  } else {
    watering_detail = `Alle ${plant.water_frequency_days} Tage gießen. Fingerprobe: Steck deinen Finger 2-3 cm tief in die Erde. Fühlt sich die obere Schicht trocken an? Dann ist es Zeit zum Gießen. Gieße so lange, bis etwas Wasser unten aus dem Topf läuft. Nach 15 Minuten das Wasser im Untersetzer wegschütten – Staunässe ist der Feind Nr. 1! Im Winter weniger gießen (alle ${Math.round(plant.water_frequency_days * 1.5)} Tage).`;
  }

  // Pruning
  let pruning: string;
  if (isCactus) {
    pruning = 'Kakteen müssen normalerweise nicht geschnitten werden. Nur vertrocknete oder verfaulte Teile vorsichtig mit einem sauberen, scharfen Messer entfernen. Dabei immer dicke Handschuhe tragen!';
  } else if (isSucculent) {
    pruning = 'Sukkulenten brauchen kaum Rückschnitt. Vertrocknete oder matschige Blätter vorsichtig abzupfen. Wenn die Pflanze zu lang und dünn wird ("vergeilt"), den oberen Teil abschneiden und als Steckling neu einpflanzen.';
  } else if (isOrchid) {
    pruning = 'Nach der Blüte: Den Blütenstiel NICHT sofort abschneiden! Erst wenn er komplett braun und vertrocknet ist, knapp über dem zweiten Auge (Verdickung am Stiel) schneiden. An noch grünen Stielen können neue Blüten entstehen.';
  } else if (isFern) {
    pruning = 'Braune oder vertrocknete Wedel bodennah mit einer Schere abschneiden. Das sieht nicht nur besser aus, sondern gibt der Pflanze auch Kraft für neues Wachstum. Am besten im Frühjahr einen Generalschnitt machen.';
  } else if (isHerb) {
    pruning = 'Regelmäßig ernten! Von oben nach unten ernten, immer oberhalb einer Blattachse schneiden. So verzweigt sich die Pflanze und wird buschiger. Blüten sofort abknipsen, sonst investiert die Pflanze ihre Energie in Samen statt in Blätter.';
  } else if (plant.growth_speed === 'fast') {
    pruning = `Im Frühjahr (März-April) ist die beste Zeit zum Schneiden. Zu lange Triebe einfach mit einer sauberen, scharfen Schere kürzen. Immer knapp über einem Blatt oder einer Blattachse schneiden. Die Pflanze treibt dann buschiger nach. Abgeschnittene Triebe nicht wegwerfen – die meisten lassen sich als Stecklinge verwurzeln!`;
  } else {
    pruning = `Nur bei Bedarf schneiden: Vertrocknete, gelbe oder beschädigte Blätter an der Basis abschneiden. Eine saubere, scharfe Schere verwenden. Im Frühjahr darf auch zurückgeschnitten werden, wenn die Pflanze zu groß wird. Pro-Tipp: Nicht mehr als ein Drittel der Pflanze auf einmal entfernen.`;
  }

  // Repotting
  const repotMonths = plant.repot_frequency_years === 1 ? 'jährlich' : `alle ${plant.repot_frequency_years} Jahre`;
  let repotInstr: string;
  if (isOrchid) {
    repotInstr = `Am besten ${repotMonths} umtopfen, idealerweise im Frühjahr nach der Blüte. So geht's: 1) Pflanze vorsichtig aus dem alten Topf nehmen. 2) Altes Substrat von den Wurzeln lösen. 3) Matschige oder braune Wurzeln mit einer sauberen Schere abschneiden – gesunde Wurzeln sind grün oder silbergrau. 4) In einen durchsichtigen Orchideentopf mit frischem Orchideensubstrat setzen. 5) Erst nach einer Woche leicht gießen.`;
  } else {
    repotInstr = `Am besten ${repotMonths} umtopfen, idealerweise im Frühjahr (März-April). Woran erkennst du, dass es Zeit ist? Wurzeln wachsen aus dem Abflussloch oder die Pflanze kippt leicht um. So geht's: 1) Neuen Topf kaufen, der 2-3 cm größer ist als der alte (mit Abflussloch!). 2) Etwas Erde auf den Boden des neuen Topfes geben. 3) Pflanze vorsichtig aus dem alten Topf nehmen – leicht am Stamm ziehen und gleichzeitig den Topf drücken. 4) Alte Erde vorsichtig von den Wurzeln lösen. 5) In den neuen Topf setzen und mit frischer Erde auffüllen. 6) Gut angießen. 7) Für 1-2 Wochen nicht düngen.`;
  }

  // Propagation
  let propagation: string;
  if (isAroid && plant.growth_speed === 'fast') {
    propagation = 'Stecklinge in Wasser: Einen Trieb mit 2-3 Blättern und mindestens einem Knoten (Verdickung am Stiel, oft mit kleinen Luftwurzeln) abschneiden. In ein Glas mit Wasser stellen, so dass der Knoten unter Wasser ist. An einen hellen Ort stellen. Nach 2-4 Wochen haben sich genug Wurzeln gebildet (mind. 5 cm lang) und der Steckling kann in Erde gepflanzt werden.';
  } else if (isSucculent) {
    propagation = 'Blattstecklinge: Ein gesundes Blatt vorsichtig abdrehen (nicht abschneiden!). 2-3 Tage antrocknen lassen. Dann auf feuchtes Substrat legen (nicht eingraben). An einen hellen Ort stellen und die Erde leicht feucht halten. Nach einigen Wochen bilden sich Wurzeln und eine Mini-Pflanze.';
  } else if (isCactus) {
    propagation = 'Kindel oder Ableger: Wartet bis die Pflanze kleine Ableger bildet. Diese vorsichtig mit einem sauberen Messer abtrennen (Handschuhe!). Die Schnittstelle 3-5 Tage trocknen lassen. Dann in trockenes Kakteensubstrat setzen. Erst nach einer Woche leicht gießen.';
  } else if (isOrchid) {
    propagation = 'Kindel: Manche Orchideen bilden an alten Blütenstielen kleine Ableger (Kindel). Wenn das Kindel eigene Wurzeln von mind. 3 cm hat, kann es abgetrennt und in einen eigenen kleinen Topf mit Orchideensubstrat gesetzt werden. Das braucht Geduld – nicht jede Orchidee bildet Kindel.';
  } else if (isHerb) {
    propagation = 'Stecklinge: Einen 10 cm langen Trieb abschneiden, die unteren Blätter entfernen und in ein Glas Wasser stellen. Nach 1-2 Wochen bilden sich Wurzeln. Dann in einen Topf mit Erde einpflanzen. Funktioniert fast immer und ist die einfachste Methode!';
  } else {
    propagation = `Vermehrung durch ${plant.growth_speed === 'fast' ? 'Stecklinge: Trieb mit 2-3 Blättern abschneiden und in Wasser oder feuchte Erde stecken. An einen hellen, warmen Ort stellen. Nach 3-6 Wochen bilden sich Wurzeln.' : 'Teilung beim Umtopfen: Die Pflanze vorsichtig aus dem Topf nehmen und den Wurzelballen mit den Händen oder einem Messer teilen. Jeden Teil in einen eigenen Topf pflanzen und gut angießen.'}`;
  }

  // Pests
  const pests: string[] = [];
  if (isTropical || isAroid) {
    pests.push('Spinnmilben: Winzige Tierchen, erkennbar an feinen Gespinsten zwischen den Blättern. Pflanze abduschen und Blätter feucht halten. Bei starkem Befall ein Spritzmittel aus dem Gartencenter verwenden.');
    pests.push('Thripse: Silbrige Flecken auf den Blättern und winzige schwarze Punkte. Befallene Blätter abwischen, Pflanze isolieren und mit Neemöl behandeln.');
  }
  if (!isCactus && !isSucculent) {
    pests.push('Trauermücken: Kleine schwarze Fliegen, die um die Erde schwirren. Weniger gießen und Gelbtafeln in die Erde stecken. Sand auf die Erdoberfläche streuen verhindert die Eiablage.');
  }
  if (plant.humidity !== 'high') {
    pests.push('Schildläuse: Braune, festsitzende Erhebungen auf Blättern und Stielen. Mit einem in Alkohol getränkten Wattestäbchen abtupfen. Bei starkem Befall ein Spritzmittel verwenden.');
  }
  if (isCactus || isSucculent) {
    pests.push('Wollläuse: Weiße, watteähnliche Klumpen in Blattachseln. Mit Alkohol-Wattestäbchen entfernen oder mit Neemöl-Lösung besprühen.');
  }

  // Diseases
  const diseases: string[] = [];
  if (plant.water_amount !== 'little') {
    diseases.push('Wurzelfäule: Entsteht durch zu viel Wasser oder fehlende Drainage. Zeichen: Pflanze wird schlaff obwohl die Erde nass ist, Erde riecht muffig. Sofort aus dem Topf nehmen, faule Wurzeln abschneiden, in frische Erde umtopfen.');
  }
  if (isTropical) {
    diseases.push('Pilzbefall auf Blättern: Braune oder schwarze Flecken mit gelbem Rand. Befallene Blätter sofort entfernen, Pflanze trockener halten und für bessere Luftzirkulation sorgen.');
  }
  diseases.push('Blattflecken: Können durch Kalkwasser, direkte Sonne oder Pilze entstehen. Befallene Blätter entfernen und Ursache beheben. Mit kalkarmem Wasser gießen (abgestandenes Leitungswasser oder Regenwasser).');

  // Signs overwatering
  const signs_overwatering = [
    'Gelbe Blätter, die weich und matschig werden',
    'Erde riecht muffig oder faulig',
    'Pflanze wird schlaff obwohl die Erde nass ist',
  ];
  if (isAroid || isTropical) {
    signs_overwatering.push('Braune, matschige Stellen am Stamm oder an den Stielen');
  }
  if (isSucculent || isCactus) {
    signs_overwatering.push('Pflanze wird weich und transparent – dann ist es fast zu spät!');
  }

  // Signs underwatering
  const signs_underwatering = [
    'Blätter hängen schlaff herunter oder rollen sich ein',
    'Erde ist hart, trocken und löst sich vom Topfrand',
    'Blattränder werden braun und trocken',
  ];
  if (isTropical) {
    signs_underwatering.push('Blattspitzen werden braun und knusprig');
  }

  // Winter care
  let winter_care: string;
  if (isSucculent || isCactus) {
    winter_care = `Im Winter (November bis Februar) fast gar nicht gießen – nur alle ${Math.round(plant.water_frequency_days * 2.5)} Tage ein kleiner Schluck. Nicht düngen! Am besten kühl stellen (${Math.max(5, plant.temperature_min)}-15°C), das fördert im Frühjahr die Blüte. Vor kalter Zugluft schützen.`;
  } else if (isTropical) {
    winter_care = `Im Winter weniger gießen (alle ${Math.round(plant.water_frequency_days * 1.5)} Tage) und NICHT düngen. Die trockene Heizungsluft ist ein Problem – regelmäßig die Blätter besprühen oder eine Schale mit Wasser neben die Pflanze stellen. Mindesttemperatur ${plant.temperature_min}°C beachten – nicht direkt neben kalte Fenster oder Heizung stellen!`;
  } else {
    winter_care = `Im Winter weniger gießen (alle ${Math.round(plant.water_frequency_days * 1.5)} Tage statt alle ${plant.water_frequency_days} Tage). Nicht düngen von Oktober bis Februar. Darauf achten, dass die Pflanze nicht an einem zu kalten Ort steht (nicht unter ${plant.temperature_min}°C). Vor Zugluft schützen.`;
  }

  // Summer care
  let summer_care: string;
  if (plant.light === 'direct') {
    summer_care = `Im Sommer regelmäßig alle ${plant.water_frequency_days} Tage gießen und alle ${plant.fertilize_frequency_days} Tage düngen. ${plant.common_name} liebt direkte Sonne und kann auch draußen stehen (Balkon, Terrasse). Aber Vorsicht: Langsam an die Sonne gewöhnen, sonst bekommt sie einen "Sonnenbrand"! Erst ein paar Tage in den Schatten stellen, dann schrittweise mehr Sonne.`;
  } else if (isTropical) {
    summer_care = `Wachstumszeit! Regelmäßig alle ${plant.water_frequency_days} Tage gießen und alle ${plant.fertilize_frequency_days} Tage mit Flüssigdünger düngen (halbe Dosierung reicht bei Anfängern). Die Pflanze wächst jetzt am meisten. Vor direkter Mittagssonne schützen – heller Standort ohne pralle Sonne ist ideal.`;
  } else {
    summer_care = `Im Sommer regelmäßig alle ${plant.water_frequency_days} Tage gießen und alle ${plant.fertilize_frequency_days} Tage mit Flüssigdünger düngen. Am besten einen Standard-Zimmerpflanzendünger aus dem Supermarkt verwenden. Im Wachstum braucht die Pflanze mehr Wasser als im Winter.`;
  }

  // Ideal location
  const lightDesc: Record<string, string> = {
    low: 'einen Platz mit wenig Licht – zum Beispiel ein Nordfenster, ein Raum ohne direktes Sonnenlicht, oder auch eine etwas dunklere Ecke',
    medium: 'einen hellen Platz ohne direkte Sonne – zum Beispiel ein Ost- oder Westfenster, oder 1-2 Meter vom Südfenster entfernt',
    bright: 'einen hellen Standort mit indirektem Licht – zum Beispiel in der Nähe eines Süd- oder Westfensters, aber nicht in der prallen Mittagssonne',
    direct: 'einen sonnigen Platz mit direkter Sonne – zum Beispiel direkt am Südfenster oder auf dem Balkon',
  };
  let ideal_location = `${plant.common_name} braucht ${lightDesc[plant.light]}. `;
  ideal_location += `Die Temperatur sollte zwischen ${plant.temperature_min}°C und ${plant.temperature_max}°C liegen. `;
  if (plant.humidity === 'high') {
    ideal_location += 'Da die Pflanze hohe Luftfeuchtigkeit mag, ist sie perfekt fürs Badezimmer oder die Küche geeignet. Alternativ: Regelmäßig mit Wasser besprühen oder eine Schale mit Wasser neben die Pflanze stellen.';
  } else if (plant.humidity === 'low') {
    ideal_location += 'Die Pflanze kommt auch mit trockener Heizungsluft gut zurecht – perfekt fürs Wohnzimmer, Schlafzimmer oder Büro.';
  } else {
    ideal_location += 'Normale Wohnzimmer-Bedingungen sind ideal. Nicht direkt neben die Heizung stellen.';
  }

  // Common mistakes
  const common_mistakes: string[] = [];
  if (plant.water_amount === 'little') {
    common_mistakes.push('Zu viel gießen! Das ist der häufigste Fehler. Diese Pflanze braucht WENIG Wasser. Im Zweifel lieber noch einen Tag warten.');
  } else {
    common_mistakes.push('Staunässe! Immer überschüssiges Wasser aus dem Untersetzer nach 15 Minuten entfernen. Wurzeln stehen nicht gerne im Wasser.');
  }
  if (plant.light === 'low' || plant.light === 'medium') {
    common_mistakes.push('Direkte Sonne! Diese Pflanze bekommt Sonnenbrand, wenn sie in der prallen Mittagssonne steht. Indirektes Licht ist ideal.');
  }
  if (plant.light === 'direct' || plant.light === 'bright') {
    common_mistakes.push('Zu dunkler Standort! Ohne genug Licht wächst die Pflanze dünn und kränklich ("vergeilt"). Sie braucht einen hellen Platz.');
  }
  if (isTropical) {
    common_mistakes.push('Trockene Heizungsluft im Winter! Besprühe die Blätter regelmäßig oder stelle eine Schale mit Wasser daneben.');
  }
  common_mistakes.push('Topf ohne Abflussloch verwenden! Überschüssiges Wasser muss ablaufen können, sonst faulen die Wurzeln.');
  if (plant.toxic_pets || plant.toxic_children) {
    common_mistakes.push(`In Reichweite von ${plant.toxic_pets && plant.toxic_children ? 'Kindern und Haustieren' : plant.toxic_pets ? 'Haustieren' : 'Kindern'} stellen! Diese Pflanze ist giftig und muss außer Reichweite aufgestellt werden.`);
  }

  // Beginner summary
  let beginner_summary: string;
  if (plant.difficulty === 'easy') {
    beginner_summary = `${plant.common_name} ist perfekt für Anfänger! Alle ${plant.water_frequency_days} Tage gießen, ${lightDesc[plant.light].split('–')[0]} stellen, fertig. ${plant.water_amount === 'little' ? 'Lieber zu wenig als zu viel gießen.' : 'Fingerprobe machen: Erst gießen, wenn die obere Erdschicht trocken ist.'}`;
  } else if (plant.difficulty === 'medium') {
    beginner_summary = `${plant.common_name} braucht etwas mehr Aufmerksamkeit als Anfänger-Pflanzen, ist aber gut machbar. Regelmäßig alle ${plant.water_frequency_days} Tage gießen, ${lightDesc[plant.light].split('–')[0]} stellen und ${plant.humidity === 'high' ? 'für hohe Luftfeuchtigkeit sorgen' : 'Staunässe vermeiden'}.`;
  } else {
    beginner_summary = `${plant.common_name} ist anspruchsvoll – aber mit den richtigen Tipps schaffst du das! Wichtig: ${plant.humidity === 'high' ? 'Hohe Luftfeuchtigkeit, kalkfreies Wasser und' : 'Gleichmäßige Bedingungen und'} keine direkte Sonne. Alle ${plant.water_frequency_days} Tage mit Fingerprobe prüfen ob gegossen werden muss.`;
  }

  return {
    substrate,
    watering_detail,
    pruning,
    repotting: repotInstr,
    propagation,
    pests,
    diseases,
    signs_overwatering,
    signs_underwatering,
    winter_care,
    summer_care,
    ideal_location,
    common_mistakes,
    beginner_summary,
  };
}

/**
 * Manual overrides for specific plants where we want
 * extra-precise or unique care information.
 */
const CARE_OVERRIDES: Record<string, Partial<PlantCareDetails>> = {
  'plant-001': { // Monstera
    substrate: 'Lockere Zimmerpflanzenerde mit 30% Perlite (weiße Kügelchen aus dem Gartencenter) mischen. Das sorgt für gute Drainage. Monsteras haben dicke Wurzeln, die Luft brauchen – deshalb die Erde nicht zu fest andrücken!',
    pruning: 'Im Frühjahr zu lange Triebe mit einer scharfen, sauberen Schere kürzen. Immer knapp über einem Blattknoten (Verdickung am Stiel mit Luftwurzeln) schneiden. Die abgeschnittenen Triebe in Wasser stellen – sie bilden schnell neue Wurzeln! Gelbe oder braune Blätter jederzeit entfernen.',
    propagation: 'Stecklinge in Wasser: Einen Trieb mit mindestens einem Blatt und einem Knoten (Verdickung am Stiel, oft mit brauner Luftwurzel) abschneiden. In ein Glas mit Wasser stellen, der Knoten muss unter Wasser sein. An einen hellen Ort stellen, Wasser wöchentlich wechseln. Nach 3-4 Wochen hat der Steckling genug Wurzeln (mind. 5 cm) und kann in Erde gepflanzt werden. Funktioniert fast immer!',
    beginner_summary: 'Die Monstera ist die perfekte Anfängerpflanze! Einmal pro Woche gießen, an einen hellen Platz ohne direkte Sonne stellen und gelegentlich die Blätter abstauben. Sie verzeiht kleine Fehler und zeigt dir durch gelbe Blätter (zu viel Wasser) oder braune Spitzen (zu wenig Feuchtigkeit), was sie braucht.',
  },
  'plant-002': { // Efeutute
    propagation: 'Super einfach! Einen Trieb mit 3-4 Blättern abschneiden, die unteren 1-2 Blätter entfernen. In ein Glas Wasser stellen – nach 1-2 Wochen siehst du schon Wurzeln! Wenn die Wurzeln 5 cm lang sind, in einen kleinen Topf mit Erde pflanzen. Du kannst auch mehrere Stecklinge zusammen einpflanzen für eine buschigere Pflanze.',
    beginner_summary: 'Die Efeutute ist quasi unkaputtbar! Einmal pro Woche gießen, irgendwo hinstellen wo es nicht stockfinster ist – fertig. Sie wächst auch in Wasser ohne Erde. Perfekt für Leute, die noch nie eine Pflanze hatten.',
  },
  'plant-003': { // Bogenhanf
    watering_detail: 'Der Bogenhanf ist der Kamel unter den Pflanzen – er speichert Wasser in seinen dicken Blättern! Nur alle 2-3 Wochen gießen, im Winter sogar nur einmal im Monat. Fingerprobe: Die Erde muss komplett trocken sein bevor du gießt. Zu viel Wasser ist der einzige Weg, diese Pflanze umzubringen!',
    beginner_summary: 'Der Bogenhanf ist praktisch unzerstörbar. Alle 2-3 Wochen ein bisschen Wasser, steht überall (auch in dunklen Ecken), und produziert sogar nachts Sauerstoff – perfekt fürs Schlafzimmer! Einzige Regel: WENIGER gießen ist immer besser als mehr.',
  },
  'plant-008': { // Orchidee
    watering_detail: 'NICHT einfach draufgießen! Orchideen werden getaucht: Den ganzen Topf für 10-15 Minuten in eine Schüssel mit lauwarmem Wasser stellen. Danach gut abtropfen lassen (mindestens 10 Minuten). Das Wasser darf NICHT in den Blattachseln stehen bleiben – das führt zu Fäulnis! Einmal pro Woche tauchen, im Winter alle 10-14 Tage.',
    repotting: 'Alle 2 Jahre umtopfen, am besten im Frühjahr nach der Blüte. WICHTIG: Nur spezielle Orchideenerde verwenden (grobe Rindenstücke)! So geht\'s: 1) Pflanze vorsichtig aus dem Topf nehmen. 2) Altes Substrat von den Wurzeln lösen – unter fließendem Wasser geht das am besten. 3) Matschige braune Wurzeln mit einer sauberen Schere abschneiden. Gesunde Wurzeln sind grün (nass) oder silbergrau (trocken). 4) In einen durchsichtigen Orchideentopf setzen (Wurzeln brauchen Licht!). 5) Mit frischem Orchideensubstrat auffüllen. 6) Erst nach einer Woche das erste Mal tauchen.',
    beginner_summary: 'Orchideen sind einfacher als ihr Ruf! Einmal pro Woche in Wasser tauchen (nicht gießen!), hell stellen ohne direkte Sonne, und sie blühen monatelang. Wenn die Blüten abfallen, nicht wegwerfen – sie blühen wieder!',
  },
  'plant-009': { // Zamioculcas
    beginner_summary: 'Die Zamioculcas ist die perfekte "Ich-vergesse-immer-zu-gießen"-Pflanze. Alle 2-3 Wochen ein Schluck Wasser reicht. Steht auch in dunklen Ecken. Überlebt sogar wochenlange Abwesenheit. Die einzige Gefahr: zu VIEL Wasser.',
  },
  'plant-010': { // Calathea
    watering_detail: 'Alle 3-4 Tage gießen, aber NIEMALS mit normalem Leitungswasser! Calatheas reagieren empfindlich auf Kalk und Chlor. Am besten: Leitungswasser einen Tag stehen lassen oder Regenwasser sammeln. Die Erde sollte immer leicht feucht sein, aber nie nass. Zusätzlich täglich mit kalkarmem Wasser besprühen!',
    beginner_summary: 'Die Calathea ist eine Diva – aber eine schöne! Sie braucht kalkarmes Wasser, hohe Luftfeuchtigkeit und keine direkte Sonne. Dafür belohnt sie dich mit den spektakulärsten Blattmustern aller Zimmerpflanzen. Am besten fürs Badezimmer geeignet.',
  },
  'plant-012': { // Ufopflanze
    propagation: 'Die einfachste Vermehrung überhaupt! Ufopflanzen bilden ständig kleine Ableger (Babys) am Stamm und aus der Erde. Warte bis der Ableger 3-4 eigene Blätter hat, dann vorsichtig mit einem Messer abtrennen. Direkt in einen kleinen Topf mit Erde pflanzen und feucht halten. Fertig! Perfekte Geschenke für Freunde.',
  },
  'plant-017': { // Grünlilie
    beginner_summary: 'Die Grünlilie ist der Klassiker – nahezu unzerstörbar, reinigt die Luft und macht ständig Babys (Kindel), die du verschenken kannst. Einmal pro Woche gießen, an einen hellen Platz stellen, fertig. Ungiftig für Kinder und Haustiere!',
    propagation: 'Kinderleicht! Die Grünlilie bildet lange Ausläufer mit kleinen Pflänzchen (Kindeln) daran. Einfach ein Kindel mit Wurzelansätzen abschneiden und in einen kleinen Topf mit feuchter Erde setzen. Alternativ: Das Kindel in ein Glas Wasser stellen bis sich Wurzeln gebildet haben.',
  },
};

/**
 * Get the complete care details for a plant species.
 * Uses generated defaults enriched with manual overrides for popular plants.
 */
export function getCareDetails(plant: PlantSpecies): PlantCareDetails {
  const generated = generateCareDetails(plant);
  const overrides = CARE_OVERRIDES[plant.id];

  if (overrides) {
    return { ...generated, ...overrides };
  }

  return generated;
}

/**
 * Enrich a plant species array with care_details.
 * Call this once to add care_details to all plants.
 */
export function enrichPlantsWithCareDetails(plants: PlantSpecies[]): PlantSpecies[] {
  return plants.map(plant => ({
    ...plant,
    care_details: getCareDetails(plant),
  }));
}
