import { useState } from 'react';
import {
  useInventory,
  InventoryItem,
  InventoryCategory,
  MovementType,
  CATEGORY_LABELS,
  MOVEMENT_TYPE_LABELS,
  UNIT_OPTIONS,
} from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Plus,
  Search,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Edit,
  Trash2,
  History,
  BarChart3,
  Box,
  Boxes,
  Settings,
  Warehouse,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const Inventory = () => {
  const { toast } = useToast();
  const {
    items,
    movements,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    recordMovement,
    getMovementsForItem,
    getLowStockItems,
    calculateValuation,
    searchItems,
    getSummary,
    exportInventory,
    exportMovements,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Item form state
  const [itemForm, setItemForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'material' as InventoryCategory,
    unit: 'Stück',
    quantity: 0,
    minQuantity: 10,
    maxQuantity: undefined as number | undefined,
    purchasePrice: 0,
    salePrice: undefined as number | undefined,
    taxRate: 19,
    location: '',
    supplier: '',
    account: '3000',
  });

  // Movement form state
  const [movementForm, setMovementForm] = useState({
    type: 'purchase' as MovementType,
    quantity: 0,
    unitPrice: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    documentNumber: '',
    notes: '',
  });

  const summary = getSummary();
  const valuation = calculateValuation();
  const lowStockItems = getLowStockItems();

  // Filter items
  let filteredItems = searchQuery ? searchItems(searchQuery) : items;
  if (categoryFilter !== 'all') {
    filteredItems = filteredItems.filter(i => i.category === categoryFilter);
  }
  if (statusFilter !== 'all') {
    filteredItems = filteredItems.filter(i => i.status === statusFilter);
  }

  const resetItemForm = () => {
    setItemForm({
      sku: '',
      name: '',
      description: '',
      category: 'material',
      unit: 'Stück',
      quantity: 0,
      minQuantity: 10,
      maxQuantity: undefined,
      purchasePrice: 0,
      salePrice: undefined,
      taxRate: 19,
      location: '',
      supplier: '',
      account: '3000',
    });
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    resetItemForm();
    setShowItemDialog(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm({
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice,
      taxRate: item.taxRate,
      location: item.location || '',
      supplier: item.supplier || '',
      account: item.account,
    });
    setShowItemDialog(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.sku || !itemForm.name) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie Artikelnummer und Bezeichnung aus.',
        variant: 'destructive',
      });
      return;
    }

    if (editingItem) {
      updateItem(editingItem.id, itemForm);
      toast({
        title: 'Artikel aktualisiert',
        description: `${itemForm.name} wurde aktualisiert.`,
      });
    } else {
      createItem(itemForm);
      toast({
        title: 'Artikel angelegt',
        description: `${itemForm.name} wurde erstellt.`,
      });
    }
    setShowItemDialog(false);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id);
      toast({
        title: 'Artikel gelöscht',
        description: `${selectedItem.name} wurde gelöscht.`,
      });
    }
    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleMovementClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementForm({
      type: 'purchase',
      quantity: 0,
      unitPrice: item.purchasePrice,
      date: format(new Date(), 'yyyy-MM-dd'),
      documentNumber: '',
      notes: '',
    });
    setShowMovementDialog(true);
  };

  const handleSaveMovement = () => {
    if (!selectedItem || movementForm.quantity === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie eine Menge an.',
        variant: 'destructive',
      });
      return;
    }

    // Determine quantity sign based on movement type
    let quantity = Math.abs(movementForm.quantity);
    if (movementForm.type === 'sale' || (movementForm.type === 'adjustment' && movementForm.quantity < 0)) {
      quantity = -quantity;
    }

    recordMovement({
      itemId: selectedItem.id,
      date: movementForm.date,
      type: movementForm.type,
      quantity,
      unitPrice: movementForm.unitPrice,
      totalValue: Math.abs(quantity * movementForm.unitPrice),
      documentNumber: movementForm.documentNumber || undefined,
      notes: movementForm.notes || undefined,
    });

    toast({
      title: 'Bewegung erfasst',
      description: `${MOVEMENT_TYPE_LABELS[movementForm.type]} für ${selectedItem.name} wurde gespeichert.`,
    });
    setShowMovementDialog(false);
  };

  const handleHistoryClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowHistoryDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Aktiv</Badge>;
      case 'low_stock':
        return <Badge variant="default" className="bg-yellow-500">Niedrig</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Leer</Badge>;
      case 'discontinued':
        return <Badge variant="secondary">Eingestellt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventarverwaltung</h1>
          <p className="text-muted-foreground">
            Bestände, Lagerbewegungen und Inventur
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportInventory()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateItem}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Artikel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Artikel</p>
                <p className="text-2xl font-bold">{summary.totalItems}</p>
                <p className="text-xs text-muted-foreground">{summary.activeItems} aktiv</p>
              </div>
              <Boxes className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lagerwert</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Niedrig</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.lowStockCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leer</p>
                <p className="text-2xl font-bold text-red-600">{summary.outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bewegungen</p>
                <p className="text-2xl font-bold">{summary.movementsThisMonth}</p>
                <p className="text-xs text-muted-foreground">diesen Monat</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Artikelliste</TabsTrigger>
          <TabsTrigger value="lowstock">
            Bestandswarnungen
            {lowStockItems.length > 0 && (
              <Badge variant="destructive" className="ml-2">{lowStockItems.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="movements">Lagerbewegungen</TabsTrigger>
          <TabsTrigger value="valuation">Bewertung</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Artikelbestand
                  </CardTitle>
                  <CardDescription>
                    Alle Lagerartikel mit Beständen
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as InventoryCategory | 'all')}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="low_stock">Niedrig</SelectItem>
                      <SelectItem value="out_of_stock">Leer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikelnr.</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead className="text-right">Bestand</TableHead>
                    <TableHead className="text-right">Min.</TableHead>
                    <TableHead className="text-right">EK-Preis</TableHead>
                    <TableHead className="text-right">Lagerwert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Keine Artikel gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.location && (
                              <p className="text-xs text-muted-foreground">{item.location}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{CATEGORY_LABELS[item.category]}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.minQuantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.purchasePrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.purchasePrice)}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMovementClick(item)}
                              title="Bewegung erfassen"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleHistoryClick(item)}
                              title="Historie"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                              title="Bearbeiten"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(item)}
                              title="Löschen"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Tab */}
        <TabsContent value="lowstock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Bestandswarnungen
              </CardTitle>
              <CardDescription>
                Artikel mit niedrigem oder keinem Bestand
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Alle Bestände sind ausreichend</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikelnr.</TableHead>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead>Lieferant</TableHead>
                      <TableHead className="text-right">Aktuell</TableHead>
                      <TableHead className="text-right">Minimum</TableHead>
                      <TableHead className="text-right">Fehlmenge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.supplier || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">{item.minQuantity}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {Math.max(0, item.minQuantity - item.quantity)}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleMovementClick(item)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Einbuchen
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5" />
                    Lagerbewegungen
                  </CardTitle>
                  <CardDescription>
                    Alle Ein- und Ausbuchungen
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportMovements()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Artikelnr.</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead className="text-right">Stückpreis</TableHead>
                    <TableHead className="text-right">Wert</TableHead>
                    <TableHead>Beleg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Keine Bewegungen vorhanden
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...movements]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 50)
                      .map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell>
                            {format(new Date(mov.date), 'dd.MM.yyyy', { locale: de })}
                          </TableCell>
                          <TableCell className="font-mono">{mov.sku}</TableCell>
                          <TableCell>{mov.itemName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{MOVEMENT_TYPE_LABELS[mov.type]}</Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${mov.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(mov.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(mov.totalValue)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {mov.documentNumber || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Valuation Tab */}
        <TabsContent value="valuation">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Bestandsbewertung
                </CardTitle>
                <CardDescription>
                  Stichtag: {format(new Date(), 'dd.MM.yyyy', { locale: de })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-lg">Gesamtlagerwert</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(valuation.totalValue)}
                  </span>
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Anzahl Artikel:</span>
                    <span className="font-medium">{valuation.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gesamtmenge:</span>
                    <span className="font-medium">{valuation.totalQuantity.toLocaleString('de-DE')} Einheiten</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bewertung nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(valuation.byCategory).map(([cat, data]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{CATEGORY_LABELS[cat as InventoryCategory]}</span>
                        <span className="font-medium">{formatCurrency(data.value)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{data.items} Artikel</span>
                        <span>{data.quantity} Einheiten</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${valuation.totalValue > 0 ? (data.value / valuation.totalValue) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Artikeldaten aktualisieren' : 'Neuen Lagerartikel anlegen'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Artikelnummer *</Label>
                <Input
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                  placeholder="z.B. MAT-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Bezeichnung *</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Artikelname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Optionale Beschreibung..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(v) => setItemForm({ ...itemForm, category: v as InventoryCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Select
                  value={itemForm.unit}
                  onValueChange={(v) => setItemForm({ ...itemForm, unit: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bestandskonto</Label>
                <Input
                  value={itemForm.account}
                  onChange={(e) => setItemForm({ ...itemForm, account: e.target.value })}
                  placeholder="3000"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Anfangsbestand</Label>
                <Input
                  type="number"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm({ ...itemForm, quantity: parseFloat(e.target.value) || 0 })}
                  min={0}
                  disabled={!!editingItem}
                />
              </div>
              <div className="space-y-2">
                <Label>Mindestbestand</Label>
                <Input
                  type="number"
                  value={itemForm.minQuantity}
                  onChange={(e) => setItemForm({ ...itemForm, minQuantity: parseFloat(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Einkaufspreis</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemForm.purchasePrice}
                  onChange={(e) => setItemForm({ ...itemForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Verkaufspreis</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemForm.salePrice || ''}
                  onChange={(e) => setItemForm({ ...itemForm, salePrice: parseFloat(e.target.value) || undefined })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Lagerort</Label>
                <Input
                  value={itemForm.location}
                  onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                  placeholder="z.B. Lager A, Regal 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Lieferant</Label>
                <Input
                  value={itemForm.supplier}
                  onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                  placeholder="Lieferantenname"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? 'Aktualisieren' : 'Anlegen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lagerbewegung erfassen</DialogTitle>
            <DialogDescription>
              {selectedItem?.sku} - {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Bewegungsart</Label>
              <Select
                value={movementForm.type}
                onValueChange={(v) => setMovementForm({ ...movementForm, type: v as MovementType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MOVEMENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Menge</Label>
                <Input
                  type="number"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Aktueller Bestand: {selectedItem?.quantity} {selectedItem?.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Stückpreis (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={movementForm.unitPrice}
                  onChange={(e) => setMovementForm({ ...movementForm, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={movementForm.date}
                  onChange={(e) => setMovementForm({ ...movementForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Belegnummer</Label>
                <Input
                  value={movementForm.documentNumber}
                  onChange={(e) => setMovementForm({ ...movementForm, documentNumber: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bemerkung</Label>
              <Textarea
                value={movementForm.notes}
                onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                placeholder="Optionale Bemerkung..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveMovement}>
              Bewegung erfassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bewegungshistorie</DialogTitle>
            <DialogDescription>
              {selectedItem?.sku} - {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Art</TableHead>
                  <TableHead className="text-right">Menge</TableHead>
                  <TableHead className="text-right">Vorher</TableHead>
                  <TableHead className="text-right">Nachher</TableHead>
                  <TableHead>Beleg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItem && getMovementsForItem(selectedItem.id).map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>
                      {format(new Date(mov.date), 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{MOVEMENT_TYPE_LABELS[mov.type]}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${mov.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                    </TableCell>
                    <TableCell className="text-right">{mov.previousQuantity}</TableCell>
                    <TableCell className="text-right font-medium">{mov.newQuantity}</TableCell>
                    <TableCell className="font-mono text-sm">{mov.documentNumber || '-'}</TableCell>
                  </TableRow>
                ))}
                {selectedItem && getMovementsForItem(selectedItem.id).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Keine Bewegungen vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Artikel "{selectedItem?.name}" wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
