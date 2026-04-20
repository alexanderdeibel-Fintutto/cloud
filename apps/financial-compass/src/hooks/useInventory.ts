import { useState, useCallback, useEffect } from 'react';

export type InventoryCategory = 'material' | 'product' | 'merchandise' | 'supplies' | 'spare_parts';
export type InventoryStatus = 'active' | 'low_stock' | 'out_of_stock' | 'discontinued';
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer' | 'inventory_count';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  purchasePrice: number;
  salePrice?: number;
  taxRate: number;
  location?: string;
  supplier?: string;
  supplierId?: string;
  account: string; // Bestandskonto
  status: InventoryStatus;
  lastPurchaseDate?: string;
  lastSaleDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  date: string;
  type: MovementType;
  quantity: number; // positive for in, negative for out
  unitPrice: number;
  totalValue: number;
  documentNumber?: string;
  documentType?: string;
  reference?: string;
  notes?: string;
  previousQuantity: number;
  newQuantity: number;
  createdBy?: string;
  createdAt: string;
}

export interface InventoryValuation {
  date: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  byCategory: Record<InventoryCategory, { items: number; quantity: number; value: number }>;
}

const STORAGE_KEY = 'fintutto_inventory';

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  material: 'Rohstoffe',
  product: 'Fertigprodukte',
  merchandise: 'Handelswaren',
  supplies: 'Betriebsstoffe',
  spare_parts: 'Ersatzteile',
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  purchase: 'Einkauf',
  sale: 'Verkauf',
  adjustment: 'Bestandskorrektur',
  return: 'Rückgabe',
  transfer: 'Umlagerung',
  inventory_count: 'Inventur',
};

export const UNIT_OPTIONS = [
  { value: 'Stück', label: 'Stück' },
  { value: 'kg', label: 'Kilogramm' },
  { value: 'g', label: 'Gramm' },
  { value: 'l', label: 'Liter' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'm', label: 'Meter' },
  { value: 'cm', label: 'Zentimeter' },
  { value: 'm²', label: 'Quadratmeter' },
  { value: 'm³', label: 'Kubikmeter' },
  { value: 'Packung', label: 'Packung' },
  { value: 'Karton', label: 'Karton' },
  { value: 'Palette', label: 'Palette' },
];

