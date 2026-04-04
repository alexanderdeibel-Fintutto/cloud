import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, ExternalLink, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProductsWithPrices } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';

interface ProductWithPrice {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  app_id: string | null;
  tier: string | null;
  features: Record<string, unknown> | null;
  mainPrice?: {
    unit_amount: number | null;
    currency: string | null;
    recurring_interval: string | null;
  };
}

export default function Products() {
  const { data: products, isLoading } = useProductsWithPrices();
  const queryClient = useQueryClient();

  const formatPrice = (product: ProductWithPrice) => {
    if (!product.mainPrice?.unit_amount) return 'Kostenlos';
    const amount = product.mainPrice.unit_amount / 100;
    const interval = product.mainPrice.recurring_interval;
    const suffix = interval === 'month' ? '/Monat' : interval === 'year' ? '/Jahr' : '';
    return `€${amount.toFixed(2)}${suffix}`;
  };

  const columns = [
    { key: 'name', header: 'Produkt' },
    { key: 'description', header: 'Beschreibung', render: (product: ProductWithPrice) => (
      <span className="max-w-[200px] truncate block text-muted-foreground">
        {product.description || '-'}
      </span>
    )},
    { key: 'tier', header: 'Tier', render: (product: ProductWithPrice) => (
      <Badge variant="outline">{product.tier || '-'}</Badge>
    )},
    { key: 'price', header: 'Preis', render: (product: ProductWithPrice) => formatPrice(product) },
    { key: 'status', header: 'Status', render: (product: ProductWithPrice) => (
      <Badge variant={product.active ? 'default' : 'secondary'}>
        {product.active ? 'Aktiv' : 'Inaktiv'}
      </Badge>
    )},
    { key: 'app_id', header: 'App', render: (product: ProductWithPrice) => (
      <span className="text-xs text-muted-foreground">{product.app_id || '-'}</span>
    )},
    { key: 'actions', header: '', render: (product: ProductWithPrice) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => window.open(`https://dashboard.stripe.com/products/${product.id}`, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            In Stripe öffnen
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
            <h1 className="text-3xl font-bold tracking-tight">Produkte</h1>
            <p className="text-muted-foreground">
              Stripe-Produkte und Preise (synchronisiert aus Stripe)
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
            <Button onClick={() => window.open('https://dashboard.stripe.com/products/create', '_blank')}>
              In Stripe erstellen
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : products && products.length > 0 ? (
          <DataTable<ProductWithPrice>
            data={products}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Nach Produktname suchen..."
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Keine Produkte gefunden. Erstellen Sie Produkte in Stripe.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
              >
                Stripe Dashboard öffnen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
