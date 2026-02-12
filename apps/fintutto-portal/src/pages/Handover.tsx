import { useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ClipboardCheck,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Gauge,
  DoorOpen,
  Key,
  PenLine,
  Check,
  Download,
  Send,
  Star,
  Camera,
  Trash2,
} from 'lucide-react';

interface HandoverProtocol {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  type: 'move_in' | 'move_out';
  oldTenant?: { name: string; email: string };
  newTenant?: { name: string; email: string };
  meterReadings: { type: string; value: number; photo?: string }[];
  rooms: { name: string; condition: number; defects: string[]; photos: string[] }[];
  keys: { type: string; count: number }[];
  signatures: { tenant: string; landlord: string };
  status: 'draft' | 'completed';
}

const METER_TYPES = ['Strom', 'Gas', 'Wasser', 'Heizung'];
const DEFAULT_ROOMS = ['Flur', 'Wohnzimmer', 'Schlafzimmer', 'Küche', 'Bad', 'Balkon/Terrasse', 'Keller'];
const KEY_TYPES = ['Haustür', 'Wohnungstür', 'Kellertür', 'Briefkasten', 'Garage'];

const wizardSteps = [
  { id: 1, title: 'Objekt & Parteien', icon: Home },
  { id: 2, title: 'Zählerstände', icon: Gauge },
  { id: 3, title: 'Raumbegehung', icon: DoorOpen },
  { id: 4, title: 'Schlüssel', icon: Key },
  { id: 5, title: 'Unterschriften', icon: PenLine },
  { id: 6, title: 'Zusammenfassung', icon: Check },
];

