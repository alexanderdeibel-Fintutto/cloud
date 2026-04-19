import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type AssetCategory =
  | 'grundstuecke'           // Land & Buildings
  | 'gebaeude'               // Buildings
  | 'maschinen'              // Machinery
  | 'fahrzeuge'              // Vehicles
  | 'betriebs_geschaeft'     // Office Equipment
  | 'edv'                    // IT Equipment
  | 'immaterielle'           // Intangible Assets
  | 'gwg'                    // Low-value assets (GWG)
  | 'sammelposten';          // Collective items (250-1000€)

export type DepreciationMethod =
  | 'linear'                 // Straight-line
  | 'degressiv'              // Declining balance
  | 'leistung'               // Units of production
  | 'sofort';                // Immediate (GWG)

export type AssetStatus = 'active' | 'disposed' | 'fully_depreciated';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  inventory_number: string;
  category: AssetCategory;
  acquisition_date: string;
  acquisition_cost: number;
  useful_life_years: number;
  depreciation_method: DepreciationMethod;
  residual_value: number;
  status: AssetStatus;
  location?: string;
  serial_number?: string;
  supplier?: string;
  invoice_number?: string;
  account_number?: string;
  cost_center?: string;
  disposal_date?: string;
  disposal_value?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DepreciationEntry {
  id: string;
  asset_id: string;
  year: number;
  month?: number;
  amount: number;
  book_value_start: number;
  book_value_end: number;
  is_special?: boolean;
  notes?: string;
  created_at: string;
}

export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  totalDepreciation: number;
  netBookValue: number;
  byCategory: { category: AssetCategory; count: number; value: number }[];
  activeCount: number;
  disposedCount: number;
  fullyDepreciatedCount: number;
}

// German depreciation rates by category (AfA-Tabelle)
export const DEPRECIATION_RATES: Record<AssetCategory, { years: number; method: DepreciationMethod }> = {
  grundstuecke: { years: 0, method: 'linear' },      // Land doesn't depreciate
  gebaeude: { years: 33, method: 'linear' },         // Buildings: 3% linear
  maschinen: { years: 10, method: 'linear' },        // Machinery: 10 years
  fahrzeuge: { years: 6, method: 'linear' },         // Vehicles: 6 years
  betriebs_geschaeft: { years: 13, method: 'linear' }, // Office equipment: 13 years
  edv: { years: 3, method: 'linear' },               // IT: 3 years (since 2021)
  immaterielle: { years: 5, method: 'linear' },      // Intangibles: 5 years
  gwg: { years: 1, method: 'sofort' },               // GWG: immediate
  sammelposten: { years: 5, method: 'linear' },      // Collective: 5 years
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  grundstuecke: 'Grundstücke',
  gebaeude: 'Gebäude',
  maschinen: 'Maschinen & Anlagen',
  fahrzeuge: 'Fahrzeuge',
  betriebs_geschaeft: 'Betriebs- & Geschäftsausstattung',
  edv: 'EDV & IT',
  immaterielle: 'Immaterielle Vermögensgegenstände',
  gwg: 'GWG (bis 800€)',
  sammelposten: 'Sammelposten (250-1000€)',
};

export const METHOD_LABELS: Record<DepreciationMethod, string> = {
  linear: 'Linear',
  degressiv: 'Degressiv',
  leistung: 'Leistungsbezogen',
  sofort: 'Sofortabschreibung',
};

const STORAGE_KEY = 'fintutto_assets';

