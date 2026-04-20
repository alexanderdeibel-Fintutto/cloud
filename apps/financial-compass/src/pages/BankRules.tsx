import { useState } from 'react';
import {
  useBankRules,
  BankRule,
  RuleCondition,
  RuleAction,
  CONDITION_FIELDS,
  CONDITION_OPERATORS,
  ACTION_TYPES,
  CATEGORIES,
} from '@/hooks/useBankRules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  PlayCircle,
  Download,
  Upload,
  GripVertical,
  Zap,
  BarChart3,
  Settings2,
  Filter,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function BankRules() {
  const { toast } = useToast();
  const {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    duplicateRule,
    exportRules,
    importRules,
    getStats,
  } = useBankRules();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BankRule | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditionLogic: 'and' as 'and' | 'or',
    conditions: [] as RuleCondition[],
    actions: [] as RuleAction[],
    priority: 1,
    isActive: true,
  });

  const stats = getStats();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      conditionLogic: 'and',
      conditions: [],
      actions: [],
      priority: rules.length + 1,
      isActive: true,
    });
    setEditingRule(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: BankRule) => {
    setFormData({
      name: rule.name,
      description: rule.description || '',
      conditionLogic: rule.conditionLogic,
      conditions: [...rule.conditions],
      actions: [...rule.actions],
      priority: rule.priority,
      isActive: rule.isActive,
    });
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Fehler', description: 'Name ist erforderlich', variant: 'destructive' });
      return;
    }
    if (formData.conditions.length === 0) {
      toast({ title: 'Fehler', description: 'Mindestens eine Bedingung ist erforderlich', variant: 'destructive' });
      return;
    }
    if (formData.actions.length === 0) {
      toast({ title: 'Fehler', description: 'Mindestens eine Aktion ist erforderlich', variant: 'destructive' });
      return;
    }

    if (editingRule) {
      updateRule(editingRule.id, formData);
      toast({ title: 'Regel aktualisiert', description: `"${formData.name}" wurde gespeichert` });
    } else {
      createRule(formData);
      toast({ title: 'Regel erstellt', description: `"${formData.name}" wurde hinzugefügt` });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteRule(id);
    setDeleteRuleId(null);
    toast({ title: 'Regel gelöscht' });
  };

  const handleDuplicate = (id: string) => {
    const newRule = duplicateRule(id);
    if (newRule) {
      toast({ title: 'Regel dupliziert', description: `"${newRule.name}" wurde erstellt` });
    }
  };

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: `cond-${Date.now()}`,
      field: 'description',
      operator: 'contains',
      value: '',
    };
    setFormData({ ...formData, conditions: [...formData.conditions, newCondition] });
  };

  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };

  const removeCondition = (id: string) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter(c => c.id !== id),
    });
  };

  const addAction = () => {
    const newAction: RuleAction = {
      id: `action-${Date.now()}`,
      type: 'categorize',
      value: '',
    };
    setFormData({ ...formData, actions: [...formData.actions, newAction] });
  };

  const updateAction = (id: string, updates: Partial<RuleAction>) => {
    setFormData({
      ...formData,
      actions: formData.actions.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };

  const removeAction = (id: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter(a => a.id !== id),
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = importRules(ev.target?.result as string, 'merge');
          if (result.success) {
            toast({ title: 'Import erfolgreich', description: `${result.count} Regeln importiert` });
          } else {
            toast({ title: 'Import fehlgeschlagen', description: result.error, variant: 'destructive' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bankregeln</h1>
          <p className="text-muted-foreground">
            Automatische Kategorisierung und Buchung von Banktransaktionen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
          <Button variant="outline" onClick={exportRules}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Regel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktiv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inaktiv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Treffer gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalMatches}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Regelübersicht
          </CardTitle>
          <CardDescription>
            Regeln werden nach Priorität angewendet. Die erste passende Regel wird verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Regeln vorhanden</p>
              <Button variant="link" onClick={openCreateDialog}>
                Erste Regel erstellen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Bedingungen</TableHead>
                  <TableHead>Aktionen</TableHead>
                  <TableHead className="text-center">Treffer</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.conditions.slice(0, 2).map((c, i) => (
                            <Badge key={c.id} variant="secondary" className="text-xs">
                              {CONDITION_FIELDS.find(f => f.value === c.field)?.label} {c.operator} "{c.value}"
                            </Badge>
                          ))}
                          {rule.conditions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.conditions.length - 2} mehr
                            </Badge>
                          )}
                        </div>
                        {rule.conditions.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            ({rule.conditionLogic === 'and' ? 'Alle' : 'Mindestens eine'})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.actions.slice(0, 2).map((a) => (
                            <Badge key={a.id} variant="outline" className="text-xs">
                              {ACTION_TYPES.find(t => t.value === a.type)?.label}: {a.label || a.value}
                            </Badge>
                          ))}
                          {rule.actions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.actions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{rule.matchCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(rule)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(rule.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplizieren
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteRuleId(rule.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Most Used Rules */}
      {stats.mostUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Meistverwendete Regeln
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mostUsed.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  <Badge>{rule.matchCount} Treffer</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Regel bearbeiten' : 'Neue Regel erstellen'}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie Bedingungen und Aktionen für die automatische Verarbeitung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Amazon Einkäufe"
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optionale Beschreibung"
                />
              </div>
            </div>

            <Separator />

            {/* Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Bedingungen
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Wann soll diese Regel angewendet werden?
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={formData.conditionLogic}
                    onValueChange={(v) => setFormData({ ...formData, conditionLogic: v as 'and' | 'or' })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">Alle (UND)</SelectItem>
                      <SelectItem value="or">Eine (ODER)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-1" />
                    Bedingung
                  </Button>
                </div>
              </div>

              {formData.conditions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  Keine Bedingungen. Klicken Sie auf "+ Bedingung"
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      {index > 0 && (
                        <Badge variant="outline" className="mr-2">
                          {formData.conditionLogic === 'and' ? 'UND' : 'ODER'}
                        </Badge>
                      )}
                      <Select
                        value={condition.field}
                        onValueChange={(v) => updateCondition(condition.id, { field: v as any })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_FIELDS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={condition.operator}
                        onValueChange={(v) => updateCondition(condition.id, { operator: v as any })}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPERATORS
                            .filter((o) => o.fields.includes(condition.field))
                            .map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        placeholder="Wert"
                        className="flex-1"
                      />
                      {condition.operator === 'between' && (
                        <>
                          <span className="text-muted-foreground">und</span>
                          <Input
                            value={condition.value2 || ''}
                            onChange={(e) => updateCondition(condition.id, { value2: e.target.value })}
                            placeholder="Max"
                            className="w-24"
                          />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Aktionen
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Was soll bei einem Treffer passieren?
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aktion
                </Button>
              </div>

              {formData.actions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  Keine Aktionen. Klicken Sie auf "+ Aktion"
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.actions.map((action) => (
                    <div key={action.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={action.type}
                        onValueChange={(v) => updateAction(action.id, { type: v as any })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {action.type === 'categorize' ? (
                        <Select
                          value={action.value}
                          onValueChange={(v) => {
                            const cat = CATEGORIES.find(c => c.value === v);
                            updateAction(action.id, { value: v, label: cat?.label });
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : action.type === 'set_tax_rate' ? (
                        <Select
                          value={action.value}
                          onValueChange={(v) => updateAction(action.id, { value: v, label: `${v}% MwSt` })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Steuersatz wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0% (steuerfrei)</SelectItem>
                            <SelectItem value="7">7% (ermäßigt)</SelectItem>
                            <SelectItem value="19">19% (regulär)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={action.value}
                          onChange={(e) => updateAction(action.id, { value: e.target.value })}
                          placeholder={
                            action.type === 'assign_account' ? 'Kontonummer (z.B. 4930)'
                            : action.type === 'assign_cost_center' ? 'Kostenstelle'
                            : action.type === 'add_tag' ? 'Tag-Name'
                            : 'Wert'
                          }
                          className="flex-1"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(action.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Regel aktivieren</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label>Priorität:</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              {editingRule ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRuleId} onOpenChange={() => setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Regel wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRuleId && handleDelete(deleteRuleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
