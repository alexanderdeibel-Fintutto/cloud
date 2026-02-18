import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, TrendingDown, Search, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import { useEnergyContracts } from '@/hooks/useEnergyContracts';
import { useProfile } from '@/hooks/useProfile';
import { MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, calculateAnnualConsumption, formatNumber, formatEuro, ProviderAlternative } from '@/types/database';

// Simulated provider data (in production would come from API)
const SAMPLE_PROVIDERS: Record<string, ProviderAlternative[]> = {
  electricity: [
    { provider_name: 'E.ON', tariff_name: 'Strom Öko 24', price_per_unit: 0.289, base_fee_monthly: 9.90, annual_cost: 0, savings_vs_current: 0, is_green: true, switch_url: null },
    { provider_name: 'Vattenfall', tariff_name: 'Natur24 Strom', price_per_unit: 0.299, base_fee_monthly: 8.50, annual_cost: 0, savings_vs_current: 0, is_green: true, switch_url: null },
    { provider_name: 'Grünwelt Energie', tariff_name: 'grünstrom easy', price_per_unit: 0.279, base_fee_monthly: 11.90, annual_cost: 0, savings_vs_current: 0, is_green: true, switch_url: null },
    { provider_name: 'LichtBlick', tariff_name: 'ÖkoStrom', price_per_unit: 0.309, base_fee_monthly: 7.50, annual_cost: 0, savings_vs_current: 0, is_green: true, switch_url: null },
    { provider_name: 'eprimo', tariff_name: 'Strom PrimaKlima', price_per_unit: 0.275, base_fee_monthly: 12.50, annual_cost: 0, savings_vs_current: 0, is_green: true, switch_url: null },
  ],
  gas: [
    { provider_name: 'E.ON', tariff_name: 'Erdgas Öko 24', price_per_unit: 0.099, base_fee_monthly: 11.90, annual_cost: 0, savings_vs_current: 0, is_green: false, switch_url: null },
    { provider_name: 'Vattenfall', tariff_name: 'Gas Fix', price_per_unit: 0.105, base_fee_monthly: 9.50, annual_cost: 0, savings_vs_current: 0, is_green: false, switch_url: null },
    { provider_name: 'eprimo', tariff_name: 'Gas PrimaKlima', price_per_unit: 0.095, base_fee_monthly: 12.90, annual_cost: 0, savings_vs_current: 0, is_green: true, switch_url: null },
  ],
};

export default function ProviderComparison() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const { profile } = useProfile();
  const { contracts } = useEnergyContracts(profile?.organization_id);
  const [selectedType, setSelectedType] = useState<string>('electricity');

  // Calculate annual consumption for the selected type
  const annualConsumption = useMemo(() => {
    let total = 0;
    buildings.forEach(b => {
      const meters = [...(b.meters || []), ...b.units.flatMap(u => u.meters)];
      meters.filter(m => m.meter_type === selectedType || (selectedType === 'electricity' && ['electricity', 'electricity_ht', 'electricity_nt'].includes(m.meter_type)))
        .forEach(m => { total += calculateAnnualConsumption(m.readings) || 0; });
    });
    return total;
  }, [buildings, selectedType]);

  // Current contract for this type
  const currentContract = contracts.find(c => c.provider_type === selectedType && c.status === 'active');
  const currentAnnualCost = currentContract && annualConsumption > 0
    ? (currentContract.price_per_unit || 0) * annualConsumption + (currentContract.base_fee_monthly || 0) * 12
    : annualConsumption * (selectedType === 'electricity' ? 0.32 : selectedType === 'gas' ? 0.12 : 4.5);

  // Calculate alternatives
  const providers = useMemo(() => {
    const base = SAMPLE_PROVIDERS[selectedType] || SAMPLE_PROVIDERS.electricity;
    return base.map(p => ({
      ...p,
      annual_cost: p.price_per_unit * annualConsumption + p.base_fee_monthly * 12,
      savings_vs_current: currentAnnualCost - (p.price_per_unit * annualConsumption + p.base_fee_monthly * 12),
    })).sort((a, b) => a.annual_cost - b.annual_cost);
  }, [selectedType, annualConsumption, currentAnnualCost]);

  const postalCode = buildings[0]?.postal_code || '80331';

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Anbietervergleich</h1>

      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="mb-4"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="electricity">Strom</SelectItem>
          <SelectItem value="gas">Gas</SelectItem>
        </SelectContent>
      </Select>

      {/* Current contract */}
      <Card className="mb-4 border-primary/30">
        <CardHeader className="pb-2"><CardTitle className="text-base">Ihr aktueller Vertrag</CardTitle></CardHeader>
        <CardContent>
          {currentContract ? (
            <div>
              <p className="font-semibold">{currentContract.provider_name} - {currentContract.tariff_name || '-'}</p>
              <p className="text-sm text-muted-foreground">
                {currentContract.price_per_unit ? `${(currentContract.price_per_unit * 100).toFixed(1)} ct/${selectedType === 'electricity' ? 'kWh' : 'm³'}` : 'Kein Preis hinterlegt'}
                {currentContract.base_fee_monthly ? ` + ${formatEuro(currentContract.base_fee_monthly)}/Monat` : ''}
              </p>
              <p className="text-lg font-bold mt-2">~ {formatEuro(currentAnnualCost)}/Jahr</p>
              <p className="text-xs text-muted-foreground">Basierend auf {formatNumber(annualConsumption)} {selectedType === 'electricity' ? 'kWh' : 'm³'}/Jahr</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Kein Vertrag hinterlegt. Berechnung mit Durchschnittspreisen.</p>
              <p className="text-lg font-bold mt-2">~ {formatEuro(currentAnnualCost)}/Jahr</p>
              <p className="text-xs text-muted-foreground">bei {formatNumber(annualConsumption)} {selectedType === 'electricity' ? 'kWh' : 'm³'}/Jahr</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternatives */}
      {annualConsumption > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base">Günstigere Alternativen</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {providers.filter(p => p.savings_vs_current > 10).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{p.provider_name}</p>
                      {p.is_green && <span className="text-xs bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full">Öko</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.tariff_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(p.price_per_unit * 100).toFixed(1)} ct + {formatEuro(p.base_fee_monthly)}/Mon.
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bold text-sm">{formatEuro(p.annual_cost)}/J</p>
                    <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />{formatEuro(p.savings_vs_current)} sparen
                    </p>
                  </div>
                </div>
              ))}
              {providers.filter(p => p.savings_vs_current > 10).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ihr aktueller Tarif ist bereits sehr günstig!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Portal Links */}
      <Card className="mb-4">
        <CardHeader className="pb-2"><CardTitle className="text-base">Vergleichsportale</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'Check24', url: `https://www.check24.de/${selectedType === 'gas' ? 'gas' : 'strom'}/vergleich?zipcode=${postalCode}&usage=${annualConsumption || 3000}` },
              { name: 'Verivox', url: `https://www.verivox.de/${selectedType === 'gas' ? 'gasvergleich' : 'stromvergleich'}/` },
              { name: 'Wechselpilot', url: 'https://www.wechselpilot.com/' },
            ].map(portal => (
              <a key={portal.name} href={portal.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{portal.name}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {annualConsumption > 0
              ? `Verbrauch: ${formatNumber(annualConsumption)} ${selectedType === 'electricity' ? 'kWh' : 'm³'}/Jahr | PLZ: ${postalCode}`
              : 'Tipp: Mehr Ablesungen eintragen für genauere Verbrauchsberechnung'}
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
