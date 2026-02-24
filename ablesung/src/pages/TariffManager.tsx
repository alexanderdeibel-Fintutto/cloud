import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, TrendingDown, TrendingUp, BarChart3, Zap, Flame, Droplets, Thermometer, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useBuildings } from '@/hooks/useBuildings';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS, calculateAnnualConsumption, formatNumber, formatEuro } from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Tariff {
  id: string;
  organization_id: string;
  name: string;
  provider: string;
  meter_type: MeterType;
  price_per_unit: number;
  base_price_monthly: number;
  is_ht_nt: boolean;
  ht_price?: number | null;
  nt_price?: number | null;
  valid_from: string;
  valid_to?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const typeIcons: Partial<Record<string, typeof Zap>> = {
  electricity: Zap, electricity_ht: Zap, electricity_nt: Zap,
  gas: Flame, water_cold: Droplets, water_hot: Droplets,
  heating: Thermometer, district_heating: Thermometer,
};

export default function TariffManager() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const organizationId = profile?.organization_id;

  // Fetch tariffs from Supabase
  const { data: tariffs = [], isLoading } = useQuery({
    queryKey: ['tariffs', organizationId],
    queryFn: async (): Promise<Tariff[]> => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Tariff[];
    },
    enabled: !!organizationId,
  });

  // Create tariff mutation
  const createTariff = useMutation({
    mutationFn: async (tariff: Omit<Tariff, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('tariffs').insert(tariff).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tariffs'] }),
  });

  // Update tariff mutation
  const updateTariff = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tariff> & { id: string }) => {
      const { error } = await supabase.from('tariffs').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tariffs'] }),
  });

  // Delete tariff mutation
  const deleteTariff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tariffs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tariffs'] }),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('electricity');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [basePriceMonthly, setBasePriceMonthly] = useState('');
  const [isHtNt, setIsHtNt] = useState(false);
  const [htPrice, setHtPrice] = useState('');
  const [ntPrice, setNtPrice] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);

  // Collect all meters
  const allMeters = useMemo(() => {
    return buildings.flatMap(b => [
      ...(b.meters || []),
      ...b.units.flatMap(u => u.meters),
    ]);
  }, [buildings]);

  // Analytics: compare tariffs for each meter type
  const analytics = useMemo(() => {
    const result: { type: MeterType; label: string; annualConsumption: number; tariffs: { name: string; annualCost: number }[] }[] = [];

    const meterTypes = [...new Set(allMeters.map(m => m.meter_type))];
    meterTypes.forEach(type => {
      const typeTariffs = tariffs.filter(t => t.meter_type === type && t.is_active);
      if (typeTariffs.length === 0) return;

      const typeMeters = allMeters.filter(m => m.meter_type === type);
      const totalAnnual = typeMeters.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);

      result.push({
        type,
        label: METER_TYPE_LABELS[type],
        annualConsumption: totalAnnual,
        tariffs: typeTariffs.map(t => ({
          name: `${t.provider} - ${t.name}`,
          annualCost: Math.round(totalAnnual * t.price_per_unit + t.base_price_monthly * 12),
        })).sort((a, b) => a.annualCost - b.annualCost),
      });
    });

    return result;
  }, [allMeters, tariffs]);

  // Default price comparison
  const savingsAnalysis = useMemo(() => {
    const result: { type: string; label: string; defaultCost: number; bestTariffCost: number; saving: number; bestTariff: string }[] = [];
    const meterTypes = [...new Set(allMeters.map(m => m.meter_type))];

    meterTypes.forEach(type => {
      const typeMeters = allMeters.filter(m => m.meter_type === type);
      const totalAnnual = typeMeters.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);
      if (totalAnnual === 0) return;

      const defaultPrice = METER_TYPE_PRICE_DEFAULTS[type] || 0.30;
      const defaultCost = Math.round(totalAnnual * defaultPrice);

      const typeTariffs = tariffs.filter(t => t.meter_type === type && t.is_active);
      if (typeTariffs.length === 0) return;

      const best = typeTariffs.reduce((best, t) => {
        const cost = totalAnnual * t.price_per_unit + t.base_price_monthly * 12;
        return cost < best.cost ? { cost, name: `${t.provider} - ${t.name}` } : best;
      }, { cost: Infinity, name: '' });

      result.push({
        type,
        label: METER_TYPE_LABELS[type as MeterType],
        defaultCost,
        bestTariffCost: Math.round(best.cost),
        saving: Math.round(defaultCost - best.cost),
        bestTariff: best.name,
      });
    });

    return result;
  }, [allMeters, tariffs]);

  const resetForm = () => {
    setName('');
    setProvider('');
    setMeterType('electricity');
    setPricePerUnit('');
    setBasePriceMonthly('');
    setIsHtNt(false);
    setHtPrice('');
    setNtPrice('');
    setValidFrom(new Date().toISOString().split('T')[0]);
    setEditingTariff(null);
  };

  const openEdit = (t: Tariff) => {
    setName(t.name);
    setProvider(t.provider);
    setMeterType(t.meter_type);
    setPricePerUnit(String(t.price_per_unit));
    setBasePriceMonthly(String(t.base_price_monthly));
    setIsHtNt(t.is_ht_nt);
    setHtPrice(t.ht_price ? String(t.ht_price) : '');
    setNtPrice(t.nt_price ? String(t.nt_price) : '');
    setValidFrom(t.valid_from);
    setEditingTariff(t);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!organizationId) return;

    const tariffData = {
      organization_id: organizationId,
      name: name.trim(),
      provider: provider.trim(),
      meter_type: meterType,
      price_per_unit: parseFloat(pricePerUnit) || 0,
      base_price_monthly: parseFloat(basePriceMonthly) || 0,
      is_ht_nt: isHtNt,
      ht_price: isHtNt ? parseFloat(htPrice) || null : null,
      nt_price: isHtNt ? parseFloat(ntPrice) || null : null,
      valid_from: validFrom,
      is_active: editingTariff?.is_active ?? true,
    };

    try {
      if (editingTariff) {
        await updateTariff.mutateAsync({ id: editingTariff.id, ...tariffData });
      } else {
        await createTariff.mutateAsync(tariffData);
      }
      setShowAdd(false);
      resetForm();
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Tarif konnte nicht gespeichert werden.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTariff.mutateAsync(id);
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Tarif konnte nicht gelöscht werden.' });
    }
  };

  const toggleActive = async (id: string) => {
    const tariff = tariffs.find(t => t.id === id);
    if (!tariff) return;
    try {
      await updateTariff.mutateAsync({ id, is_active: !tariff.is_active });
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Status konnte nicht geändert werden.' });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Tarif-Manager</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
          <Plus className="w-4 h-4 mr-1" />Tarif
        </Button>
      </div>

      {/* Tariff List */}
      {tariffs.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="py-8 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Keine Tarife</h3>
            <p className="text-sm text-muted-foreground mb-4">Legen Sie Ihre Strom-/Gas-/Wasser-Tarife an, um Kosten zu vergleichen.</p>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-1" />Ersten Tarif anlegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 mb-4">
          {tariffs.map(t => {
            const Icon = typeIcons[t.meter_type] || Zap;
            return (
              <Card key={t.id} className={`${!t.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t.provider} - {t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.price_per_unit} €/{METER_TYPE_UNITS[t.meter_type]} + {formatEuro(t.base_price_monthly)}/Mon.
                        {t.is_ht_nt && ` | HT: ${t.ht_price}€ NT: ${t.nt_price}€`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch checked={t.is_active} onCheckedChange={() => toggleActive(t.id)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Savings Analysis */}
      {savingsAnalysis.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              Tarif-Sparanalyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savingsAnalysis.map(s => (
                <div key={s.type} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground truncate">Bester: {s.bestTariff}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className={`text-sm font-bold ${s.saving > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {s.saving > 0 ? `-${formatEuro(s.saving)}` : '±0€'}/Jahr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tariff Analytics Chart */}
      {analytics.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tarifvergleich (Jahreskosten)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.map(a => {
              if (a.tariffs.length < 2) return null;
              return (
                <div key={a.type} className="mb-4 last:mb-0">
                  <p className="text-sm font-medium mb-2">{a.label} ({formatNumber(a.annualConsumption)} {METER_TYPE_UNITS[a.type]}/Jahr)</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={a.tariffs} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}€`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={100} />
                        <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                        <Bar dataKey="annualCost" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Tariff Dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { if (!open) resetForm(); setShowAdd(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTariff ? 'Tarif bearbeiten' : 'Neuen Tarif anlegen'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Anbieter</Label>
                <Input placeholder="z.B. Stadtwerke" value={provider} onChange={e => setProvider(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tarifname</Label>
                <Input placeholder="z.B. Grundversorgung" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Zählertyp</Label>
              <Select value={meterType} onValueChange={(v) => setMeterType(v as MeterType)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['electricity', 'gas', 'water_cold', 'water_hot', 'heating', 'district_heating', 'oil', 'pellets'] as MeterType[]).map(t => (
                    <SelectItem key={t} value={t}>{METER_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Arbeitspreis (€/{METER_TYPE_UNITS[meterType]})</Label>
                <Input type="number" step="0.01" placeholder="0.35" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Grundpreis (€/Monat)</Label>
                <Input type="number" step="0.01" placeholder="9.90" value={basePriceMonthly} onChange={e => setBasePriceMonthly(e.target.value)} className="mt-1" />
              </div>
            </div>
            {(meterType === 'electricity' || meterType === 'electricity_ht' || meterType === 'electricity_nt') && (
              <div className="flex items-center gap-2">
                <Switch checked={isHtNt} onCheckedChange={setIsHtNt} />
                <Label className="text-xs">HT/NT-Tarif (Hochtarif/Niedertarif)</Label>
              </div>
            )}
            {isHtNt && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">HT-Preis (€/kWh)</Label>
                  <Input type="number" step="0.01" placeholder="0.38" value={htPrice} onChange={e => setHtPrice(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">NT-Preis (€/kWh)</Label>
                  <Input type="number" step="0.01" placeholder="0.28" value={ntPrice} onChange={e => setNtPrice(e.target.value)} className="mt-1" />
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">Gültig ab</Label>
              <Input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowAdd(false); }}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={!name.trim() || !provider.trim() || createTariff.isPending || updateTariff.isPending}>
              {(createTariff.isPending || updateTariff.isPending) ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Speichern...</>
              ) : (
                editingTariff ? 'Speichern' : 'Anlegen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
