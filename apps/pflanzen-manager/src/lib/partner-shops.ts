import { PartnerShop } from '@/types';

export const PARTNER_SHOPS: PartnerShop[] = [
  {
    id: 'dehner',
    name: 'Dehner',
    logo_url: '/shops/dehner.png',
    base_url: 'https://www.dehner.de/search/',
    affiliate_tag: 'fintutto-21',
  },
  {
    id: 'obi',
    name: 'OBI',
    logo_url: '/shops/obi.png',
    base_url: 'https://www.obi.de/search/',
    affiliate_tag: 'fintutto-21',
  },
  {
    id: 'hornbach',
    name: 'Hornbach',
    logo_url: '/shops/hornbach.png',
    base_url: 'https://www.hornbach.de/s/',
    affiliate_tag: 'fintutto-21',
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus',
    logo_url: '/shops/bauhaus.png',
    base_url: 'https://www.bauhaus.info/suche/produkte?q=',
    affiliate_tag: 'fintutto-21',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo_url: '/shops/amazon.png',
    base_url: 'https://www.amazon.de/s?k=',
    affiliate_tag: 'fintutto-21',
  },
];

export function generateSearchUrl(shop: PartnerShop, query: string): string {
  const encodedQuery = encodeURIComponent(query);
  const baseUrl = `${shop.base_url}${encodedQuery}`;
  // Add affiliate tag to URL
  if (shop.id === 'amazon') {
    return `${baseUrl}&tag=${shop.affiliate_tag}`;
  }
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}ref=${shop.affiliate_tag}`;
}

export function getShopById(id: string): PartnerShop | undefined {
  return PARTNER_SHOPS.find(s => s.id === id);
}

// Track affiliate click for analytics
const CLICKS_KEY = 'pm_affiliate_clicks';

interface AffiliateClick {
  shopId: string;
  query: string;
  timestamp: string;
}

export function trackAffiliateClick(shopId: string, query: string) {
  try {
    const stored = localStorage.getItem(CLICKS_KEY);
    const clicks: AffiliateClick[] = stored ? JSON.parse(stored) : [];
    clicks.push({ shopId, query, timestamp: new Date().toISOString() });
    // Keep last 500 clicks
    const trimmed = clicks.slice(-500);
    localStorage.setItem(CLICKS_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

export function getAffiliateStats(): { totalClicks: number; byShop: Record<string, number> } {
  try {
    const stored = localStorage.getItem(CLICKS_KEY);
    const clicks: AffiliateClick[] = stored ? JSON.parse(stored) : [];
    const byShop: Record<string, number> = {};
    clicks.forEach(c => {
      byShop[c.shopId] = (byShop[c.shopId] || 0) + 1;
    });
    return { totalClicks: clicks.length, byShop };
  } catch {
    return { totalClicks: 0, byShop: {} };
  }
}

export const MATERIAL_SUGGESTIONS: Record<string, string[]> = {
  soil: [
    'Blumenerde Universal',
    'Kakteenerde',
    'Orchideenerde',
    'Anzuchterde',
    'Palmenerde',
  ],
  fertilizer: [
    'Fluessigduenger Universal',
    'Orchideenduenger',
    'Kakteenduenger',
    'Langzeitduenger Staebchen',
    'Gruenpflanzenduenger',
  ],
  pot: [
    'Uebertopf Keramik',
    'Pflanztopf mit Untersetzer',
    'Haengeampel',
    'Blumenkasten',
    'Selbstbewaesserungstopf',
  ],
  tool: [
    'Giesskanne',
    'Spruehflasche',
    'Pflanzenschere',
    'Feuchtigkeitsmesser',
    'Rankhilfe',
  ],
  pesticide: [
    'Neemoel Spray',
    'Schaedlingsfrei biologisch',
    'Gelbtafeln',
    'Trauermuecken-Fallen',
    'Blattlaus-Spray',
  ],
  other: [
    'Pflanzenlicht LED',
    'Pflanzen-Untersetzer',
    'Kokosfaser Stab',
    'Hydrokultur Granulat',
    'Drainage Blaehton',
  ],
};