export function useAssetManagement() {
  const { currentCompany } = useCompany();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [depreciationEntries, setDepreciationEntries] = useState<DepreciationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    if (!currentCompany) return;

    const stored = localStorage.getItem(`${STORAGE_KEY}_${currentCompany.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAssets(parsed.assets || []);
        setDepreciationEntries(parsed.depreciation || []);
      } catch {
        loadDemoData();
      }
    } else {
      loadDemoData();
    }
    setLoading(false);
  }, [currentCompany]);

  // Load demo data
  const loadDemoData = useCallback(() => {
    const demoAssets = generateDemoAssets();
    const demoDepreciation = generateDemoDepreciation(demoAssets);
    setAssets(demoAssets);
    setDepreciationEntries(demoDepreciation);
  }, []);

  // Save data
  const saveData = useCallback((newAssets: Asset[], newDepreciation: DepreciationEntry[]) => {
    if (!currentCompany) return;
    localStorage.setItem(
      `${STORAGE_KEY}_${currentCompany.id}`,
      JSON.stringify({ assets: newAssets, depreciation: newDepreciation })
    );
  }, [currentCompany]);

  // Generate next inventory number
  const getNextInventoryNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const existing = assets.filter(a => a.inventory_number.startsWith(`AV-${year}`));
    const nextNum = existing.length + 1;
    return `AV-${year}-${String(nextNum).padStart(4, '0')}`;
  }, [assets]);

  // Add asset
  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'inventory_number' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id: `asset-${Date.now()}`,
      inventory_number: getNextInventoryNumber(),
      created_at: now,
      updated_at: now,
    };

    const updated = [...assets, newAsset];
    setAssets(updated);

    // Generate depreciation schedule if not GWG/immediate
    let newDepreciation = [...depreciationEntries];
    if (asset.depreciation_method !== 'sofort' && asset.useful_life_years > 0) {
      const schedule = calculateDepreciationSchedule(newAsset);
      newDepreciation = [...newDepreciation, ...schedule];
      setDepreciationEntries(newDepreciation);
    }

    saveData(updated, newDepreciation);
    return newAsset;
  }, [assets, depreciationEntries, getNextInventoryNumber, saveData]);

  // Update asset
  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    const updated = assets.map(a =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    );
    setAssets(updated);
    saveData(updated, depreciationEntries);
  }, [assets, depreciationEntries, saveData]);

  // Dispose asset
  const disposeAsset = useCallback((id: string, disposalDate: string, disposalValue: number) => {
    const updated = assets.map(a =>
      a.id === id
        ? {
          ...a,
          status: 'disposed' as AssetStatus,
          disposal_date: disposalDate,
          disposal_value: String(disposalValue),
          updated_at: new Date().toISOString(),
        }
        : a
    );
    setAssets(updated);
    saveData(updated, depreciationEntries);
  }, [assets, depreciationEntries, saveData]);

  // Delete asset
  const deleteAsset = useCallback((id: string) => {
    const updated = assets.filter(a => a.id !== id);
    const updatedDepreciation = depreciationEntries.filter(d => d.asset_id !== id);
    setAssets(updated);
    setDepreciationEntries(updatedDepreciation);
    saveData(updated, updatedDepreciation);
  }, [assets, depreciationEntries, saveData]);

  // Calculate depreciation schedule for an asset
  const calculateDepreciationSchedule = useCallback((asset: Asset): DepreciationEntry[] => {
    const entries: DepreciationEntry[] = [];
    const startDate = new Date(asset.acquisition_date);
    const startYear = startDate.getFullYear();
    const depreciableValue = asset.acquisition_cost - asset.residual_value;

    if (asset.depreciation_method === 'linear') {
      const annualDepreciation = depreciableValue / asset.useful_life_years;

      // First year: pro-rata
      const monthsFirstYear = 12 - startDate.getMonth();
      const firstYearDepreciation = (annualDepreciation / 12) * monthsFirstYear;

      let bookValue = asset.acquisition_cost;

      for (let i = 0; i <= asset.useful_life_years; i++) {
        const year = startYear + i;
        let amount: number;

        if (i === 0) {
          amount = firstYearDepreciation;
        } else if (i === asset.useful_life_years) {
          // Last year: remaining amount
          amount = Math.max(0, bookValue - asset.residual_value);
        } else {
          amount = annualDepreciation;
        }

        const bookValueEnd = Math.max(bookValue - amount, asset.residual_value);

        if (amount > 0) {
          entries.push({
            id: `dep-${asset.id}-${year}`,
            asset_id: asset.id,
            year,
            amount: Math.round(amount * 100) / 100,
            book_value_start: Math.round(bookValue * 100) / 100,
            book_value_end: Math.round(bookValueEnd * 100) / 100,
            created_at: new Date().toISOString(),
          });
        }

        bookValue = bookValueEnd;
        if (bookValue <= asset.residual_value) break;
      }
    }

    return entries;
  }, []);

  // Get current book value of an asset
  const getBookValue = useCallback((assetId: string): number => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return 0;

    const currentYear = new Date().getFullYear();
    const depreciation = depreciationEntries
      .filter(d => d.asset_id === assetId && d.year <= currentYear)
      .reduce((sum, d) => sum + d.amount, 0);

    return Math.max(asset.acquisition_cost - depreciation, asset.residual_value);
  }, [assets, depreciationEntries]);

  // Get total depreciation for an asset
  const getTotalDepreciation = useCallback((assetId: string): number => {
    return depreciationEntries
      .filter(d => d.asset_id === assetId)
      .reduce((sum, d) => sum + d.amount, 0);
  }, [depreciationEntries]);

  // Get depreciation for a specific year
  const getYearlyDepreciation = useCallback((year: number): number => {
    return depreciationEntries
      .filter(d => d.year === year)
      .reduce((sum, d) => sum + d.amount, 0);
  }, [depreciationEntries]);

  // Calculate stats
  const stats = useMemo((): AssetStats => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, a) => sum + a.acquisition_cost, 0);
    const totalDepreciation = depreciationEntries
      .filter(d => d.year <= new Date().getFullYear())
      .reduce((sum, d) => sum + d.amount, 0);
    const netBookValue = totalValue - totalDepreciation;

    const byCategory = Object.keys(CATEGORY_LABELS).map(cat => {
      const categoryAssets = assets.filter(a => a.category === cat);
      return {
        category: cat as AssetCategory,
        count: categoryAssets.length,
        value: categoryAssets.reduce((sum, a) => sum + a.acquisition_cost, 0),
      };
    }).filter(c => c.count > 0);

    return {
      totalAssets,
      totalValue,
      totalDepreciation,
      netBookValue,
      byCategory,
      activeCount: assets.filter(a => a.status === 'active').length,
      disposedCount: assets.filter(a => a.status === 'disposed').length,
      fullyDepreciatedCount: assets.filter(a => a.status === 'fully_depreciated').length,
    };
  }, [assets, depreciationEntries]);

  // Filter assets
  const getFilteredAssets = useCallback((
    category?: AssetCategory,
    status?: AssetStatus,
    search?: string
  ): Asset[] => {
    return assets.filter(a => {
      if (category && a.category !== category) return false;
      if (status && a.status !== status) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(query) ||
          a.inventory_number.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.serial_number?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [assets]);

  // Get depreciation entries for an asset
  const getAssetDepreciation = useCallback((assetId: string): DepreciationEntry[] => {
    return depreciationEntries
      .filter(d => d.asset_id === assetId)
      .sort((a, b) => a.year - b.year);
  }, [depreciationEntries]);

  // Check if asset qualifies as GWG
  const isGWG = useCallback((amount: number): boolean => {
    return amount <= 800;
  }, []);

  // Check if asset qualifies as Sammelposten
  const isSammelposten = useCallback((amount: number): boolean => {
    return amount > 250 && amount <= 1000;
  }, []);

  return {
    assets,
    depreciationEntries,
    loading,
    stats,
    addAsset,
    updateAsset,
    disposeAsset,
    deleteAsset,
    getBookValue,
    getTotalDepreciation,
    getYearlyDepreciation,
    getFilteredAssets,
    getAssetDepreciation,
    getNextInventoryNumber,
    isGWG,
    isSammelposten,
  };
}

// Demo data generators
function generateDemoAssets(): Asset[] {
  const now = new Date();
  const lastYear = new Date(now.getFullYear() - 1, 5, 15);
  const twoYearsAgo = new Date(now.getFullYear() - 2, 2, 10);

  return [
    {
      id: 'asset-1',
      name: 'MacBook Pro 16"',
      description: 'Apple MacBook Pro für Entwicklung',
      inventory_number: 'AV-2024-0001',
      category: 'edv',
      acquisition_date: lastYear.toISOString().split('T')[0],
      acquisition_cost: 3499,
      useful_life_years: 3,
      depreciation_method: 'linear',
      residual_value: 0,
      status: 'active',
      location: 'Büro Hauptsitz',
      serial_number: 'FVFXC123456',
      supplier: 'Apple Store',
      invoice_number: 'APL-2024-789',
      account_number: '0420',
      created_at: lastYear.toISOString(),
      updated_at: lastYear.toISOString(),
    },
    {
      id: 'asset-2',
      name: 'Firmenwagen BMW 320d',
      description: 'BMW 3er Touring, Diesel',
      inventory_number: 'AV-2023-0001',
      category: 'fahrzeuge',
      acquisition_date: twoYearsAgo.toISOString().split('T')[0],
      acquisition_cost: 45000,
      useful_life_years: 6,
      depreciation_method: 'linear',
      residual_value: 5000,
      status: 'active',
      location: 'Firmenparkplatz',
      serial_number: 'WBAPH71234',
      supplier: 'BMW Autohaus',
      invoice_number: 'BMW-2023-456',
      account_number: '0320',
      created_at: twoYearsAgo.toISOString(),
      updated_at: twoYearsAgo.toISOString(),
    },
    {
      id: 'asset-3',
      name: 'Bürostuhl Ergonomisch',
      description: 'Herman Miller Aeron Chair',
      inventory_number: 'AV-2024-0002',
      category: 'betriebs_geschaeft',
      acquisition_date: new Date(now.getFullYear(), 0, 20).toISOString().split('T')[0],
      acquisition_cost: 1290,
      useful_life_years: 13,
      depreciation_method: 'linear',
      residual_value: 0,
      status: 'active',
      location: 'Büro Hauptsitz',
      supplier: 'Büromöbel GmbH',
      invoice_number: 'BM-2024-123',
      account_number: '0410',
      created_at: new Date(now.getFullYear(), 0, 20).toISOString(),
      updated_at: new Date(now.getFullYear(), 0, 20).toISOString(),
    },
    {
      id: 'asset-4',
      name: 'Drucker Canon imageRUNNER',
      description: 'Multifunktionsdrucker für Büro',
      inventory_number: 'AV-2024-0003',
      category: 'edv',
      acquisition_date: new Date(now.getFullYear(), 1, 5).toISOString().split('T')[0],
      acquisition_cost: 2850,
      useful_life_years: 3,
      depreciation_method: 'linear',
      residual_value: 0,
      status: 'active',
      location: 'Büro Hauptsitz',
      serial_number: 'CAN-IR-789',
      supplier: 'IT Solutions GmbH',
      invoice_number: 'IT-2024-234',
      account_number: '0420',
      created_at: new Date(now.getFullYear(), 1, 5).toISOString(),
      updated_at: new Date(now.getFullYear(), 1, 5).toISOString(),
    },
    {
      id: 'asset-5',
      name: 'Webcam Logitech',
      description: 'Logitech BRIO 4K',
      inventory_number: 'AV-2024-0004',
      category: 'gwg',
      acquisition_date: new Date(now.getFullYear(), 0, 10).toISOString().split('T')[0],
      acquisition_cost: 189,
      useful_life_years: 1,
      depreciation_method: 'sofort',
      residual_value: 0,
      status: 'fully_depreciated',
      location: 'Büro Hauptsitz',
      serial_number: 'LOG-BRIO-456',
      supplier: 'Amazon',
      invoice_number: 'AMZ-2024-001',
      account_number: '0670',
      created_at: new Date(now.getFullYear(), 0, 10).toISOString(),
      updated_at: new Date(now.getFullYear(), 0, 10).toISOString(),
    },
    {
      id: 'asset-6',
      name: 'Software Lizenzen',
      description: 'Microsoft 365 Business Premium (perpetual)',
      inventory_number: 'AV-2023-0002',
      category: 'immaterielle',
      acquisition_date: twoYearsAgo.toISOString().split('T')[0],
      acquisition_cost: 1200,
      useful_life_years: 5,
      depreciation_method: 'linear',
      residual_value: 0,
      status: 'active',
      supplier: 'Microsoft Partner',
      invoice_number: 'MS-2023-567',
      account_number: '0027',
      created_at: twoYearsAgo.toISOString(),
      updated_at: twoYearsAgo.toISOString(),
    },
  ];
}

function generateDemoDepreciation(assets: Asset[]): DepreciationEntry[] {
  const entries: DepreciationEntry[] = [];
  const currentYear = new Date().getFullYear();

  assets.forEach(asset => {
    if (asset.depreciation_method === 'sofort') return;

    const startDate = new Date(asset.acquisition_date);
    const startYear = startDate.getFullYear();
    const depreciableValue = asset.acquisition_cost - asset.residual_value;
    const annualDepreciation = depreciableValue / asset.useful_life_years;

    let bookValue = asset.acquisition_cost;

    for (let year = startYear; year <= currentYear; year++) {
      let amount: number;

      if (year === startYear) {
        const monthsFirstYear = 12 - startDate.getMonth();
        amount = (annualDepreciation / 12) * monthsFirstYear;
      } else {
        amount = annualDepreciation;
      }

      amount = Math.min(amount, bookValue - asset.residual_value);
      if (amount <= 0) break;

      const bookValueEnd = bookValue - amount;

      entries.push({
        id: `dep-${asset.id}-${year}`,
        asset_id: asset.id,
        year,
        amount: Math.round(amount * 100) / 100,
        book_value_start: Math.round(bookValue * 100) / 100,
        book_value_end: Math.round(bookValueEnd * 100) / 100,
        created_at: new Date().toISOString(),
      });

      bookValue = bookValueEnd;
    }
  });

  return entries;
}