export default function Handover() {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  
  const [protocols, setProtocols] = useState<HandoverProtocol[]>([
    {
      id: '1',
      propertyId: 'prop1',
      propertyName: 'Musterstraße 12, Wohnung 3',
      date: '2026-01-15',
      type: 'move_out',
      oldTenant: { name: 'Max Mustermann', email: 'max@example.com' },
      meterReadings: [],
      rooms: [],
      keys: [],
      signatures: { tenant: '', landlord: '' },
      status: 'completed',
    },
    {
      id: '2',
      propertyId: 'prop2',
      propertyName: 'Beispielweg 5, EG links',
      date: '2026-02-01',
      type: 'move_in',
      newTenant: { name: 'Anna Schmidt', email: 'anna@example.com' },
      meterReadings: [],
      rooms: [],
      keys: [],
      signatures: { tenant: '', landlord: '' },
      status: 'draft',
    },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<Partial<HandoverProtocol>>({
    propertyName: '',
    date: new Date().toISOString().split('T')[0],
    type: 'move_in',
    oldTenant: { name: '', email: '' },
    newTenant: { name: '', email: '' },
    meterReadings: METER_TYPES.map(type => ({ type, value: 0 })),
    rooms: DEFAULT_ROOMS.map(name => ({ name, condition: 3, defects: [], photos: [] })),
    keys: KEY_TYPES.map(type => ({ type, count: 0 })),
    signatures: { tenant: '', landlord: '' },
  });

  const handleNewProtocol = () => {
    setCurrentStep(1);
    setFormData({
      propertyName: '',
      date: new Date().toISOString().split('T')[0],
      type: 'move_in',
      oldTenant: { name: '', email: '' },
      newTenant: { name: '', email: '' },
      meterReadings: METER_TYPES.map(type => ({ type, value: 0 })),
      rooms: DEFAULT_ROOMS.map(name => ({ name, condition: 3, defects: [], photos: [] })),
      keys: KEY_TYPES.map(type => ({ type, count: 0 })),
      signatures: { tenant: '', landlord: '' },
    });
    setDialogOpen(true);
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveProtocol = () => {
    const newProtocol: HandoverProtocol = {
      id: crypto.randomUUID(),
      propertyId: crypto.randomUUID(),
      propertyName: formData.propertyName || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      type: formData.type || 'move_in',
      oldTenant: formData.oldTenant,
      newTenant: formData.newTenant,
      meterReadings: formData.meterReadings || [],
      rooms: formData.rooms || [],
      keys: formData.keys || [],
      signatures: formData.signatures || { tenant: '', landlord: '' },
      status: 'completed',
    };
    
    setProtocols([...protocols, newProtocol]);
    setDialogOpen(false);
    toast({
      title: 'Protokoll gespeichert',
      description: 'Das Übergabeprotokoll wurde erfolgreich erstellt.',
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: 'PDF wird erstellt',
      description: 'Das Übergabeprotokoll wird als PDF heruntergeladen...',
    });
  };

  const handleSendEmail = () => {
    toast({
      title: 'E-Mail gesendet',
      description: 'Das Protokoll wurde per E-Mail versendet.',
    });
  };

  const updateMeterReading = (index: number, value: number) => {
    const updated = [...(formData.meterReadings || [])];
    updated[index] = { ...updated[index], value };
    setFormData({ ...formData, meterReadings: updated });
  };

  const updateRoomCondition = (index: number, condition: number) => {
    const updated = [...(formData.rooms || [])];
    updated[index] = { ...updated[index], condition };
    setFormData({ ...formData, rooms: updated });
  };

  const addDefectToRoom = (roomIndex: number, defect: string) => {
    if (!defect.trim()) return;
    const updated = [...(formData.rooms || [])];
    updated[roomIndex] = { 
      ...updated[roomIndex], 
      defects: [...updated[roomIndex].defects, defect] 
    };
    setFormData({ ...formData, rooms: updated });
  };

  const removeDefectFromRoom = (roomIndex: number, defectIndex: number) => {
    const updated = [...(formData.rooms || [])];
    updated[roomIndex] = {
      ...updated[roomIndex],
      defects: updated[roomIndex].defects.filter((_, i) => i !== defectIndex),
    };
    setFormData({ ...formData, rooms: updated });
  };

  const updateKeyCount = (index: number, count: number) => {
    const updated = [...(formData.keys || [])];
    updated[index] = { ...updated[index], count };
    setFormData({ ...formData, keys: updated });
  };

  const renderStarRating = (rating: number, onChange: (rating: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        </button>
      ))}
    </div>
  );

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Objekt / Wohnung</Label>
              <Input
                placeholder="z.B. Musterstraße 12, Wohnung 3"
                value={formData.propertyName}
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Art der Übergabe</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'move_in' | 'move_out') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="move_in">Einzug</SelectItem>
                    <SelectItem value="move_out">Auszug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            {formData.type === 'move_out' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ausziehender Mieter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Vor- und Nachname"
                        value={formData.oldTenant?.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          oldTenant: { ...formData.oldTenant!, name: e.target.value } 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-Mail</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.oldTenant?.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          oldTenant: { ...formData.oldTenant!, email: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.type === 'move_in' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Einziehender Mieter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Vor- und Nachname"
                        value={formData.newTenant?.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          newTenant: { ...formData.newTenant!, name: e.target.value } 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-Mail</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.newTenant?.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          newTenant: { ...formData.newTenant!, email: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Erfassen Sie alle relevanten Zählerstände zum Übergabezeitpunkt.
            </p>
            {formData.meterReadings?.map((meter, index) => (
              <Card key={meter.type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{meter.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-32"
                        placeholder="Zählerstand"
                        value={meter.value || ''}
                        onChange={(e) => updateMeterReading(index, parseFloat(e.target.value) || 0)}
                      />
                      <Button variant="outline" size="icon">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bewerten Sie den Zustand jedes Raums und dokumentieren Sie Mängel.
            </p>
            {formData.rooms?.map((room, roomIndex) => (
              <Card key={room.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    {renderStarRating(room.condition, (rating) => updateRoomCondition(roomIndex, rating))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Mangel hinzufügen..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addDefectToRoom(roomIndex, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button variant="outline" size="icon">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  {room.defects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {room.defects.map((defect, defectIndex) => (
                        <Badge key={defectIndex} variant="secondary" className="gap-1">
                          {defect}
                          <button
                            onClick={() => removeDefectFromRoom(roomIndex, defectIndex)}
                            className="ml-1 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dokumentieren Sie alle übergebenen Schlüssel.
            </p>
            {formData.keys?.map((key, index) => (
              <Card key={key.type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{key.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateKeyCount(index, Math.max(0, key.count - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">{key.count}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateKeyCount(index, key.count + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">
                Gesamt: {formData.keys?.reduce((sum, k) => sum + k.count, 0)} Schlüssel
              </p>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Beide Parteien bestätigen die Übergabe mit ihrer Unterschrift.
            </p>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Unterschrift Mieter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <div className="text-center">
                    <PenLine className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Hier unterschreiben (Touch oder Maus)</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    type="date"
                    className="w-40"
                    value={formData.date}
                    readOnly
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.type === 'move_out' ? formData.oldTenant?.name : formData.newTenant?.name}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Unterschrift Vermieter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <div className="text-center">
                    <PenLine className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Hier unterschreiben (Touch oder Maus)</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    type="date"
                    className="w-40"
                    value={formData.date}
                    readOnly
                  />
                  <span className="text-sm text-muted-foreground">Vermieter/Verwalter</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-success" />
                <span className="font-medium text-success">Protokoll vollständig</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Alle Angaben wurden erfasst. Sie können das Protokoll jetzt speichern.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Objekt:</span>
                    <span className="font-medium">{formData.propertyName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Art:</span>
                    <span className="font-medium">{formData.type === 'move_in' ? 'Einzug' : 'Auszug'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Datum:</span>
                    <span className="font-medium">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mieter:</span>
                    <span className="font-medium">
                      {formData.type === 'move_out' ? formData.oldTenant?.name : formData.newTenant?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zählerstände erfasst:</span>
                    <span className="font-medium">
                      {formData.meterReadings?.filter(m => m.value > 0).length} von {formData.meterReadings?.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Räume geprüft:</span>
                    <span className="font-medium">{formData.rooms?.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mängel dokumentiert:</span>
                    <span className="font-medium">
                      {formData.rooms?.reduce((sum, r) => sum + r.defects.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Schlüssel übergeben:</span>
                    <span className="font-medium">
                      {formData.keys?.reduce((sum, k) => sum + k.count, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" />
                Als PDF speichern
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handleSendEmail}>
                <Send className="h-4 w-4" />
                Per E-Mail senden
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wohnungsübergaben</h1>
          <p className="text-muted-foreground">Verwalten Sie Übergabeprotokolle für Ihre Immobilien</p>
        </div>
        <Button onClick={handleNewProtocol} className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Übergabe
        </Button>
      </div>

      {/* Protocol List */}
      <div className="grid gap-4">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="glass hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{protocol.propertyName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {protocol.type === 'move_in' ? 'Einzug' : 'Auszug'} • {new Date(protocol.date).toLocaleDateString('de-DE')}
                      {protocol.type === 'move_in' && protocol.newTenant && ` • ${protocol.newTenant.name}`}
                      {protocol.type === 'move_out' && protocol.oldTenant && ` • ${protocol.oldTenant.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={protocol.status === 'completed' ? 'default' : 'secondary'}>
                    {protocol.status === 'completed' ? 'Abgeschlossen' : 'Entwurf'}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {protocols.length === 0 && (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Übergabeprotokolle</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Ihr erstes Übergabeprotokoll für eine Wohnungsübergabe.
            </p>
            <Button onClick={handleNewProtocol} className="gap-2">
              <Plus className="h-4 w-4" />
              Neue Übergabe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wizard Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Übergabeprotokoll</DialogTitle>
            <DialogDescription>
              Schritt {currentStep} von 6: {wizardSteps[currentStep - 1]?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                {index < wizardSteps.length - 1 && (
                  <div
                    className={`h-1 w-8 mx-1 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {renderWizardStep()}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>
            <div className="flex gap-2">
              {currentStep < 6 ? (
                <Button onClick={handleNext} className="gap-2">
                  Weiter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSaveProtocol} className="gap-2">
                  <Check className="h-4 w-4" />
                  Protokoll speichern
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
