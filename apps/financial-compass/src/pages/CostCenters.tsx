import { useState } from 'react';
import { useCostCenters, CostCenter } from '@/hooks/useCostCenters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  FolderTree,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export default function CostCenters() {
  const { toast } = useToast();
  const {
    costCenters,
    isLoading,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    getHierarchy,
    getChildren,
    getBudgetStatus,
    getStats,
    exportData,
  } = useCostCenters();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parentId: '',
    managerId: '',
    managerName: '',
    budget: 0,
    budgetPeriod: 'yearly' as CostCenter['budgetPeriod'],
    isActive: true,
    tags: [] as string[],
  });

  const stats = getStats();

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      parentId: '',
      managerId: '',
      managerName: '',
      budget: 0,
      budgetPeriod: 'yearly',
      isActive: true,
      tags: [],
    });
    setEditingCC(null);
  };

  const openEditDialog = (cc: CostCenter) => {
    setFormData({
      code: cc.code,
      name: cc.name,
      description: cc.description || '',
      parentId: cc.parentId || '',
      managerId: cc.managerId || '',
      managerName: cc.managerName || '',
      budget: cc.budget || 0,
      budgetPeriod: cc.budgetPeriod || 'yearly',
      isActive: cc.isActive,
      tags: [...cc.tags],
    });
    setEditingCC(cc);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) {
      toast({ title: 'Fehler', description: 'Code und Name sind erforderlich', variant: 'destructive' });
      return;
    }

    if (editingCC) {
      updateCostCenter(editingCC.id, formData);
      toast({ title: 'Kostenstelle aktualisiert' });
    } else {
      createCostCenter(formData);
      toast({ title: 'Kostenstelle erstellt' });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteCostCenter(id);
    toast({ title: 'Kostenstelle gelöscht' });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderCostCenter = (cc: CostCenter, level: number = 0) => {
    const children = getChildren(cc.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(cc.id);
    const budgetStatus = getBudgetStatus(cc.id);
    const isOverBudget = budgetStatus.percentage > 100;

    return (
      <>
        <TableRow key={cc.id} className={level > 0 ? 'bg-muted/30' : ''}>
          <TableCell style={{ paddingLeft: `${level * 24 + 16}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(cc.id)}
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              <span className="font-mono text-sm">{cc.code}</span>
            </div>
          </TableCell>
          <TableCell>
            <div>
              <p className="font-medium">{cc.name}</p>
              {cc.description && <p className="text-sm text-muted-foreground">{cc.description}</p>}
            </div>
          </TableCell>
          <TableCell className="text-right">
            {budgetStatus.budget > 0 ? budgetStatus.budget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '-'}
          </TableCell>
          <TableCell className="text-right">
            <span className={isOverBudget ? 'text-red-600 font-bold' : ''}>
              {budgetStatus.actual.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </TableCell>
          <TableCell>
            {budgetStatus.budget > 0 && (
              <div className="flex items-center gap-2">
                <Progress
                  value={Math.min(budgetStatus.percentage, 100)}
                  className={`w-20 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                />
                <span className={`text-sm ${isOverBudget ? 'text-red-600' : ''}`}>
                  {budgetStatus.percentage.toFixed(0)}%
                </span>
              </div>
            )}
          </TableCell>
          <TableCell>
            <Badge variant={cc.isActive ? 'default' : 'secondary'}>
              {cc.isActive ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(cc)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(cc.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && children.map(child => renderCostCenter(child, level + 1))}
      </>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kostenstellen</h1>
          <p className="text-muted-foreground">Kostenstellenrechnung und Budgetverwaltung</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Kostenstelle
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
            <p className="text-xs text-muted-foreground">{stats.active} aktiv</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbudget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ist-Kosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalActual.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
            <Progress value={(stats.totalActual / stats.totalBudget) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card className={stats.overBudgetCount > 0 ? 'border-red-200' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              {stats.overBudgetCount > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              Über Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.overBudgetCount > 0 ? 'text-red-600' : ''}`}>
              {stats.overBudgetCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Kostenstellenstruktur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Bezeichnung</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Ist-Kosten</TableHead>
                <TableHead className="w-40">Auslastung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getHierarchy().map(cc => renderCostCenter(cc))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCC ? 'Kostenstelle bearbeiten' : 'Neue Kostenstelle'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="z.B. 100"
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kostenstellenname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Übergeordnete Kostenstelle</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(v) => setFormData({ ...formData, parentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keine (Hauptkostenstelle)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Keine</SelectItem>
                    {costCenters
                      .filter(cc => cc.id !== editingCC?.id)
                      .map(cc => (
                        <SelectItem key={cc.id} value={cc.id}>{cc.code} - {cc.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Verantwortlicher</Label>
                <Input
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="Name"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Budget</Label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Budget-Periode</Label>
                <Select
                  value={formData.budgetPeriod}
                  onValueChange={(v) => setFormData({ ...formData, budgetPeriod: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="quarterly">Quartal</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Aktiv</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave}>{editingCC ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
