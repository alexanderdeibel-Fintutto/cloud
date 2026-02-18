import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode, Check, Building2, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import { MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, MeterWithReadings } from '@/types/database';
import { QRCodeSVG } from 'qrcode.react';
import { MeterIcon } from '@/components/meters/MeterIcon';

interface MeterLabel {
  meterId: string;
  meterNumber: string;
  meterType: MeterType;
  buildingName: string;
  unitNumber?: string;
  location: string;
}

export default function MeterQRCodeGenerator() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMeters, setSelectedMeters] = useState<Set<string>>(new Set());
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showDetails, setShowDetails] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  // Collect all meters with context
  const allLabels = useMemo((): MeterLabel[] => {
    const labels: MeterLabel[] = [];
    buildings.forEach(b => {
      // Building-level meters
      (b.meters || []).forEach(m => {
        labels.push({
          meterId: m.id,
          meterNumber: m.meter_number,
          meterType: m.meter_type,
          buildingName: b.name,
          location: b.address || b.name,
        });
      });
      // Unit-level meters
      b.units.forEach(u => {
        u.meters.forEach(m => {
          labels.push({
            meterId: m.id,
            meterNumber: m.meter_number,
            meterType: m.meter_type,
            buildingName: b.name,
            unitNumber: u.unit_number,
            location: `${b.name} - ${u.unit_number}`,
          });
        });
      });
    });
    return labels;
  }, [buildings]);

  // Filter meters
  const filteredLabels = useMemo(() => {
    return allLabels.filter(l => {
      if (filterBuilding !== 'all') {
        const building = buildings.find(b => b.id === filterBuilding);
        if (building && l.buildingName !== building.name) return false;
      }
      if (filterType !== 'all' && l.meterType !== filterType) return false;
      return true;
    });
  }, [allLabels, filterBuilding, filterType, buildings]);

  const toggleMeter = (meterId: string) => {
    setSelectedMeters(prev => {
      const next = new Set(prev);
      if (next.has(meterId)) next.delete(meterId);
      else next.add(meterId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedMeters(new Set(filteredLabels.map(l => l.meterId)));
  };

  const deselectAll = () => {
    setSelectedMeters(new Set());
  };

  const metersToprint = filteredLabels.filter(l => selectedMeters.has(l.meterId));

  // Generate QR data for meter
  const getQRData = (label: MeterLabel): string => {
    return JSON.stringify({
      nr: label.meterNumber,
      typ: label.meterType,
      ort: label.location,
    });
  };

  const sizeConfig = {
    small: { qr: 64, card: 'w-[180px] h-[100px]', text: 'text-[8px]', title: 'text-[10px]' },
    medium: { qr: 96, card: 'w-[240px] h-[140px]', text: 'text-[9px]', title: 'text-xs' },
    large: { qr: 128, card: 'w-[300px] h-[180px]', text: 'text-xs', title: 'text-sm' },
  };

  const cfg = sizeConfig[labelSize];

  const handlePrint = () => {
    window.print();
  };

  // Unique meter types for filter
  const availableTypes = [...new Set(allLabels.map(l => l.meterType))];

  return (
    <AppLayout>
      <div className="print:hidden">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Zurück
        </Button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Zähler-QR-Codes
          </h1>
          {metersToprint.length > 0 && (
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />{metersToprint.length} drucken
            </Button>
          )}
        </div>

        {/* Configuration */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <Label className="text-xs">Zählertyp</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    {availableTypes.map(t => <SelectItem key={t} value={t}>{METER_TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Labelgröße</Label>
                <Select value={labelSize} onValueChange={v => setLabelSize(v as 'small' | 'medium' | 'large')}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Klein (45x25mm)</SelectItem>
                    <SelectItem value="medium">Mittel (60x35mm)</SelectItem>
                    <SelectItem value="large">Groß (75x45mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-5">
                <Label className="text-xs">Details anzeigen</Label>
                <Switch checked={showDetails} onCheckedChange={setShowDetails} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meter Selection */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Zähler auswählen ({selectedMeters.size}/{filteredLabels.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll} className="text-xs h-7">Alle</Button>
                <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs h-7">Keine</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {filteredLabels.map(label => (
                <div
                  key={label.meterId}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selectedMeters.has(label.meterId) ? 'bg-primary/5' : 'hover:bg-accent/50'}`}
                  onClick={() => toggleMeter(label.meterId)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selectedMeters.has(label.meterId) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                    {selectedMeters.has(label.meterId) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <MeterIcon meterType={label.meterType} className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{label.meterNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">{METER_TYPE_LABELS[label.meterType]} | {label.location}</p>
                  </div>
                </div>
              ))}
              {filteredLabels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Keine Zähler gefunden.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Print Preview (visible on screen) */}
        {metersToprint.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 justify-center">
                {metersToprint.slice(0, 4).map(label => (
                  <div key={label.meterId} className={`${cfg.card} border rounded-lg p-2 flex items-center gap-2`}>
                    <QRCodeSVG value={getQRData(label)} size={cfg.qr} level="M" />
                    <div className="flex-1 min-w-0">
                      <p className={`${cfg.title} font-bold truncate`}>{label.meterNumber}</p>
                      {showDetails && (
                        <>
                          <p className={`${cfg.text} text-muted-foreground truncate`}>{METER_TYPE_LABELS[label.meterType]}</p>
                          <p className={`${cfg.text} text-muted-foreground truncate`}>{label.buildingName}</p>
                          {label.unitNumber && <p className={`${cfg.text} text-muted-foreground truncate`}>{label.unitNumber}</p>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {metersToprint.length > 4 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  +{metersToprint.length - 4} weitere Labels
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print-only content */}
      <div ref={printRef} className="hidden print:block">
        <div className="flex flex-wrap gap-1">
          {metersToprint.map(label => (
            <div key={label.meterId} className={`${cfg.card} border border-black rounded p-2 flex items-center gap-2 break-inside-avoid`}>
              <QRCodeSVG value={getQRData(label)} size={cfg.qr} level="M" />
              <div className="flex-1 min-w-0">
                <p className={`${cfg.title} font-bold truncate`}>{label.meterNumber}</p>
                {showDetails && (
                  <>
                    <p className={`${cfg.text} truncate`}>{METER_TYPE_LABELS[label.meterType]}</p>
                    <p className={`${cfg.text} truncate`}>{label.buildingName}</p>
                    {label.unitNumber && <p className={`${cfg.text} truncate`}>{label.unitNumber}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
