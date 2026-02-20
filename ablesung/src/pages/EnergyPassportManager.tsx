import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Printer, Building2, Flame, Zap,
  Leaf, TrendingDown, TrendingUp, Minus, Plus, Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS,
  calculateAnnualConsumption, calculateCost, getEfficiencyGrade, formatNumber, formatEuro,
} from '@/types/database';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// GEG (Gebäudeenergiegesetz) Energieausweis-Klassen
const ENERGY_CLASSES = [
  { grade: 'A+', max: 30, color: '#00843d' },
  { grade: 'A', max: 50, color: '#4caf50' },
  { grade: 'B', max: 75, color: '#8bc34a' },
  { grade: 'C', max: 100, color: '#cddc39' },
  { grade: 'D', max: 130, color: '#ffeb3b' },
  { grade: 'E', max: 160, color: '#ff9800' },
  { grade: 'F', max: 200, color: '#ff5722' },
  { grade: 'G', max: 250, color: '#f44336' },
  { grade: 'H', max: Infinity, color: '#b71c1c' },
];

// Primärenergiefaktoren nach GEG
const PRIMARY_ENERGY_FACTORS: Record<string, number> = {
  gas: 1.1,
  oil: 1.1,
  district_heating: 0.7,
  electricity: 1.8,
  heat_pump: 1.8,
  pellets: 0.2,
  lpg: 1.1,
  heating: 1.0,
};

// CO2 Emissionsfaktoren (kg/kWh)
const CO2_FACTORS: Record<string, number> = {
  gas: 0.201,
  oil: 0.266,
  district_heating: 0.12,
  electricity: 0.42,
  heat_pump: 0.42,
  pellets: 0.036,
  lpg: 0.227,
  heating: 0.201,
};

interface EnergyPassport {
  id: string;
  buildingId: string;
  buildingName: string;
  address: string;
  yearBuilt: number;
  area: number;
  heatingType: string;
  endenergiebedarf: number; // kWh/m²/a
  primaerenergiebedarf: number; // kWh/m²/a
  co2Emissions: number; // kg/m²/a
  energyClass: string;
  createdAt: string;
  validUntil: string;
}

