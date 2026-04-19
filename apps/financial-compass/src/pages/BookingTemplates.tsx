import { useState } from 'react';
import {
  useBookingTemplates,
  BookingTemplate,
  BookingTemplateLine,
  TEMPLATE_CATEGORIES,
  BOOKING_TYPES,
  COMMON_ACCOUNTS,
} from '@/hooks/useBookingTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Star,
  StarOff,
  Download,
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function BookingTemplates() {
  const { toast } = useToast();
  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    duplicateTemplate,
    validateTemplate,
    exportTemplates,
    importTemplates,
    getStats,
    getFavorites,
    getMostUsed,
  } = useBookingTemplates();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BookingTemplate | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Betriebsausgaben',
    type: 'expense' as BookingTemplate['type'],
    lines: [] as BookingTemplateLine[],
    defaultAmount: undefined as number | undefined,
    isAmountFixed: false,
    vatIncluded: true,
    tags: [] as string[],
    isFavorite: false,
  });

  const stats = getStats();
  const favorites = getFavorites();
  const mostUsed = getMostUsed(5);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Betriebsausgaben',
      type: 'expense',
      lines: [],
      defaultAmount: undefined,
      isAmountFixed: false,
      vatIncluded: true,
      tags: [],
      isFavorite: false,
    });
    setEditingTemplate(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: BookingTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      type: template.type,
      lines: [...template.lines],
      defaultAmount: template.defaultAmount,
      isAmountFixed: template.isAmountFixed,
      vatIncluded: template.vatIncluded,
      tags: [...template.tags],
      isFavorite: template.isFavorite,
    });
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Fehler', description: 'Name ist erforderlich', variant: 'destructive' });
      return;
    }
    if (formData.lines.length === 0) {
      toast({ title: 'Fehler', description: 'Mindestens eine Buchungszeile erforderlich', variant: 'destructive' });
      return;
    }

    const validation = validateTemplate(formData.lines);
    if (!validation.valid) {
      toast({
        title: 'Buchung nicht ausgeglichen',
        description: `Soll: ${validation.debit.toFixed(2)} € ≠ Haben: ${validation.credit.toFixed(2)} €`,
        variant: 'destructive',
      });
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
      toast({ title: 'Vorlage aktualisiert', description: `"${formData.name}" wurde gespeichert` });
    } else {
      createTemplate(formData);
      toast({ title: 'Vorlage erstellt', description: `"${formData.name}" wurde hinzugefügt` });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setDeleteTemplateId(null);
    toast({ title: 'Vorlage gelöscht' });
  };

  const handleDuplicate = (id: string) => {
    const newTemplate = duplicateTemplate(id);
    if (newTemplate) {
      toast({ title: 'Vorlage dupliziert', description: `"${newTemplate.name}" wurde erstellt` });
    }
  };

  const addLine = () => {
    const newLine: BookingTemplateLine = {
      id: `line-${Date.now()}`,
      accountNumber: '',
      accountName: '',
      debitAmount: undefined,
      creditAmount: undefined,
    };
    setFormData({ ...formData, lines: [...formData.lines, newLine] });
  };

  const updateLine = (id: string, updates: Partial<BookingTemplateLine>) => {
    setFormData({
      ...formData,
      lines: formData.lines.map(l => l.id === id ? { ...l, ...updates } : l),
    });
  };

  const removeLine = (id: string) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter(l => l.id !== id),
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
          const result = importTemplates(ev.target?.result as string, 'merge');
          if (result.success) {
            toast({ title: 'Import erfolgreich', description: `${result.count} Vorlagen importiert` });
          } else {
            toast({ title: 'Import fehlgeschlagen', description: result.error, variant: 'destructive' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: BookingTemplate['type']) => {
    switch (type) {
      case 'expense': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'income': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'transfer': return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buchungsvorlagen</h1>
          <p className="text-muted-foreground">
            Wiederverwendbare Vorlagen für häufige Buchungen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
          <Button variant="outline" onClick={exportTemplates}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Vorlage
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Favoriten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.favorites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byCategory).filter(k => stats.byCategory[k] > 0).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      {(favorites.length > 0 || mostUsed.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {favorites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Favoriten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {favorites.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(t.type)}
                        <span className="font-medium">{t.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(t)}>
                        Verwenden
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {mostUsed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Meistverwendet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mostUsed.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(t.type)}
                        <span className="font-medium">{t.name}</span>
                        <Badge variant="secondary" className="text-xs">{t.usageCount}x</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(t)}>
                        Verwenden
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {TEMPLATE_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vorlagen</CardTitle>
          <CardDescription>
            Klicken Sie auf eine Vorlage, um sie zu bearbeiten oder zu verwenden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Vorlagen gefunden</p>
              <Button variant="link" onClick={openCreateDialog}>
                Erste Vorlage erstellen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Buchungszeilen</TableHead>
                  <TableHead className="text-right">Verwendungen</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id} className="cursor-pointer" onClick={() => openEditDialog(template)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(template.id)}
                      >
                        {template.isFavorite ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <span>{BOOKING_TYPES.find(t => t.value === template.type)?.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{template.lines.length} Zeilen</Badge>
                    </TableCell>
                    <TableCell className="text-right">{template.usageCount}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplizieren
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTemplateId(template.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
            </DialogTitle>
            <DialogDescription>
              Erstellen Sie eine wiederverwendbare Buchungsvorlage
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
                  placeholder="z.B. Büromaterial"
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
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Buchungstyp</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_TYPES.map(bt => (
                      <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Booking Lines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Buchungszeilen</h4>
                  <p className="text-sm text-muted-foreground">
                    Soll und Haben müssen ausgeglichen sein
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Zeile
                </Button>
              </div>

              {formData.lines.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  Keine Buchungszeilen. Klicken Sie auf "+ Zeile"
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                    <div className="col-span-2">Konto</div>
                    <div className="col-span-4">Bezeichnung</div>
                    <div className="col-span-2 text-right">Soll</div>
                    <div className="col-span-2 text-right">Haben</div>
                    <div className="col-span-1">MwSt</div>
                    <div className="col-span-1"></div>
                  </div>
                  {formData.lines.map((line) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/50 rounded-lg">
                      <div className="col-span-2">
                        <Select
                          value={line.accountNumber}
                          onValueChange={(v) => {
                            const acc = COMMON_ACCOUNTS.find(a => a.number === v);
                            updateLine(line.id, {
                              accountNumber: v,
                              accountName: acc?.name || '',
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Konto" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_ACCOUNTS.map(acc => (
                              <SelectItem key={acc.number} value={acc.number}>
                                {acc.number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Input
                          value={line.accountName}
                          onChange={(e) => updateLine(line.id, { accountName: e.target.value })}
                          placeholder="Kontobezeichnung"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.debitAmount || ''}
                          onChange={(e) => updateLine(line.id, {
                            debitAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                            creditAmount: undefined,
                          })}
                          placeholder="0,00"
                          className="text-right"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.creditAmount || ''}
                          onChange={(e) => updateLine(line.id, {
                            creditAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                            debitAmount: undefined,
                          })}
                          placeholder="0,00"
                          className="text-right"
                        />
                      </div>
                      <div className="col-span-1">
                        <Select
                          value={String(line.taxRate || '')}
                          onValueChange={(v) => updateLine(line.id, { taxRate: v ? parseFloat(v) : undefined })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-</SelectItem>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="7">7%</SelectItem>
                            <SelectItem value="19">19%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(line.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Balance Check */}
                  {formData.lines.length > 0 && (
                    <div className="flex items-center justify-end gap-4 pt-2 border-t">
                      {(() => {
                        const validation = validateTemplate(formData.lines);
                        return (
                          <>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Soll:</span>{' '}
                              <span className="font-medium">{validation.debit.toFixed(2)} €</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Haben:</span>{' '}
                              <span className="font-medium">{validation.credit.toFixed(2)} €</span>
                            </div>
                            {validation.valid ? (
                              <Badge variant="default" className="bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Ausgeglichen
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Nicht ausgeglichen
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Options */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.vatIncluded}
                  onCheckedChange={(checked) => setFormData({ ...formData, vatIncluded: checked })}
                />
                <Label>MwSt. inklusiv</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFavorite}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
                />
                <Label>Als Favorit markieren</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Vorlage wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplateId && handleDelete(deleteTemplateId)}
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
