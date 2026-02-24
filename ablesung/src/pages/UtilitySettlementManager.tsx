import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Send, CheckCircle2, Clock, AlertCircle,
  PenLine, Building2, Plus, Eye, Printer, Mail,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS,
  calculateAnnualConsumption, calculateCost, formatNumber, formatEuro,
} from '@/types/database';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type SettlementStatus = 'draft' | 'review' | 'signed' | 'sent';

interface Settlement {
  id: string;
  buildingId: string;
  buildingName: string;
  periodFrom: string;
  periodTo: string;
  status: SettlementStatus;
  createdAt: string;
  signedAt?: string;
  sentAt?: string;
  signatureName?: string;
  totalAmount: number;
  units: SettlementUnit[];
}

interface SettlementUnit {
  unitId: string;
  unitNumber: string;
  tenantName: string;
  tenantEmail: string;
  heatingCost: number;
  waterCost: number;
  additionalCosts: number;
  prepayments: number;
  balance: number;
}

const STATUS_CONFIG: Record<SettlementStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Entwurf', color: 'text-muted-foreground bg-muted', icon: PenLine },
  review: { label: 'Prüfung', color: 'text-amber-600 bg-amber-500/10', icon: Eye },
  signed: { label: 'Unterschrieben', color: 'text-blue-600 bg-blue-500/10', icon: CheckCircle2 },
  sent: { label: 'Versendet', color: 'text-green-600 bg-green-500/10', icon: Send },
};

