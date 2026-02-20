import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Lightbulb, Zap, TrendingDown, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS,
  CONSUMPTION_BENCHMARKS, calculateAnnualConsumption, calculateCost, formatNumber, formatEuro,
  getEfficiencyGrade,
} from '@/types/database';
import { subMonths, isAfter, isBefore } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Pre-built responses based on data analysis
function generateResponse(question: string, context: EnergyContext): string {
  const q = question.toLowerCase();

  if (q.includes('spar') || q.includes('reduz') || q.includes('senk') || q.includes('tipp')) {
    return generateSavingsTips(context);
  }
  if (q.includes('verbrauch') || q.includes('strom') || q.includes('kwh')) {
    return generateConsumptionAnalysis(context);
  }
  if (q.includes('kosten') || q.includes('geld') || q.includes('euro') || q.includes('preis')) {
    return generateCostAnalysis(context);
  }
  if (q.includes('solar') || q.includes('pv') || q.includes('photovoltaik')) {
    return generateSolarAdvice(context);
  }
  if (q.includes('benchmark') || q.includes('vergleich') || q.includes('durchschnitt')) {
    return generateBenchmarkComparison(context);
  }
  if (q.includes('wärmepumpe') || q.includes('heizung') || q.includes('gas')) {
    return generateHeatingAdvice(context);
  }
  if (q.includes('wasser')) {
    return generateWaterAdvice(context);
  }

  // Default comprehensive overview
  return generateOverview(context);
}

interface EnergyContext {
  totalMeters: number;
  totalBuildings: number;
  consumptionByType: Record<string, { annual: number; cost: number; prevYear: number }>;
  totalCost: number;
  hasPV: boolean;
  pvProduction: number;
  highConsumers: string[];
  efficiencyGrades: { building: string; grade: string; perSqm: number }[];
}

function generateOverview(ctx: EnergyContext): string {
  let msg = `Hier ist Ihre Energieübersicht:\n\n`;
  msg += `📊 **${ctx.totalMeters} Zähler** in ${ctx.totalBuildings} Gebäude(n)\n`;
  msg += `💰 **Geschätzte Jahreskosten: ${formatEuro(ctx.totalCost)}**\n\n`;

  Object.entries(ctx.consumptionByType).forEach(([type, data]) => {
    msg += `• ${METER_TYPE_LABELS[type as MeterType]}: ${formatNumber(data.annual)} ${METER_TYPE_UNITS[type as MeterType]}/Jahr (${formatEuro(data.cost)})\n`;
  });

  if (ctx.highConsumers.length > 0) {
    msg += `\n⚠️ **Auffällig hoher Verbrauch:** ${ctx.highConsumers.join(', ')}\n`;
  }

  msg += `\nFragen Sie mich z.B.:\n• "Wie kann ich Strom sparen?"\n• "Wie stehe ich im Benchmark?"\n• "Lohnt sich Solar für mich?"`;
  return msg;
}

function generateSavingsTips(ctx: EnergyContext): string {
  let msg = `💡 **Ihre persönlichen Spartipps:**\n\n`;
  const tips: string[] = [];

  if (ctx.consumptionByType['electricity']) {
    const annual = ctx.consumptionByType['electricity'].annual;
    tips.push(`🔌 **Standby eliminieren:** ~${formatNumber(annual * 0.05)} kWh/Jahr einsparen (${formatEuro(annual * 0.05 * 0.35)})`);
    tips.push(`💡 **LED-Beleuchtung:** ~${formatNumber(annual * 0.10)} kWh/Jahr einsparen (${formatEuro(annual * 0.10 * 0.35)})`);
    if (annual > 3500) {
      tips.push(`🏷️ **Energieeffiziente Geräte (A+++):** Bis zu ${formatEuro(annual * 0.20 * 0.35)}/Jahr sparen`);
    }
  }

  if (ctx.consumptionByType['gas'] || ctx.consumptionByType['heating']) {
    tips.push(`🌡️ **Raumtemperatur senken:** Jedes Grad weniger spart ~6% Heizkosten`);
    tips.push(`🪟 **Stoßlüften statt Kipplüften:** Spart bis zu 15% Heizenergie`);
  }

  if (ctx.consumptionByType['water_hot']) {
    tips.push(`🚿 **Sparduschkopf:** Reduziert Warmwasser um bis zu 30%`);
  }

  if (tips.length === 0) {
    msg += `Noch nicht genug Daten für personalisierte Tipps. Erfassen Sie regelmäßig Zählerstände!`;
  } else {
    msg += tips.join('\n\n');
    const potentialSaving = ctx.totalCost * 0.15;
    msg += `\n\n📈 **Geschätztes Gesamteinsparpotenzial: ${formatEuro(potentialSaving)}/Jahr** (bei Umsetzung aller Maßnahmen)`;
  }

  return msg;
}

