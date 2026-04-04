import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, MoreHorizontal, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: string[];
  originalPrice: number;
  bundlePrice: number;
  discount: number;
  status: 'active' | 'inactive';
}

const availableProducts = [
  { id: 'basic', name: 'Basic', price: 9.99 },
  { id: 'pro', name: 'Pro', price: 29.99 },
  { id: 'enterprise', name: 'Enterprise', price: 99.99 },
  { id: 'api_addon', name: 'API Add-on', price: 19.99 },
  { id: 'analytics', name: 'Analytics Pro', price: 14.99 },
  { id: 'storage', name: 'Extra Storage', price: 4.99 },
];

// Bundles werden lokal verwaltet - später mit Supabase synchronisieren
const initialBundles: Bundle[] = [];

interface FormData {
  name: string;
  description: string;
  products: string[];
  bundlePrice: string;
  status: 'active' | 'inactive';
}

export default function Bundles() {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    products: [],
    bundlePrice: '',
    status: 'active',
  });

  const calculateOriginalPrice = (productIds: string[]) => {
    return productIds.reduce((sum, id) => {
      const product = availableProducts.find(p => p.id === id);
      return sum + (product?.price || 0);
    }, 0);
  };

  const handleSave = () => {
    const originalPrice = calculateOriginalPrice(formData.products);
    const bundlePrice = parseFloat(formData.bundlePrice) || 0;
    const discount = originalPrice > 0 ? Math.round((1 - bundlePrice / originalPrice) * 100) : 0;

    const bundleData: Omit<Bundle, 'id'> = {
      name: formData.name,
      description: formData.description,
      products: formData.products,
      originalPrice,
      bundlePrice,
      discount,
      status: formData.status,
    };

    if (editingBundle) {
      setBundles(bundles.map(b => b.id === editingBundle.id ? { ...b, ...bundleData } : b));
    } else {
      setBundles([...bundles, { id: String(Date.now()), ...bundleData }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingBundle(null);
    setFormData({ name: '', description: '', products: [], bundlePrice: '', status: 'active' });
  };

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      description: bundle.description,
      products: bundle.products,
      bundlePrice: String(bundle.bundlePrice),
      status: bundle.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBundles(bundles.filter(b => b.id !== id));
  };

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId],
    }));
  };

  const columns = [
    { key: 'name', header: 'Bundle', render: (bundle: Bundle) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">{bundle.name}</span>
      </div>
    )},
    { key: 'description', header: 'Beschreibung' },
    { key: 'products', header: 'Produkte', render: (bundle: Bundle) => (
      <div className="flex flex-wrap gap-1">
        {bundle.products.map(pid => {
          const product = availableProducts.find(p => p.id === pid);
          return product ? <Badge key={pid} variant="outline" className="text-xs">{product.name}</Badge> : null;
        })}
      </div>
    )},
    { key: 'originalPrice', header: 'Originalpreis', render: (bundle: Bundle) => (
      <span className="text-muted-foreground line-through">€{bundle.originalPrice.toFixed(2)}</span>
    )},
    { key: 'bundlePrice', header: 'Bundle-Preis', render: (bundle: Bundle) => (
      <span className="font-semibold text-primary">€{bundle.bundlePrice.toFixed(2)}</span>
    )},
    { key: 'discount', header: 'Rabatt', render: (bundle: Bundle) => (
      <Badge className="bg-chart-2 text-chart-2-foreground hover:bg-chart-2/90">{bundle.discount}% gespart</Badge>
    )},
    { key: 'status', header: 'Status', render: (bundle: Bundle) => (
      <Badge variant={bundle.status === 'active' ? 'default' : 'secondary'}>
        {bundle.status === 'active' ? 'Aktiv' : 'Inaktiv'}
      </Badge>
    )},
    { key: 'actions', header: '', render: (bundle: Bundle) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(bundle)}>
            <Pencil className="mr-2 h-4 w-4" />Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDelete(bundle.id)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bundles</h1>
            <p className="text-muted-foreground">Kombinieren Sie Produkte zu attraktiven Paketen</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Bundle erstellen</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingBundle ? 'Bundle bearbeiten' : 'Neues Bundle'}</DialogTitle>
                <DialogDescription>
                  {editingBundle ? 'Bearbeiten Sie das Bundle.' : 'Kombinieren Sie mehrere Produkte zu einem Bundle.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Produkte auswählen</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                    {availableProducts.map(product => (
                      <div key={product.id} className="flex items-center gap-2">
                        <Checkbox
                          id={product.id}
                          checked={formData.products.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        <label htmlFor={product.id} className="text-sm cursor-pointer">
                          {product.name} <span className="text-muted-foreground">(€{product.price})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.products.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Originalpreis: €{calculateOriginalPrice(formData.products).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bundlePrice">Bundle-Preis (€)</Label>
                  <Input
                    id="bundlePrice"
                    type="number"
                    step="0.01"
                    value={formData.bundlePrice}
                    onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
                  />
                  {formData.bundlePrice && formData.products.length > 0 && (
                    <p className="text-sm text-chart-2">
                      Rabatt: {Math.round((1 - parseFloat(formData.bundlePrice) / calculateOriginalPrice(formData.products)) * 100)}%
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Abbrechen</Button>
                <Button onClick={handleSave}>Speichern</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable<Bundle>
          data={bundles}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Nach Bundle suchen..."
        />
      </div>
    </DashboardLayout>
  );
}
