import { useState, useMemo } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PARTNER_SHOPS, generateSearchUrl, MATERIAL_SUGGESTIONS } from '@/lib/partner-shops';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Plus,
  Trash2,
  ExternalLink,
  Package,
  Leaf,
  Flower2,
  Shovel,
  Bug,
  CircleEllipsis,
  Droplets,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Store,
} from 'lucide-react';
import type { ShoppingItem } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  soil: 'Erde',
  fertilizer: 'Dünger',
  pot: 'Topf',
  tool: 'Werkzeug',
  pesticide: 'Schädlingsbekämpfung',
  other: 'Sonstiges',
};

const CATEGORY_ICONS: Record<string, typeof Package> = {
  soil: Package,
  fertilizer: Droplets,
  pot: Flower2,
  tool: Shovel,
  pesticide: Bug,
  other: CircleEllipsis,
};

const CATEGORY_COLORS: Record<string, string> = {
  soil: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  fertilizer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pot: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  tool: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  pesticide: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  other: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const CATEGORY_ORDER: ShoppingItem['category'][] = [
  'soil',
  'fertilizer',
  'pot',
  'tool',
  'pesticide',
  'other',
];

export default function ShoppingPage() {
  const {
    shoppingItems,
    plants,
    getEnrichedPlants,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
  } = usePlants();

  const [showAddForm, setShowAddForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<ShoppingItem['category']>('soil');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPlantId, setItemPlantId] = useState<string>('none');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    CATEGORY_ORDER.forEach((cat) => {
      const items = shoppingItems.filter((i) => i.category === cat);
      if (items.length > 0) {
        groups[cat] = items;
      }
    });
    return groups;
  }, [shoppingItems]);

  const purchasedCount = shoppingItems.filter((i) => i.purchased).length;
  const totalCount = shoppingItems.length;

  // Suggestions based on selected category
  const suggestions = MATERIAL_SUGGESTIONS[itemCategory] || [];

  function handleAddItem() {
    if (!itemName.trim()) {
      toast.error('Bitte einen Artikelnamen eingeben');
      return;
    }

    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      toast.error('Bitte eine gueltige Menge eingeben');
      return;
    }

    addShoppingItem({
      name: itemName.trim(),
      category: itemCategory,
      for_plant_id: itemPlantId === 'none' ? null : itemPlantId,
      quantity: qty,
      purchased: false,
      affiliate_links: PARTNER_SHOPS.map((shop) => ({
        shop: shop.name,
        url: generateSearchUrl(shop, itemName.trim()),
        price: null,
        logo_url: shop.logo_url,
      })),
    });

    toast.success(`"${itemName.trim()}" zur Einkaufsliste hinzugefügt`);
    setItemName('');
    setItemQuantity('1');
    setItemPlantId('none');
  }

  function handleTogglePurchased(id: string) {
    const item = shoppingItems.find((i) => i.id === id);
    if (!item) return;
    updateShoppingItem(id, { purchased: !item.purchased });
  }

  function handleDeleteItem(id: string) {
    const item = shoppingItems.find((i) => i.id === id);
    deleteShoppingItem(id);
    toast.success(`"${item?.name}" entfernt`);
  }

  function handleDeletePurchased() {
    const purchasedItems = shoppingItems.filter((i) => i.purchased);
    purchasedItems.forEach((item) => deleteShoppingItem(item.id));
    setShowDeleteConfirm(false);
    toast.success(`${purchasedItems.length} gekaufte Artikel entfernt`);
  }

  function handleSuggestionClick(suggestion: string) {
    setItemName(suggestion);
  }

  function getPlantNameById(plantId: string | null): string | null {
    if (!plantId) return null;
    const plant = enrichedPlants.find((p) => p.id === plantId);
    return plant?.nickname || plant?.species?.common_name || null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Einkaufsliste</h1>
            <p className="text-muted-foreground text-sm">
              Materialien und Zubehör für deine Pflanzen
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Artikel hinzufügen
        </Button>
      </div>

      {/* Summary Bar */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                {purchasedCount} von {totalCount} Artikeln gekauft
              </span>
            </div>
            <div className="h-2 w-48 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          {purchasedCount > 0 && (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-destructive">
                    {purchasedCount} Artikel entfernen?
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeletePurchased}
                  >
                    Ja, entfernen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Abbrechen
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Gekaufte entfernen
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neuen Artikel hinzufügen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="item-name">Artikelname *</Label>
                <Input
                  id="item-name"
                  placeholder="z.B. Blumenerde Universal"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-category">Kategorie</Label>
                <Select
                  value={itemCategory}
                  onValueChange={(v) => setItemCategory(v as ShoppingItem['category'])}
                >
                  <SelectTrigger id="item-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ORDER.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-qty">Menge</Label>
                <Input
                  id="item-qty"
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-plant">Für Pflanze (optional)</Label>
              <Select value={itemPlantId} onValueChange={setItemPlantId}>
                <SelectTrigger id="item-plant" className="w-full md:w-80">
                  <SelectValue placeholder="Keine Pflanze zugeordnet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Pflanze zugeordnet</SelectItem>
                  {enrichedPlants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.nickname || plant.species?.common_name || 'Pflanze'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Vorschläge für {CATEGORY_LABELS[itemCategory]}</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {shoppingItems.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Einkaufsliste ist leer</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Füge Materialien und Zubehör hinzu, die du für deine Pflanzen benötigst.
              Du findest Links zu den besten Gartencentern und Online-Shops.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ersten Artikel hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shopping List grouped by Category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => {
          const CategoryIcon = CATEGORY_ICONS[category] || Package;
          const unpurchasedCount = items.filter((i) => !i.purchased).length;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${CATEGORY_COLORS[category]}`}
                >
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-lg">{CATEGORY_LABELS[category]}</h3>
                <Badge variant="secondary" className="ml-1">
                  {unpurchasedCount}/{items.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  const plantName = getPlantNameById(item.for_plant_id);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border transition-all ${
                        item.purchased
                          ? 'bg-muted/50 border-muted'
                          : 'bg-card hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <Checkbox
                          checked={item.purchased}
                          onCheckedChange={() => handleTogglePurchased(item.id)}
                          className="flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                item.purchased ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.quantity > 1 && (
                              <Badge variant="outline" className="text-xs">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                          {plantName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Leaf className="h-3 w-3" />
                              Für: {plantName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.id)
                            }
                            className="text-muted-foreground"
                          >
                            <Store className="h-4 w-4 mr-1" />
                            Shops
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Partner Shops - Expanded */}
                      {isExpanded && (
                        <div className="px-3 pb-3">
                          <Separator className="mb-3" />
                          <p className="text-xs text-muted-foreground mb-2">
                            Bei Partner-Shops suchen:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {PARTNER_SHOPS.map((shop) => {
                              const searchUrl = generateSearchUrl(shop, item.name);
                              return (
                                <Button
                                  key={shop.id}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  asChild
                                >
                                  <a
                                    href={searchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {shop.name}
                                  </a>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
