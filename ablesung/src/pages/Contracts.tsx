import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, AlertTriangle, Clock, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useEnergyContracts } from '@/hooks/useEnergyContracts';
import { useProfile } from '@/hooks/useProfile';
import { useBuildings } from '@/hooks/useBuildings';
import { ProviderType, ContractStatus, EnergyContract, formatEuro, formatNumber } from '@/types/database';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  electricity: 'Strom', gas: 'Gas', water: 'Wasser', heating: 'Heizung',
  district_heating: 'Fernwärme', oil: 'Heizöl',
};

const urgencyStyles = {
  ok: 'border-green-500/20 bg-green-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  critical: 'border-red-500/30 bg-red-500/5',
};

export default function Contracts() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { buildings } = useBuildings();
  const { contracts, upcomingDeadlines, createContract, deleteContract } = useEnergyContracts(profile?.organization_id);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    provider_name: '', provider_type: 'electricity' as ProviderType, contract_number: '',
    tariff_name: '', price_per_unit: '', base_fee_monthly: '', contract_start: new Date().toISOString().split('T')[0],
    contract_end: '', cancellation_period_days: '30', auto_renewal_months: '12',
    building_id: '', notes: '',
  });

  const handleCreate = () => {
    if (!formData.provider_name || !profile?.organization_id) return;
    createContract({
      organization_id: profile.organization_id,
      building_id: formData.building_id || null,
      provider_name: formData.provider_name,
      provider_type: formData.provider_type,
      contract_number: formData.contract_number || null,
      tariff_name: formData.tariff_name || null,
      price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : null,
      base_fee_monthly: formData.base_fee_monthly ? parseFloat(formData.base_fee_monthly) : null,
      contract_start: formData.contract_start,
      contract_end: formData.contract_end || null,
      cancellation_period_days: parseInt(formData.cancellation_period_days) || 30,
      auto_renewal_months: parseInt(formData.auto_renewal_months) || 12,
      notes: formData.notes || null,
      status: 'active' as ContractStatus,
    });
    setShowForm(false);
    setFormData({
      provider_name: '', provider_type: 'electricity', contract_number: '',
      tariff_name: '', price_per_unit: '', base_fee_monthly: '', contract_start: new Date().toISOString().split('T')[0],
      contract_end: '', cancellation_period_days: '30', auto_renewal_months: '12',
      building_id: '', notes: '',
    });
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Energieverträge</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />Neu
        </Button>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Wechseltermine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingDeadlines.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-2 rounded-lg border ${urgencyStyles[c.urgency]}`}>
                  <div>
                    <p className="text-sm font-medium">{c.provider_name} - {c.tariff_name || PROVIDER_TYPE_LABELS[c.provider_type]}</p>
                    <p className="text-xs text-muted-foreground">
                      Kündigungsfrist: {c.cancellation_deadline ? format(new Date(c.cancellation_deadline), 'dd.MM.yyyy', { locale: de }) : '-'}
                    </p>
                  </div>
                  <div className={`text-sm font-bold ${c.urgency === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                    {c.daysUntilDeadline !== null ? (c.daysUntilDeadline <= 0 ? 'Verpasst!' : `${c.daysUntilDeadline} Tage`) : '-'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract List */}
      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Keine Verträge</h2>
          <p className="text-muted-foreground mb-4">Erfassen Sie Ihre Energielieferverträge, um Wechseltermine und Kosten im Blick zu behalten.</p>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" />Vertrag anlegen</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract, i) => (
            <motion.div key={contract.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`glass-card border ${urgencyStyles[contract.urgency]}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {PROVIDER_TYPE_LABELS[contract.provider_type]}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${contract.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {contract.status === 'active' ? 'Aktiv' : contract.status === 'cancelled' ? 'Gekündigt' : 'Abgelaufen'}
                        </span>
                      </div>
                      <h3 className="font-semibold truncate">{contract.provider_name}</h3>
                      {contract.tariff_name && <p className="text-sm text-muted-foreground">{contract.tariff_name}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {contract.price_per_unit && <span>{contract.price_per_unit} ct/Einheit</span>}
                        {contract.base_fee_monthly && <span>{formatEuro(contract.base_fee_monthly)}/Monat</span>}
                      </div>
                      {contract.contract_end && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Endet: {format(new Date(contract.contract_end), 'dd.MM.yyyy', { locale: de })}</span>
                          {contract.daysUntilDeadline !== null && contract.daysUntilDeadline > 0 && (
                            <span className={`ml-1 font-medium ${contract.urgency === 'critical' ? 'text-red-500' : contract.urgency === 'warning' ? 'text-amber-500' : 'text-green-500'}`}>
                              ({contract.daysUntilDeadline} Tage bis Kündigungsfrist)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteContract(contract.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Contract Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuer Energievertrag</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Anbieter *</Label>
              <Input placeholder="z.B. Stadtwerke München" value={formData.provider_name} onChange={e => setFormData({...formData, provider_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Vertragsart</Label>
                <Select value={formData.provider_type} onValueChange={v => setFormData({...formData, provider_type: v as ProviderType})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDER_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Gebäude</Label>
                <Select value={formData.building_id} onValueChange={v => setFormData({...formData, building_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Tarifname</Label>
                <Input placeholder="z.B. Ökostrom Flex" value={formData.tariff_name} onChange={e => setFormData({...formData, tariff_name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>Vertragsnr.</Label>
                <Input placeholder="Optional" value={formData.contract_number} onChange={e => setFormData({...formData, contract_number: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Preis/Einheit (ct)</Label>
                <Input type="number" step="0.01" placeholder="z.B. 32" value={formData.price_per_unit} onChange={e => setFormData({...formData, price_per_unit: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>Grundgebühr/Monat</Label>
                <Input type="number" step="0.01" placeholder="z.B. 12.50" value={formData.base_fee_monthly} onChange={e => setFormData({...formData, base_fee_monthly: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Vertragsbeginn *</Label>
                <Input type="date" value={formData.contract_start} onChange={e => setFormData({...formData, contract_start: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>Vertragsende</Label>
                <Input type="date" value={formData.contract_end} onChange={e => setFormData({...formData, contract_end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Kündigungsfrist (Tage)</Label>
                <Input type="number" value={formData.cancellation_period_days} onChange={e => setFormData({...formData, cancellation_period_days: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>Auto-Verlängerung (Mon.)</Label>
                <Input type="number" value={formData.auto_renewal_months} onChange={e => setFormData({...formData, auto_renewal_months: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notizen</Label>
              <Input placeholder="Optional" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
            <Button onClick={handleCreate} disabled={!formData.provider_name}>Vertrag speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