function generateConsumptionAnalysis(ctx: EnergyContext): string {
  let msg = `📊 **Verbrauchsanalyse:**\n\n`;

  Object.entries(ctx.consumptionByType).forEach(([type, data]) => {
    const change = data.prevYear > 0 ? ((data.annual - data.prevYear) / data.prevYear * 100) : null;
    msg += `**${METER_TYPE_LABELS[type as MeterType]}:** ${formatNumber(data.annual)} ${METER_TYPE_UNITS[type as MeterType]}/Jahr`;
    if (change !== null) {
      msg += ` (${change > 0 ? '+' : ''}${formatNumber(change, 1)}% vs. Vorjahr ${change > 5 ? '⬆️' : change < -5 ? '⬇️' : '➡️'})`;
    }
    msg += '\n';
  });

  if (ctx.highConsumers.length > 0) {
    msg += `\n⚠️ Überdurchschnittlich: ${ctx.highConsumers.join(', ')}`;
  }

  return msg;
}

function generateCostAnalysis(ctx: EnergyContext): string {
  let msg = `💰 **Kostenanalyse:**\n\n`;
  msg += `**Geschätzte Jahreskosten: ${formatEuro(ctx.totalCost)}**\n`;
  msg += `(Monatlich: ~${formatEuro(Math.round(ctx.totalCost / 12))})\n\n`;

  const sorted = Object.entries(ctx.consumptionByType).sort((a, b) => b[1].cost - a[1].cost);
  sorted.forEach(([type, data], i) => {
    const pct = ctx.totalCost > 0 ? Math.round(data.cost / ctx.totalCost * 100) : 0;
    msg += `${i + 1}. ${METER_TYPE_LABELS[type as MeterType]}: **${formatEuro(data.cost)}** (${pct}%)\n`;
  });

  msg += `\n💡 Tipp: Nutzen Sie den Tarif-Manager (/tariffs), um günstigere Tarife zu vergleichen.`;
  return msg;
}

function generateSolarAdvice(ctx: EnergyContext): string {
  if (ctx.hasPV) {
    return `☀️ **Ihre PV-Anlage:**\n\nJahresproduktion: ${formatNumber(ctx.pvProduction)} kWh\n\nTipp: Besuchen Sie das Solar-Dashboard für detaillierte Analysen, Amortisationsrechner und 48h-Ertragsprognose.`;
  }

  const stromkosten = ctx.consumptionByType['electricity']?.cost || 0;
  if (stromkosten > 500) {
    return `☀️ **Solar-Potenzial:**\n\nBei ${formatEuro(stromkosten)} Stromkosten/Jahr lohnt sich eine PV-Anlage definitiv!\n\n• **Balkonkraftwerk (800W):** ~${formatEuro(750 * 0.35)}/Jahr Ersparnis, Amortisation in ~2 Jahren\n• **Dach-PV (5 kWp):** ~${formatEuro(5000 * 0.30 * 0.35)}/Jahr, Amortisation in ~8-10 Jahren\n\nTipp: Nutzen Sie den Amortisationsrechner im Solar-Dashboard!`;
  }

  return `☀️ Eine PV-Analyse ist ohne Stromverbrauchsdaten schwierig. Erfassen Sie zunächst regelmäßig Ihren Stromverbrauch.`;
}

function generateBenchmarkComparison(ctx: EnergyContext): string {
  let msg = `📏 **Benchmark-Vergleich:**\n\n`;

  if (ctx.efficiencyGrades.length > 0) {
    ctx.efficiencyGrades.forEach(eg => {
      msg += `**${eg.building}:** Effizienzklasse **${eg.grade}** (${eg.perSqm} kWh/m²/Jahr)\n`;
    });
    msg += `\n(Bundesdurchschnitt: 130 kWh/m²/Jahr)`;
  } else {
    msg += `Noch keine Gebäudeflächen hinterlegt. Tragen Sie die Fläche ein, um einen Benchmark zu berechnen.`;
  }

  return msg;
}

function generateHeatingAdvice(ctx: EnergyContext): string {
  const gas = ctx.consumptionByType['gas'];
  const heating = ctx.consumptionByType['heating'];
  if (!gas && !heating) return `🌡️ Keine Heizungsdaten vorhanden. Legen Sie Gas- oder Heizungszähler an.`;

  let msg = `🌡️ **Heizungsanalyse:**\n\n`;
  if (gas) msg += `Gasverbrauch: ${formatNumber(gas.annual)} kWh/Jahr (${formatEuro(gas.cost)})\n`;
  if (heating) msg += `Heizung: ${formatNumber(heating.annual)} kWh/Jahr (${formatEuro(heating.cost)})\n`;
  msg += `\n**Tipps:**\n• Hydraulischer Abgleich: 10-15% Ersparnis\n• Vorlauftemperatur senken: 5-10% Ersparnis\n• Heizkörper nicht zustellen\n• Nachtabsenkung nutzen`;
  return msg;
}

