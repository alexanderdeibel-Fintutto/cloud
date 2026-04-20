import { useState } from 'react';
import {
  useChartOfAccounts,
  Account,
  ACCOUNT_TYPES,
  ACCOUNT_CATEGORIES,
} from '@/hooks/useChartOfAccounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Download,
  Search,
  BookOpen,
  Pencil,
  Trash2,
  Lock,
} from 'lucide-react';

export default function ChartOfAccounts() {
  const { toast } = useToast();
  const {
    accounts,
    isLoading,
    activeSKR,
    groups,
    createAccount,
    updateAccount,
    deleteAccount,
    getTree,
    searchAccounts,
    validateAccountNumber,
    exportAccounts,
    getStats,
  } = useChartOfAccounts();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    number: '',
    name: '',
    description: '',
    type: 'expense' as Account['type'],
    category: 'aufwendungen' as Account['category'],
    taxRate: undefined as number | undefined,
    isHeader: false,
    isActive: true,
  });

  const stats = getStats();
  const tree = getTree();
  const searchResults = searchQuery ? searchAccounts(searchQuery) : [];

  const resetForm = () => {
    setFormData({
      number: '',
      name: '',
      description: '',
      type: 'expense',
      category: 'aufwendungen',
      taxRate: undefined,
      isHeader: false,
      isActive: true,
    });
    setEditingAccount(null);
  };

  const openEditDialog = (account: Account) => {
    setFormData({
      number: account.number,
      name: account.name,
      description: account.description || '',
      type: account.type,
      category: account.category,
      taxRate: account.taxRate,
      isHeader: account.isHeader,
      isActive: account.isActive,
    });
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.number || !formData.name) {
      toast({ title: 'Fehler', description: 'Kontonummer und Name sind erforderlich', variant: 'destructive' });
      return;
    }

    if (!editingAccount) {
      const validation = validateAccountNumber(formData.number);
      if (!validation.valid) {
        toast({ title: 'Fehler', description: validation.error, variant: 'destructive' });
        return;
      }
    }

    try {
      if (editingAccount) {
        updateAccount(editingAccount.id, { ...formData, skr: activeSKR, isSystem: false });
        toast({ title: 'Konto aktualisiert' });
      } else {
        createAccount({ ...formData, skr: activeSKR, isSystem: false });
        toast({ title: 'Konto erstellt' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteAccount(id);
      toast({ title: 'Konto gelöscht' });
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    }
  };

  const getTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
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
          <h1 className="text-3xl font-bold">Kontenplan</h1>
          <p className="text-muted-foreground">SKR{activeSKR} - Standardkontenrahmen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportAccounts('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Konto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Benutzerdefiniert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.custom}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mit Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withBalance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Konto suchen (Nummer oder Name)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Suchergebnisse ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Keine Konten gefunden</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Konto</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.slice(0, 10).map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.number}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(account.type)}>
                          {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.balance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell>
                        {!account.isSystem && (
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(account)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Groups */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Kontenklassen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {tree.map((group) => (
                <AccordionItem key={group.range} value={group.range}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">{group.range}xxx</Badge>
                      <span>{group.name}</span>
                      <Badge className={getTypeColor(group.type)}>{group.accounts.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Konto</TableHead>
                          <TableHead>Bezeichnung</TableHead>
                          <TableHead>MwSt</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.accounts.map((account) => (
                          <TableRow key={account.id} className={account.isHeader ? 'font-semibold bg-muted/50' : ''}>
                            <TableCell className="font-mono">{account.number}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {account.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
                                {account.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {account.taxRate ? `${account.taxRate}%` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.balance !== 0
                                ? account.balance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {!account.isSystem && (
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(account)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(account.id)}
                                    disabled={account.balance !== 0}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Konto bearbeiten' : 'Neues Konto'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kontonummer *</Label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="4-stellig"
                  disabled={editingAccount?.isSystem}
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bezeichnung *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_CATEGORIES.filter(c => c.type === formData.type).map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>MwSt-Satz</Label>
                <Select
                  value={formData.taxRate?.toString() || ''}
                  onValueChange={(v) => setFormData({ ...formData, taxRate: v ? parseInt(v) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Keine</SelectItem>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                    <SelectItem value="19">19%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isHeader}
                  onCheckedChange={(checked) => setFormData({ ...formData, isHeader: checked })}
                />
                <Label>Überschriftenkonto</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Aktiv</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave}>{editingAccount ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