export default function EnergyPassportManager() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const { toast } = useToast();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [passports, setPassports] = useState<EnergyPassport[]>(() => {
    const saved = localStorage.getItem('energy_passports');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPreview, setShowPreview] = useState(false);

  const building = buildings.find(b => b.id === selectedBuilding);

  // Calculate energy data for selected building
  const energyData = useMemo(() => {
    if (!building) return null;

    const area = building.total_area || building.units.reduce((s, u) => s + (u.area || 0), 0);
    if (area === 0) return null;

    const allMeters = [...(building.meters || []), ...building.units.flatMap(u => u.meters)];

    // Heating-related meters
    const heatingMeters = allMeters.filter(m =>
      ['heating', 'gas', 'oil', 'district_heating', 'heat_pump', 'pellets', 'lpg'].includes(m.meter_type)
    );
    const electricityMeters = allMeters.filter(m =>
      ['electricity', 'electricity_ht', 'electricity_nt', 'electricity_common'].includes(m.meter_type)
    );
    const waterMeters = allMeters.filter(m => ['water_hot'].includes(m.meter_type));

    // Endenergiebedarf (kWh/m²/a)
    let totalHeatingEnergy = 0;
    let totalElectricityEnergy = 0;
    let weightedPrimaryFactor = 0;
    let weightedCO2Factor = 0;
    let totalEnergy = 0;

    heatingMeters.forEach(m => {
      const annual = calculateAnnualConsumption(m.readings) || 0;
      // Gas m³ → kWh conversion
      const energyKwh = m.meter_type === 'gas' ? annual * 10.3 :
                        m.meter_type === 'oil' ? annual * 10 :
                        m.meter_type === 'pellets' ? annual * 4.9 :
                        m.meter_type === 'lpg' ? annual * 12.8 : annual;
      totalHeatingEnergy += energyKwh;
      const pf = PRIMARY_ENERGY_FACTORS[m.meter_type] || 1.0;
      const cf = CO2_FACTORS[m.meter_type] || 0.2;
      weightedPrimaryFactor += energyKwh * pf;
      weightedCO2Factor += energyKwh * cf;
      totalEnergy += energyKwh;
    });

    electricityMeters.forEach(m => {
      const annual = calculateAnnualConsumption(m.readings) || 0;
      totalElectricityEnergy += annual;
      weightedPrimaryFactor += annual * (PRIMARY_ENERGY_FACTORS['electricity'] || 1.8);
      weightedCO2Factor += annual * (CO2_FACTORS['electricity'] || 0.42);
      totalEnergy += annual;
    });

    // Warmwasser: 20 kWh/m²/a Pauschale
    const hotWaterEnergy = waterMeters.length > 0
      ? waterMeters.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0) * 58 // 58 kWh per m³ hot water
      : area * 20;
    totalEnergy += hotWaterEnergy;
    weightedPrimaryFactor += hotWaterEnergy * 1.1;
    weightedCO2Factor += hotWaterEnergy * 0.201;

    const endenergiebedarf = Math.round(totalEnergy / area);
    const primaerenergiebedarf = totalEnergy > 0
      ? Math.round(weightedPrimaryFactor / area)
      : Math.round(endenergiebedarf * 1.1);
    const co2Emissions = totalEnergy > 0
      ? Math.round((weightedCO2Factor / area) * 10) / 10
      : Math.round(endenergiebedarf * 0.2 * 10) / 10;

    // Determine energy class
    const energyClass = ENERGY_CLASSES.find(c => endenergiebedarf <= c.max)?.grade || 'H';

    // Dominant heating type
    const heatingType = heatingMeters.length > 0
      ? METER_TYPE_LABELS[heatingMeters.sort((a, b) =>
          (calculateAnnualConsumption(b.readings) || 0) - (calculateAnnualConsumption(a.readings) || 0)
        )[0].meter_type]
      : 'Unbekannt';

    return {
      area,
      endenergiebedarf,
      primaerenergiebedarf,
      co2Emissions,
      energyClass,
      heatingType,
      totalHeatingEnergy: Math.round(totalHeatingEnergy),
      totalElectricityEnergy: Math.round(totalElectricityEnergy),
      meterCount: allMeters.length,
    };
  }, [building]);

  // Generate passport
  const generatePassport = () => {
    if (!building || !energyData) return;

    const passport: EnergyPassport = {
      id: `ep_${Date.now()}`,
      buildingId: building.id,
      buildingName: building.name,
      address: building.address || '',
      yearBuilt: building.year_built || 0,
      area: energyData.area,
      heatingType: energyData.heatingType,
      endenergiebedarf: energyData.endenergiebedarf,
      primaerenergiebedarf: energyData.primaerenergiebedarf,
      co2Emissions: energyData.co2Emissions,
      energyClass: energyData.energyClass,
      createdAt: new Date().toISOString(),
      validUntil: format(new Date(new Date().getFullYear() + 10, new Date().getMonth(), new Date().getDate()), 'yyyy-MM-dd'),
    };

    const updated = [passport, ...passports];
    setPassports(updated);
    localStorage.setItem('energy_passports', JSON.stringify(updated));

    toast({ title: 'Energieausweis erstellt', description: `Klasse ${passport.energyClass} für ${building.name}` });
  };

  const deletePassport = (id: string) => {
    const updated = passports.filter(p => p.id !== id);
    setPassports(updated);
    localStorage.setItem('energy_passports', JSON.stringify(updated));
  };

  // Energy class scale bar position
  const getScalePosition = (value: number) => {
    const maxScale = 300;
    return Math.min(100, (value / maxScale) * 100);
  };

  const getClassColor = (grade: string) => {
    return ENERGY_CLASSES.find(c => c.grade === grade)?.color || '#999';
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Energieausweis (GEG)
      </h1>

      {/* Building selector */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gebäude auswählen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Gebäude</Label>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Gebäude wählen" /></SelectTrigger>
              <SelectContent>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} {b.total_area ? `(${b.total_area} m²)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Live calculation */}
      {energyData && building && (
        <>
          {/* Energy scale visualization */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Energieeffizienz-Skala</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Color scale bar */}
              <div className="relative mb-4">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {ENERGY_CLASSES.map((cls) => (
                    <div
                      key={cls.grade}
                      className="flex-1 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: cls.color }}
                    >
                      {cls.grade}
                    </div>
                  ))}
                </div>
                {/* Pointer */}
                <div
                  className="absolute -bottom-3 transition-all duration-500"
                  style={{ left: `${getScalePosition(energyData.endenergiebedarf)}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-foreground" />
                </div>
              </div>

              {/* Scale numbers */}
              <div className="flex justify-between text-[9px] text-muted-foreground mt-3 mb-4">
                <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>250</span><span>300+</span>
              </div>

              {/* Energy class badge */}
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                  style={{ backgroundColor: getClassColor(energyData.energyClass) }}
                >
                  {energyData.energyClass}
                </div>
                <div>
                  <p className="text-2xl font-bold">{energyData.endenergiebedarf} kWh/m²a</p>
                  <p className="text-xs text-muted-foreground">Endenergiebedarf</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Primärenergie</p>
                <p className="text-lg font-bold">{energyData.primaerenergiebedarf}</p>
                <p className="text-[10px] text-muted-foreground">kWh/m²a</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Leaf className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">CO₂-Emissionen</p>
                <p className="text-lg font-bold">{energyData.co2Emissions}</p>
                <p className="text-[10px] text-muted-foreground">kg/m²a</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Building2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Fläche</p>
                <p className="text-lg font-bold">{formatNumber(energyData.area)}</p>
                <p className="text-[10px] text-muted-foreground">m²</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Heizungsart</p>
                <p className="text-sm font-bold truncate">{energyData.heatingType}</p>
                <p className="text-[10px] text-muted-foreground">{energyData.meterCount} Zähler</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Energiebilanz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heizenergie</span>
                  <span className="font-medium">{formatNumber(energyData.totalHeatingEnergy)} kWh/a</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strom</span>
                  <span className="font-medium">{formatNumber(energyData.totalElectricityEnergy)} kWh/a</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Gesamt / Fläche</span>
                  <span className="font-bold text-primary">{energyData.endenergiebedarf} kWh/m²a</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CO2 cost info (GEG §7) */}
          <Card className="mb-4 border-green-500/20 bg-green-500/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Leaf className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">CO₂-Kostenaufteilung (CO2KostAufG)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bei Klasse {energyData.energyClass}: {
                      energyData.endenergiebedarf <= 12 ? 'Mieter trägt 100% der CO₂-Kosten' :
                      energyData.endenergiebedarf <= 52 ? 'Vermieter trägt 50% der CO₂-Kosten' :
                      'Vermieter trägt 95% der CO₂-Kosten'
                    }. Basis: CO₂-Preis von 45 €/t (2025).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate button */}
          <Button className="w-full mb-4" onClick={generatePassport}>
            <Plus className="w-4 h-4 mr-1" />Energieausweis generieren
          </Button>
        </>
      )}

      {/* Saved passports */}
      {passports.length > 0 && (
        <>
          <h2 className="text-sm font-medium mb-2 mt-6">Gespeicherte Energieausweise</h2>
          <div className="space-y-2 mb-4">
            {passports.map(p => (
              <Card key={p.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: getClassColor(p.energyClass) }}
                      >
                        {p.energyClass}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.buildingName}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.endenergiebedarf} kWh/m²a | CO₂: {p.co2Emissions} kg/m²a
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Erstellt: {format(new Date(p.createdAt), 'dd.MM.yyyy', { locale: de })} |
                          Gültig bis: {format(new Date(p.validUntil), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.print()}>
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => deletePassport(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* GEG info */}
      <Card className="mb-4 border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Gebäudeenergiegesetz (GEG)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Dieser Energieausweis wird auf Basis der erfassten Verbrauchsdaten berechnet (Verbrauchsausweis).
                Er dient zur Orientierung und ersetzt keinen offiziellen Energieausweis gemäß GEG §79-88.
                Gültigkeitsdauer: 10 Jahre.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