function generateWaterAdvice(ctx: EnergyContext): string {
  const cold = ctx.consumptionByType['water_cold'];
  const hot = ctx.consumptionByType['water_hot'];
  if (!cold && !hot) return `💧 Keine Wasserdaten vorhanden.`;

  let msg = `💧 **Wasseranalyse:**\n\n`;
  if (cold) msg += `Kaltwasser: ${formatNumber(cold.annual)} m³/Jahr\n`;
  if (hot) msg += `Warmwasser: ${formatNumber(hot.annual)} m³/Jahr\n`;
  msg += `\n(Durchschnitt Deutschland: ~120 Liter/Person/Tag)\n\n**Tipps:**\n• Sparduschkopf: -30% Warmwasser\n• Eco-Programme bei Waschmaschine/Spülmaschine\n• Tropfende Wasserhähne sofort reparieren`;
  return msg;
}

export default function EnergyChat() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Build context from user data
  const context = useMemo<EnergyContext>(() => {
    const allMeters = buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]);
    const consumptionByType: Record<string, { annual: number; cost: number; prevYear: number }> = {};

    const now = new Date();
    const oneYearAgo = subMonths(now, 12);
    const twoYearsAgo = subMonths(now, 24);

    allMeters.forEach(m => {
      const type = m.meter_type;
      if (!consumptionByType[type]) consumptionByType[type] = { annual: 0, cost: 0, prevYear: 0 };

      const sorted = [...m.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
      const current = sorted.filter(r => isAfter(new Date(r.reading_date), oneYearAgo));
      if (current.length >= 2) {
        const c = current[current.length - 1].reading_value - current[0].reading_value;
        consumptionByType[type].annual += Math.max(0, c);
        consumptionByType[type].cost += calculateCost(Math.max(0, c), type as MeterType);
      }
      const prev = sorted.filter(r => isAfter(new Date(r.reading_date), twoYearsAgo) && isBefore(new Date(r.reading_date), oneYearAgo));
      if (prev.length >= 2) {
        consumptionByType[type].prevYear += Math.max(0, prev[prev.length - 1].reading_value - prev[0].reading_value);
      }
    });

    const highConsumers: string[] = [];
    allMeters.forEach(m => {
      const annual = calculateAnnualConsumption(m.readings);
      if (annual) {
        const benchmark = CONSUMPTION_BENCHMARKS.find(b => b.meter_type === m.meter_type);
        if (benchmark && annual > benchmark.annual_consumption_high) {
          highConsumers.push(METER_TYPE_LABELS[m.meter_type]);
        }
      }
    });

    const efficiencyGrades = buildings.map(b => {
      const area = b.total_area || 0;
      if (area === 0) return null;
      const total = [...(b.meters || []), ...b.units.flatMap(u => u.meters)].reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
      const perSqm = Math.round(total / area);
      return { building: b.name, grade: getEfficiencyGrade(perSqm, 130), perSqm };
    }).filter(Boolean) as EnergyContext['efficiencyGrades'];

    const pvMeters = allMeters.filter(m => m.meter_type === 'pv_production');
    const pvProduction = pvMeters.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);

    return {
      totalMeters: allMeters.length,
      totalBuildings: buildings.length,
      consumptionByType,
      totalCost: Object.values(consumptionByType).reduce((s, d) => s + d.cost, 0),
      hasPV: pvMeters.length > 0,
      pvProduction,
      highConsumers: [...new Set(highConsumers)],
      efficiencyGrades,
    };
  }, [buildings]);

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hallo! Ich bin Ihr **Energieberater** 🔋\n\nIch analysiere Ihre Verbrauchsdaten und gebe personalisierte Empfehlungen.\n\n${context.totalMeters > 0 ? `Ich sehe ${context.totalMeters} Zähler mit geschätzten Jahreskosten von ${formatEuro(context.totalCost)}.` : 'Erfassen Sie zunächst Zähler und Ablesungen.'}\n\nWie kann ich Ihnen helfen?`,
        timestamp: new Date(),
      }]);
    }
  }, []);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Simulate thinking delay
    setTimeout(() => {
      const response = generateResponse(userMsg.content, context);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() }]);
      setThinking(false);
    }, 800);
  };

  // Auto-scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const suggestions = ['Wie kann ich sparen?', 'Verbrauchsanalyse', 'Lohnt sich Solar?', 'Kostenübersicht'];

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-3">Energieberater</h1>

      {/* Chat Container */}
      <div ref={chatRef} className="space-y-3 mb-3 max-h-[55vh] overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-accent rounded-bl-md'
            }`}>
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
              }} />
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-accent rounded-2xl rounded-bl-md px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {suggestions.map(s => (
            <Button key={s} variant="outline" size="sm" className="text-xs rounded-full" onClick={() => { setInput(s); }}>
              {s}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Frage stellen..."
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={thinking}
          className="rounded-full"
        />
        <Button size="icon" onClick={send} disabled={!input.trim() || thinking} className="rounded-full shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </AppLayout>
  );
}
