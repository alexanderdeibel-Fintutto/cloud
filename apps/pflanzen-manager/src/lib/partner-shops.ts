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
  return `${shop.base_url}${encodedQuery}`;
}

export function getShopById(id: string): PartnerShop | undefined {
  return PARTNER_SHOPS.find(s => s.id === id);
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
    'Flüssigdünger Universal',
    'Orchideendünger',
    'Kakteendünger',
    'Langzeitdünger Stäbchen',
    'Grünpflanzendünger',
  ],
  pot: [
    'Übertopf Keramik',
    'Pflanztopf mit Untersetzer',
    'Hängeampel',
    'Blumenkasten',
    'Selbstbewässerungstopf',
  ],
  tool: [
    'Gießkanne',
    'Sprühflasche',
    'Pflanzenschere',
    'Feuchtigkeitsmesser',
    'Rankhilfe',
  ],
  pesticide: [
    'Neemöl Spray',
    'Schädlingsfrei biologisch',
    'Gelbtafeln',
    'Trauermücken-Fallen',
    'Blattlaus-Spray',
  ],
  other: [
    'Pflanzenlicht LED',
    'Pflanzen-Untersetzer',
    'Kokosfaser Stab',
    'Hydrokultur Granulat',
    'Drainage Blähton',
  ],
};
