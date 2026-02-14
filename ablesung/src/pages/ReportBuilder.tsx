import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Eye, Plus, Trash2, GripVertical, Printer } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS,
  calculateAnnualConsumption, calculateCost, formatNumber, formatEuro,
} from '@/types/database';
import { format, subMonths, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

interface ReportSection {
  id: string;
  type: 'summary' | 'consumption' | 'costs' | 'meters' | 'readings' | 'benchmark';
  label: string;
  enabled: boolean;
}

const defaultSections: ReportSection[] = [
  { id: '1', type: 'summary', label: 'Zusammenfassung', enabled: true },
  { id: '2', type: 'consumption', label: 'Verbrauchsdaten', enabled: true },
  { id: '3', type: 'costs', label: 'Kostenaufstellung', enabled: true },
  { id: '4', type: 'meters', label: 'Zählerübersicht', enabled: true },
  { id: '5', type: 'readings', label: 'Letzte Ablesungen', enabled: true },
  { id: '6', type: 'benchmark', label: 'Benchmark-Vergleich', enabled: false },
];

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [sections, setSections] = useState<ReportSection[]>(defaultSections);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [reportTitle, setReportTitle] = useState(`Energiebericht ${format(new Date(), 'MMMM yyyy', { locale: de })}`);
  const [showPreview, setShowPreview] = useState(false);
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const printRef = useRef<HTMLDivElement>(null);

  // Report data
  const reportData = useMemo(() => {
    const filteredBuildings = filterBuilding === 'all' ? buildings : buildings.filter(b => b.id === filterBuilding);
    const allMeters = filteredBuildings.flatMap(b => [
      ...(b.meters || []).map(m => ({ ...m, buildingName: b.name })),
      ...b.units.flatMap(u => u.meters.map(m => ({ ...m, buildingName: b.name }))),
    ]);

    const consumptionByType: Record<string, { consumption: number; cost: number; count: number }> = {};
    allMeters.forEach(m => {
      const annual = calculateAnnualConsumption(m.readings) || 0;
      if (!consumptionByType[m.meter_type]) consumptionByType[m.meter_type] = { consumption: 0, cost: 0, count: 0 };
      consumptionByType[m.meter_type].consumption += annual;
      consumptionByType[m.meter_type].cost += calculateCost(annual, m.meter_type);
      consumptionByType[m.meter_type].count++;
    });

    const totalCost = Object.values(consumptionByType).reduce((s, d) => s + d.cost, 0);

    const recentReadings = allMeters.flatMap(m =>
      m.readings.slice(0, 3).map(r => ({
        building: m.buildingName,
        type: METER_TYPE_LABELS[m.meter_type],
        number: m.meter_number,
        value: r.reading_value,
        unit: METER_TYPE_UNITS[m.meter_type],
        date: r.reading_date,
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

    return {
      buildingCount: filteredBuildings.length,
      meterCount: allMeters.length,
      consumptionByType,
      totalCost,
      recentReadings,
      buildings: filteredBuildings,
    };
  }, [buildings, filterBuilding]);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // Export CSV
  const exportCSV = () => {
    const lines: string[] = [];
    lines.push(`"${reportTitle}"`);
    lines.push(`"Zeitraum: ${dateFrom} bis ${dateTo}"`);
    lines.push('');

    if (sections.find(s => s.type === 'consumption' && s.enabled)) {
      lines.push('"Zählertyp";"Verbrauch";"Einheit";"Kosten"');
      Object.entries(reportData.consumptionByType).forEach(([type, data]) => {
        lines.push(`"${METER_TYPE_LABELS[type as MeterType]}";"${data.consumption}";"${METER_TYPE_UNITS[type as MeterType]}";"${data.cost}"`);
      });
      lines.push(`"";"";"";"Gesamt: ${reportData.totalCost}"`);
    }

    if (sections.find(s => s.type === 'readings' && s.enabled)) {
      lines.push('');
      lines.push('"Gebäude";"Typ";"Nr.";"Wert";"Einheit";"Datum"');
      reportData.recentReadings.forEach(r => {
        lines.push(`"${r.building}";"${r.type}";"${r.number}";"${r.value}";"${r.unit}";"${r.date}"`);
      });
    }

    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bericht_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Report-Builder</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />Drucken
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Report Config */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bericht konfigurieren</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Titel</Label>
                <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Von</Label>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Bis</Label>
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Gebäude</Label>
                <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Gebäude</SelectItem>
                    {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Abschnitte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map(s => (
                <div key={s.id} className="flex items-center justify-between py-1">
                  <span className="text-sm">{s.label}</span>
                  <Switch checked={s.enabled} onCheckedChange={() => toggleSection(s.id)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />Vorschau anzeigen
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" className="mb-4" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />Zurück zur Konfiguration
          </Button>

          {/* Report Preview */}
          <div ref={printRef} className="space-y-4 print:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{reportTitle}</h2>
              <p className="text-sm text-muted-foreground">
                Zeitraum: {format(new Date(dateFrom), 'dd.MM.yyyy', { locale: de })} - {format(new Date(dateTo), 'dd.MM.yyyy', { locale: de })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Erstellt am {format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}
              </p>
            </div>

            {sections.filter(s => s.enabled).map(section => (
              <Card key={section.id} className="break-inside-avoid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{section.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.type === 'summary' && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{reportData.buildingCount}</p>
                        <p className="text-xs text-muted-foreground">Gebäude</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{reportData.meterCount}</p>
                        <p className="text-xs text-muted-foreground">Zähler</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{formatEuro(reportData.totalCost)}</p>
                        <p className="text-xs text-muted-foreground">Jahreskosten</p>
                      </div>
                    </div>
                  )}

                  {section.type === 'consumption' && (
                    <div className="space-y-2">
                      {Object.entries(reportData.consumptionByType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                          <span className="text-sm">{METER_TYPE_LABELS[type as MeterType]} ({data.count}x)</span>
                          <span className="text-sm font-medium">{formatNumber(data.consumption)} {METER_TYPE_UNITS[type as MeterType]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'costs' && (
                    <div className="space-y-2">
                      {Object.entries(reportData.consumptionByType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                          <span className="text-sm">{METER_TYPE_LABELS[type as MeterType]}</span>
                          <span className="text-sm font-medium">{formatEuro(data.cost)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 font-bold">
                        <span className="text-sm">Gesamt</span>
                        <span className="text-sm text-primary">{formatEuro(reportData.totalCost)}</span>
                      </div>
                    </div>
                  )}

                  {section.type === 'meters' && (
                    <div className="space-y-2">
                      {reportData.buildings.map(b => (
                        <div key={b.id}>
                          <p className="text-sm font-medium mb-1">{b.name}</p>
                          <div className="pl-3 space-y-1">
                            {[...(b.meters || []), ...b.units.flatMap(u => u.meters)].map(m => (
                              <p key={m.id} className="text-xs text-muted-foreground">
                                {METER_TYPE_LABELS[m.meter_type]} | Nr. {m.meter_number}
                                {m.lastReading && ` | Stand: ${m.lastReading.reading_value.toLocaleString('de-DE')} ${METER_TYPE_UNITS[m.meter_type]}`}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'readings' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1">Datum</th>
                            <th className="text-left py-1">Gebäude</th>
                            <th className="text-left py-1">Typ</th>
                            <th className="text-right py-1">Wert</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.recentReadings.map((r, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-1">{format(new Date(r.date), 'dd.MM.yy', { locale: de })}</td>
                              <td className="py-1">{r.building}</td>
                              <td className="py-1">{r.type}</td>
                              <td className="py-1 text-right">{r.value.toLocaleString('de-DE')} {r.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === 'benchmark' && (
                    <p className="text-sm text-muted-foreground">Benchmark-Daten werden in der Verbrauchsauswertung berechnet.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
