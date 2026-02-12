import { useState, useMemo } from 'react';
import {
  Package, Plus, Search, Filter, Edit, Trash2, Eye, TrendingDown,
  Calendar, Euro, Building2, Car, Monitor, Briefcase, FileText,
  ChevronRight, Download, BarChart3, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAssetManagement,
  type Asset,
  type AssetCategory,
  type AssetStatus,
  CATEGORY_LABELS,
  METHOD_LABELS,
  DEPRECIATION_RATES,
} from '@/hooks/useAssetManagement';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const categoryIcons: Record<AssetCategory, typeof Package> = {
  grundstuecke: Building2,
  gebaeude: Building2,
  maschinen: Package,
  fahrzeuge: Car,
  betriebs_geschaeft: Briefcase,
  edv: Monitor,
  immaterielle: FileText,
  gwg: Package,
  sammelposten: Package,
};

const statusConfig: Record<AssetStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  disposed: { label: 'Veräußert', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
  fully_depreciated: { label: 'Vollständig abgeschrieben', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
};

export default function AssetManagement() {
  const { toast } = useToast();
  const {
    assets,
    loading,
    stats,
    addAsset,
    updateAsset,
    disposeAsset,
    deleteAsset,
    getBookValue,
    getTotalDepreciation,
    getAssetDepreciation,
    getNextInventoryNumber,
    isGWG,
    isSammelposten,
  } = useAssetManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [disposeDialogOpen, setDisposeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state for new asset
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    category: 'edv' as AssetCategory,
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: 0,
    useful_life_years: 3,
    depreciation_method: 'linear' as const,
    residual_value: 0,
    location: '',
    serial_number: '',
    supplier: '',
    invoice_number: '',
    account_number: '',
    cost_center: '',
    notes: '',
  });

  // Disposal form state
  const [disposalData, setDisposalData] = useState({
    date: new Date().toISOString().split('T')[0],
    value: 0,
  });

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(query) ||
          a.inventory_number.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [assets, categoryFilter, statusFilter, searchQuery]);

  // Handle category change - auto-set depreciation
  const handleCategoryChange = (category: AssetCategory) => {
    const defaults = DEPRECIATION_RATES[category];
    setNewAsset(prev => ({
      ...prev,
      category,
      useful_life_years: defaults.years,
      depreciation_method: defaults.method,
    }));
  };

  // Handle cost change - check for GWG
  const handleCostChange = (cost: number) => {
    let category = newAsset.category;
    let method = newAsset.depreciation_method;
    let years = newAsset.useful_life_years;

    if (isGWG(cost) && cost > 0) {
      category = 'gwg';
      method = 'sofort';
      years = 1;
    } else if (isSammelposten(cost)) {
      category = 'sammelposten';
      method = 'linear';
      years = 5;
    }

    setNewAsset(prev => ({
      ...prev,
      acquisition_cost: cost,
      category,
      depreciation_method: method,
      useful_life_years: years,
    }));
  };

  // Handle add asset
  const handleAddAsset = () => {
    if (!newAsset.name || newAsset.acquisition_cost <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive',
      });
      return;
    }

    addAsset({
      ...newAsset,
      status: newAsset.depreciation_method === 'sofort' ? 'fully_depreciated' : 'active',
    });

    toast({
      title: 'Anlage hinzugefügt',
      description: `${newAsset.name} wurde erfolgreich erfasst.`,
    });

    setAddDialogOpen(false);
    resetNewAssetForm();
  };

  // Handle dispose asset
  const handleDisposeAsset = () => {
    if (!selectedAsset) return;

    disposeAsset(selectedAsset.id, disposalData.date, disposalData.value);

    toast({
      title: 'Anlage veräußert',
      description: `${selectedAsset.name} wurde als veräußert markiert.`,
    });

    setDisposeDialogOpen(false);
    setSelectedAsset(null);
  };

  // Handle delete asset
  const handleDeleteAsset = () => {
    if (!selectedAsset) return;

    deleteAsset(selectedAsset.id);

    toast({
      title: 'Anlage gelöscht',
      description: `${selectedAsset.name} wurde gelöscht.`,
    });

    setDeleteDialogOpen(false);
    setSelectedAsset(null);
  };

  // Reset form
  const resetNewAssetForm = () => {
    setNewAsset({
      name: '',
      description: '',
      category: 'edv',
      acquisition_date: new Date().toISOString().split('T')[0],
      acquisition_cost: 0,
      useful_life_years: 3,
      depreciation_method: 'linear',
      residual_value: 0,
      location: '',
      serial_number: '',
      supplier: '',
      invoice_number: '',
      account_number: '',
      cost_center: '',
      notes: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Anlagenverwaltung</h1>
          <p className="text-muted-foreground">
            Anlagevermögen und AfA-Berechnung
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Anlage
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anlagen gesamt</p>
                <p className="text-2xl font-bold">{stats.totalAssets}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Anschaffungswert</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Kum. AfA</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalDepreciation)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Buchwert</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.netBookValue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Verteilung nach Kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.byCategory.map(cat => {
              const Icon = categoryIcons[cat.category];
              return (
                <div key={cat.category} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-background rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{CATEGORY_LABELS[cat.category]}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.count} Anlagen • {formatCurrency(cat.value)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="fully_depreciated">Abgeschrieben</SelectItem>
            <SelectItem value="disposed">Veräußert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Anlagen gefunden</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Anlage erfassen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inventar-Nr.</TableHead>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="text-right">Anschaffung</TableHead>
                  <TableHead className="text-right">Buchwert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const bookValue = getBookValue(asset.id);
                  const depreciation = getTotalDepreciation(asset.id);
                  const depreciationPercent = asset.acquisition_cost > 0
                    ? (depreciation / asset.acquisition_cost) * 100
                    : 0;
                  const status = statusConfig[asset.status];
                  const CategoryIcon = categoryIcons[asset.category];

                  return (
                    <TableRow
                      key={asset.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <TableCell className="font-mono text-sm">
                        {asset.inventory_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          {asset.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {asset.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{CATEGORY_LABELS[asset.category]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatCurrency(asset.acquisition_cost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(asset.acquisition_date), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatCurrency(bookValue)}</p>
                          <div className="flex items-center gap-2 justify-end">
                            <Progress value={100 - depreciationPercent} className="w-16 h-1.5" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(100 - depreciationPercent)}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Asset Detail Sheet */}
      <Sheet open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedAsset && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedAsset.name}</SheetTitle>
                <SheetDescription>
                  {selectedAsset.inventory_number}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="depreciation">AfA-Verlauf</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Kategorie</p>
                      <p className="font-medium">{CATEGORY_LABELS[selectedAsset.category]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className={statusConfig[selectedAsset.status].color}>
                        {statusConfig[selectedAsset.status].label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Anschaffungsdatum</p>
                      <p className="font-medium">
                        {format(parseISO(selectedAsset.acquisition_date), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Anschaffungskosten</p>
                      <p className="font-medium">{formatCurrency(selectedAsset.acquisition_cost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Buchwert</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(getBookValue(selectedAsset.id))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kum. AfA</p>
                      <p className="font-medium text-orange-600">
                        {formatCurrency(getTotalDepreciation(selectedAsset.id))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nutzungsdauer</p>
                      <p className="font-medium">{selectedAsset.useful_life_years} Jahre</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AfA-Methode</p>
                      <p className="font-medium">{METHOD_LABELS[selectedAsset.depreciation_method]}</p>
                    </div>
                  </div>

                  {(selectedAsset.location || selectedAsset.serial_number || selectedAsset.supplier) && (
                    <>
                      <hr />
                      <div className="grid grid-cols-2 gap-4">
                        {selectedAsset.location && (
                          <div>
                            <p className="text-sm text-muted-foreground">Standort</p>
                            <p className="font-medium">{selectedAsset.location}</p>
                          </div>
                        )}
                        {selectedAsset.serial_number && (
                          <div>
                            <p className="text-sm text-muted-foreground">Seriennummer</p>
                            <p className="font-medium font-mono text-sm">{selectedAsset.serial_number}</p>
                          </div>
                        )}
                        {selectedAsset.supplier && (
                          <div>
                            <p className="text-sm text-muted-foreground">Lieferant</p>
                            <p className="font-medium">{selectedAsset.supplier}</p>
                          </div>
                        )}
                        {selectedAsset.invoice_number && (
                          <div>
                            <p className="text-sm text-muted-foreground">Rechnungsnummer</p>
                            <p className="font-medium font-mono text-sm">{selectedAsset.invoice_number}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {selectedAsset.status === 'active' && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDisposeDialogOpen(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Veräußern
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="depreciation" className="mt-4">
                  <div className="space-y-2">
                    {getAssetDepreciation(selectedAsset.id).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{entry.year}</p>
                          <p className="text-xs text-muted-foreground">
                            Buchwert: {formatCurrency(entry.book_value_end)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">
                            -{formatCurrency(entry.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {getAssetDepreciation(selectedAsset.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        {selectedAsset.depreciation_method === 'sofort'
                          ? 'GWG wurde sofort abgeschrieben'
                          : 'Keine AfA-Einträge vorhanden'}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Asset Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Anlage erfassen</DialogTitle>
            <DialogDescription>
              Erfassen Sie ein neues Anlagegut mit allen relevanten Daten
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Bezeichnung *</Label>
                <Input
                  id="name"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. MacBook Pro 16&quot;"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Weitere Details..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="acquisition_cost">Anschaffungskosten *</Label>
                <Input
                  id="acquisition_cost"
                  type="number"
                  step="0.01"
                  value={newAsset.acquisition_cost || ''}
                  onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
                {isGWG(newAsset.acquisition_cost) && newAsset.acquisition_cost > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    GWG - Sofortabschreibung möglich
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="acquisition_date">Anschaffungsdatum *</Label>
                <Input
                  id="acquisition_date"
                  type="date"
                  value={newAsset.acquisition_date}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, acquisition_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={newAsset.category}
                  onValueChange={(v) => handleCategoryChange(v as AssetCategory)}
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
              <div>
                <Label htmlFor="useful_life">Nutzungsdauer (Jahre)</Label>
                <Input
                  id="useful_life"
                  type="number"
                  value={newAsset.useful_life_years}
                  onChange={(e) => setNewAsset(prev => ({
                    ...prev,
                    useful_life_years: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="method">AfA-Methode</Label>
                <Select
                  value={newAsset.depreciation_method}
                  onValueChange={(v) => setNewAsset(prev => ({
                    ...prev,
                    depreciation_method: v as any
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METHOD_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="residual_value">Restwert</Label>
                <Input
                  id="residual_value"
                  type="number"
                  step="0.01"
                  value={newAsset.residual_value || ''}
                  onChange={(e) => setNewAsset(prev => ({
                    ...prev,
                    residual_value: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="0,00"
                />
              </div>

              <hr className="col-span-2" />

              <div>
                <Label htmlFor="location">Standort</Label>
                <Input
                  id="location"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="z.B. Büro Hauptsitz"
                />
              </div>
              <div>
                <Label htmlFor="serial_number">Seriennummer</Label>
                <Input
                  id="serial_number"
                  value={newAsset.serial_number}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, serial_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Lieferant</Label>
                <Input
                  id="supplier"
                  value={newAsset.supplier}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="invoice_number">Rechnungsnummer</Label>
                <Input
                  id="invoice_number"
                  value={newAsset.invoice_number}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, invoice_number: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddAsset}>
              Anlage erfassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispose Dialog */}
      <Dialog open={disposeDialogOpen} onOpenChange={setDisposeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anlage veräußern</DialogTitle>
            <DialogDescription>
              Erfassen Sie den Verkauf oder die Entsorgung der Anlage
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Veräußerungsdatum</Label>
              <Input
                type="date"
                value={disposalData.date}
                onChange={(e) => setDisposalData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Veräußerungserlös</Label>
              <Input
                type="number"
                step="0.01"
                value={disposalData.value || ''}
                onChange={(e) => setDisposalData(prev => ({
                  ...prev,
                  value: parseFloat(e.target.value) || 0
                }))}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposeDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleDisposeAsset}>
              Veräußerung erfassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anlage löschen?</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Anlage und alle
              zugehörigen AfA-Buchungen werden dauerhaft gelöscht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteAsset}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