const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'inv-1',
    sku: 'MAT-001',
    name: 'Stahlblech 2mm',
    description: 'Verzinktes Stahlblech, 2mm Dicke, 1x2m',
    category: 'material',
    unit: 'm²',
    quantity: 150,
    minQuantity: 50,
    purchasePrice: 15.50,
    salePrice: 22.00,
    taxRate: 19,
    location: 'Lager A, Regal 1',
    supplier: 'Stahlhandel GmbH',
    account: '3000',
    status: 'active',
    lastPurchaseDate: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    sku: 'PRD-001',
    name: 'Gehäuse Typ A',
    description: 'Metallgehäuse für Elektronik, lackiert',
    category: 'product',
    unit: 'Stück',
    quantity: 45,
    minQuantity: 20,
    purchasePrice: 35.00,
    salePrice: 85.00,
    taxRate: 19,
    location: 'Lager B, Regal 3',
    account: '3980',
    status: 'active',
    lastSaleDate: '2024-01-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    sku: 'HDW-001',
    name: 'Schrauben M6x20',
    description: 'Sechskantschrauben M6x20, verzinkt',
    category: 'supplies',
    unit: 'Packung',
    quantity: 12,
    minQuantity: 25,
    purchasePrice: 8.50,
    taxRate: 19,
    location: 'Lager A, Regal 5',
    supplier: 'Schrauben Müller',
    account: '3000',
    status: 'low_stock',
    lastPurchaseDate: '2024-01-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-4',
    sku: 'SPR-001',
    name: 'Motor 0.5kW',
    description: 'Ersatzmotor für Förderbänder',
    category: 'spare_parts',
    unit: 'Stück',
    quantity: 3,
    minQuantity: 2,
    purchasePrice: 245.00,
    taxRate: 19,
    location: 'Lager C, Regal 1',
    account: '3000',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setItems(data.items || DEFAULT_ITEMS);
        setMovements(data.movements || []);
      } catch {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  const saveData = useCallback((
    newItems?: InventoryItem[],
    newMovements?: InventoryMovement[]
  ) => {
    const data = {
      items: newItems || items,
      movements: newMovements || movements,
    };
    if (newItems) setItems(newItems);
    if (newMovements) setMovements(newMovements);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items, movements]);

  // Calculate item status
  const calculateStatus = useCallback((item: InventoryItem): InventoryStatus => {
    if (item.quantity <= 0) return 'out_of_stock';
    if (item.quantity < item.minQuantity) return 'low_stock';
    return 'active';
  }, []);

  // Create inventory item
  const createItem = useCallback((item: Omit<InventoryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newItem.status = calculateStatus(newItem);
    saveData([...items, newItem]);
    return newItem;
  }, [items, calculateStatus, saveData]);

  // Update inventory item
  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    saveData(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
      updated.status = calculateStatus(updated);
      return updated;
    }));
  }, [items, calculateStatus, saveData]);

  // Delete inventory item
  const deleteItem = useCallback((id: string) => {
    saveData(
      items.filter(item => item.id !== id),
      movements.filter(m => m.itemId !== id)
    );
  }, [items, movements, saveData]);

  // Record inventory movement
  const recordMovement = useCallback((movement: Omit<InventoryMovement, 'id' | 'itemName' | 'sku' | 'previousQuantity' | 'newQuantity' | 'createdAt'>) => {
    const item = items.find(i => i.id === movement.itemId);
    if (!item) return null;

    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity + movement.quantity;

    const newMovement: InventoryMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      itemName: item.name,
      sku: item.sku,
      previousQuantity,
      newQuantity,
      createdAt: new Date().toISOString(),
    };

    // Update item quantity
    const updatedItems = items.map(i => {
      if (i.id !== movement.itemId) return i;
      const updated = {
        ...i,
        quantity: newQuantity,
        updatedAt: new Date().toISOString(),
      };

      // Update last purchase/sale date
      if (movement.type === 'purchase') {
        updated.lastPurchaseDate = movement.date;
      } else if (movement.type === 'sale') {
        updated.lastSaleDate = movement.date;
      }

      updated.status = calculateStatus(updated);
      return updated;
    });

    saveData(updatedItems, [...movements, newMovement]);
    return newMovement;
  }, [items, movements, calculateStatus, saveData]);

  // Get movements for item
  const getMovementsForItem = useCallback((itemId: string): InventoryMovement[] => {
    return movements
      .filter(m => m.itemId === itemId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [movements]);

  // Get low stock items
  const getLowStockItems = useCallback((): InventoryItem[] => {
    return items.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock');
  }, [items]);

  // Get items by category
  const getByCategory = useCallback((category: InventoryCategory): InventoryItem[] => {
    return items.filter(i => i.category === category);
  }, [items]);

  // Calculate valuation
  const calculateValuation = useCallback((date?: string): InventoryValuation => {
    const activeItems = items.filter(i => i.status !== 'discontinued');

    const byCategory: Record<InventoryCategory, { items: number; quantity: number; value: number }> = {
      material: { items: 0, quantity: 0, value: 0 },
      product: { items: 0, quantity: 0, value: 0 },
      merchandise: { items: 0, quantity: 0, value: 0 },
      supplies: { items: 0, quantity: 0, value: 0 },
      spare_parts: { items: 0, quantity: 0, value: 0 },
    };

    let totalQuantity = 0;
    let totalValue = 0;

    for (const item of activeItems) {
      const value = item.quantity * item.purchasePrice;
      totalQuantity += item.quantity;
      totalValue += value;

      byCategory[item.category].items++;
      byCategory[item.category].quantity += item.quantity;
      byCategory[item.category].value += value;
    }

    return {
      date: date || new Date().toISOString().split('T')[0],
      totalItems: activeItems.length,
      totalQuantity,
      totalValue,
      byCategory,
    };
  }, [items]);

  // Search items
  const searchItems = useCallback((query: string): InventoryItem[] => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.sku.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.supplier?.toLowerCase().includes(q)
    );
  }, [items]);

  // Get summary
  const getSummary = useCallback(() => {
    const valuation = calculateValuation();
    const lowStock = getLowStockItems();

    return {
      totalItems: items.length,
      activeItems: items.filter(i => i.status === 'active').length,
      lowStockCount: lowStock.filter(i => i.status === 'low_stock').length,
      outOfStockCount: lowStock.filter(i => i.status === 'out_of_stock').length,
      totalValue: valuation.totalValue,
      movementsThisMonth: movements.filter(m => {
        const thisMonth = new Date().toISOString().slice(0, 7);
        return m.date.startsWith(thisMonth);
      }).length,
    };
  }, [items, movements, calculateValuation, getLowStockItems]);

  // Export inventory
  const exportInventory = useCallback(() => {
    const headers = [
      'Artikelnummer',
      'Bezeichnung',
      'Kategorie',
      'Einheit',
      'Bestand',
      'Mindestbestand',
      'Einkaufspreis',
      'Verkaufspreis',
      'Lagerwert',
      'Lagerort',
      'Lieferant',
      'Status',
    ];

    const rows = items.map(i => [
      i.sku,
      i.name,
      CATEGORY_LABELS[i.category],
      i.unit,
      i.quantity.toString(),
      i.minQuantity.toString(),
      i.purchasePrice.toFixed(2),
      i.salePrice?.toFixed(2) || '',
      (i.quantity * i.purchasePrice).toFixed(2),
      i.location || '',
      i.supplier || '',
      i.status,
    ]);

    const valuation = calculateValuation();
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    rows.push(['Gesamtwert:', '', '', '', '', '', '', '', valuation.totalValue.toFixed(2), '', '', '']);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bestand_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items, calculateValuation]);

  // Export movements
  const exportMovements = useCallback((fromDate?: string, toDate?: string) => {
    let filtered = movements;
    if (fromDate) {
      filtered = filtered.filter(m => m.date >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter(m => m.date <= toDate);
    }

    const headers = [
      'Datum',
      'Artikelnummer',
      'Bezeichnung',
      'Bewegungsart',
      'Menge',
      'Stückpreis',
      'Gesamtwert',
      'Vorheriger Bestand',
      'Neuer Bestand',
      'Beleg',
      'Bemerkung',
    ];

    const rows = filtered
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => [
        m.date,
        m.sku,
        m.itemName,
        MOVEMENT_TYPE_LABELS[m.type],
        m.quantity.toString(),
        m.unitPrice.toFixed(2),
        m.totalValue.toFixed(2),
        m.previousQuantity.toString(),
        m.newQuantity.toString(),
        m.documentNumber || '',
        m.notes || '',
      ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lagerbewegungen_${fromDate || 'alle'}_${toDate || new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [movements]);

  return {
    items,
    movements,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    recordMovement,
    getMovementsForItem,
    getLowStockItems,
    getByCategory,
    calculateValuation,
    searchItems,
    getSummary,
    exportInventory,
    exportMovements,
  };
}