export default function UtilitySettlementManager() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const { toast } = useToast();

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem('utility_settlements');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [newBuildingId, setNewBuildingId] = useState<string>('');
  const [newPeriodFrom, setNewPeriodFrom] = useState(format(new Date(new Date().getFullYear() - 1, 0, 1), 'yyyy-MM-dd'));
  const [newPeriodTo, setNewPeriodTo] = useState(format(new Date(new Date().getFullYear() - 1, 11, 31), 'yyyy-MM-dd'));
  const [signatureName, setSignatureName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const saveSettlements = (updated: Settlement[]) => {
    setSettlements(updated);
    localStorage.setItem('utility_settlements', JSON.stringify(updated));
  };

  // Create new settlement
  const createSettlement = () => {
    const building = buildings.find(b => b.id === newBuildingId);
    if (!building) return;

    const units: SettlementUnit[] = building.units.map(unit => {
      const heatingMeters = unit.meters.filter(m => ['heating', 'gas', 'district_heating'].includes(m.meter_type));
      const waterMeters = unit.meters.filter(m => ['water_cold', 'water_hot'].includes(m.meter_type));
      const heatingConsumption = heatingMeters.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
      const waterConsumption = waterMeters.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
      const heatingCost = calculateCost(heatingConsumption, 'heating');
      const waterCost = calculateCost(waterConsumption, 'water_cold');
      const additionalCosts = Math.round((unit.area || 50) * 2.5 * 100) / 100; // ~2.50€/m² additional
      const prepayments = Math.round(((heatingCost + waterCost + additionalCosts) / 12) * 12 * 100) / 100;

      return {
        unitId: unit.id,
        unitNumber: unit.unit_number,
        tenantName: '',
        tenantEmail: '',
        heatingCost,
        waterCost,
        additionalCosts,
        prepayments,
        balance: Math.round((prepayments - heatingCost - waterCost - additionalCosts) * 100) / 100,
      };
    });

    const totalAmount = units.reduce((s, u) => s + u.heatingCost + u.waterCost + u.additionalCosts, 0);

    const settlement: Settlement = {
      id: `set_${Date.now()}`,
      buildingId: building.id,
      buildingName: building.name,
      periodFrom: newPeriodFrom,
      periodTo: newPeriodTo,
      status: 'draft',
      createdAt: new Date().toISOString(),
      totalAmount: Math.round(totalAmount * 100) / 100,
      units,
    };

    const updated = [settlement, ...settlements];
    saveSettlements(updated);
    setShowNewDialog(false);
    setNewBuildingId('');

    toast({ title: 'Abrechnung erstellt', description: `Entwurf für ${building.name} wurde angelegt.` });
  };

  // Sign settlement
  const signSettlement = () => {
    if (!selectedSettlement || !signatureName.trim()) return;

    const updated = settlements.map(s =>
      s.id === selectedSettlement.id
        ? { ...s, status: 'signed' as SettlementStatus, signedAt: new Date().toISOString(), signatureName: signatureName.trim() }
        : s
    );
    saveSettlements(updated);
    setSelectedSettlement({ ...selectedSettlement, status: 'signed', signedAt: new Date().toISOString(), signatureName: signatureName.trim() });
    setShowSignDialog(false);
    setSignatureName('');

    toast({ title: 'Abrechnung unterschrieben', description: 'Die digitale Signatur wurde gespeichert.' });
  };

  // Send settlement
  const sendSettlement = (settlement: Settlement) => {
    const updated = settlements.map(s =>
      s.id === settlement.id
        ? { ...s, status: 'sent' as SettlementStatus, sentAt: new Date().toISOString() }
        : s
    );
    saveSettlements(updated);
    setSelectedSettlement({ ...settlement, status: 'sent', sentAt: new Date().toISOString() });

    toast({
      title: 'Abrechnung versendet',
      description: 'Die Nebenkostenabrechnung wurde an die Mieter verschickt.',
    });
  };

  // Export CSV
  const exportCSV = (settlement: Settlement) => {
    const lines = [
      `"Nebenkostenabrechnung - ${settlement.buildingName}"`,
      `"Zeitraum: ${settlement.periodFrom} bis ${settlement.periodTo}"`,
      `"Status: ${STATUS_CONFIG[settlement.status].label}"`,
      '',
      '"Einheit";"Mieter";"Heizkosten";"Wasserkosten";"Nebenkosten";"Vorauszahlungen";"Saldo"',
    ];
    settlement.units.forEach(u => {
      lines.push(`"${u.unitNumber}";"${u.tenantName || '-'}";"${u.heatingCost}";"${u.waterCost}";"${u.additionalCosts}";"${u.prepayments}";"${u.balance}"`);
    });
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abrechnung_${settlement.buildingName}_${settlement.periodFrom}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter settlements
  const filteredSettlements = filterStatus === 'all'
    ? settlements
    : settlements.filter(s => s.status === filterStatus);

  // Update tenant info
  const updateTenant = (settlementId: string, unitId: string, field: 'tenantName' | 'tenantEmail', value: string) => {
    const updated = settlements.map(s => {
      if (s.id !== settlementId) return s;
      return {
        ...s,
        units: s.units.map(u => u.unitId === unitId ? { ...u, [field]: value } : u),
      };
    });
    saveSettlements(updated);
    if (selectedSettlement?.id === settlementId) {
      setSelectedSettlement(updated.find(s => s.id === settlementId) || null);
    }
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Abrechnungsmanager</h1>
        <Button size="sm" onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />Neue Abrechnung
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settlement list */}
      {filteredSettlements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Keine Abrechnungen</p>
            <p className="text-xs text-muted-foreground mt-1">Erstellen Sie eine neue Nebenkostenabrechnung.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSettlements.map(settlement => {
            const cfg = STATUS_CONFIG[settlement.status];
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={settlement.id}
                className="cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => { setSelectedSettlement(settlement); setShowDetailDialog(true); }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{settlement.buildingName}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />{cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{settlement.periodFrom} – {settlement.periodTo}</span>
                    <span className="font-medium text-foreground">{formatEuro(settlement.totalAmount)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {settlement.units.length} Einheiten | Erstellt: {format(new Date(settlement.createdAt), 'dd.MM.yyyy', { locale: de })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New settlement dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Abrechnung</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Gebäude</Label>
              <Select value={newBuildingId} onValueChange={setNewBuildingId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Gebäude wählen" /></SelectTrigger>
                <SelectContent>
                  {buildings.filter(b => b.units.length > 0).map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name} ({b.units.length} Einheiten)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Von</Label>
                <Input type="date" value={newPeriodFrom} onChange={e => setNewPeriodFrom(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Bis</Label>
                <Input type="date" value={newPeriodTo} onChange={e => setNewPeriodTo(e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Abbrechen</Button>
            <Button onClick={createSettlement} disabled={!newBuildingId}>Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedSettlement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {selectedSettlement.buildingName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status + period */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedSettlement.periodFrom} – {selectedSettlement.periodTo}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[selectedSettlement.status].color}`}>
                    {STATUS_CONFIG[selectedSettlement.status].label}
                  </span>
                </div>

                {/* Signature info */}
                {selectedSettlement.signedAt && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 p-2 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unterschrieben von {selectedSettlement.signatureName} am {format(new Date(selectedSettlement.signedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </div>
                )}

                {/* Per-unit breakdown */}
                {selectedSettlement.units.map(unit => (
                  <Card key={unit.unitId}>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm mb-2">{unit.unitNumber}</p>
                      {selectedSettlement.status === 'draft' && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <Label className="text-[10px]">Mieter</Label>
                            <Input
                              value={unit.tenantName}
                              onChange={e => updateTenant(selectedSettlement.id, unit.unitId, 'tenantName', e.target.value)}
                              placeholder="Name"
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">E-Mail</Label>
                            <Input
                              value={unit.tenantEmail}
                              onChange={e => updateTenant(selectedSettlement.id, unit.unitId, 'tenantEmail', e.target.value)}
                              placeholder="email@..."
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Heizkosten</span><span>{formatEuro(unit.heatingCost)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Wasserkosten</span><span>{formatEuro(unit.waterCost)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Nebenkosten</span><span>{formatEuro(unit.additionalCosts)}</span></div>
                        <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">Vorauszahlungen</span><span>{formatEuro(unit.prepayments)}</span></div>
                        <div className="flex justify-between font-bold text-sm border-t pt-1">
                          <span>{unit.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}</span>
                          <span className={unit.balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {formatEuro(Math.abs(unit.balance))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <span className="font-medium text-sm">Gesamtkosten</span>
                  <span className="font-bold text-primary">{formatEuro(selectedSettlement.totalAmount)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => exportCSV(selectedSettlement)}>
                    <Download className="w-4 h-4 mr-1" />CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-1" />Drucken
                  </Button>
                  {selectedSettlement.status === 'draft' && (
                    <Button size="sm" onClick={() => {
                      const updated = settlements.map(s => s.id === selectedSettlement.id ? { ...s, status: 'review' as SettlementStatus } : s);
                      saveSettlements(updated);
                      setSelectedSettlement({ ...selectedSettlement, status: 'review' });
                    }}>
                      <Eye className="w-4 h-4 mr-1" />Zur Prüfung
                    </Button>
                  )}
                  {(selectedSettlement.status === 'review' || selectedSettlement.status === 'draft') && (
                    <Button size="sm" onClick={() => setShowSignDialog(true)}>
                      <PenLine className="w-4 h-4 mr-1" />Unterschreiben
                    </Button>
                  )}
                  {selectedSettlement.status === 'signed' && (
                    <Button size="sm" onClick={() => sendSettlement(selectedSettlement)}>
                      <Mail className="w-4 h-4 mr-1" />An Mieter senden
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Digitale Unterschrift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Durch Ihre digitale Unterschrift bestätigen Sie die Richtigkeit der Nebenkostenabrechnung.
            </p>
            <div>
              <Label className="text-xs">Vollständiger Name</Label>
              <Input
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                placeholder="Max Mustermann"
                className="mt-1"
              />
            </div>
            {signatureName.trim() && (
              <div className="border rounded-lg p-4 text-center bg-accent/30">
                <p className="font-serif text-2xl italic text-primary">{signatureName}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>Abbrechen</Button>
            <Button onClick={signSettlement} disabled={!signatureName.trim()}>
              <PenLine className="w-4 h-4 mr-1" />Unterschreiben
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
