export type UrlCategory =
  | 'cdn'
  | 'api'
  | 'external'
  | 'font'
  | 'meta'
  | 'stripe'
  | 'docs';

export interface RegisteredUrl {
  url: string;
  label: string;
  category: UrlCategory;
  source: string;
  critical: boolean;
}

/**
 * Central registry of all external URLs used in the admin application.
 * Used by the URL checker to verify availability and functionality.
 */
export const urlRegistry: RegisteredUrl[] = [
  // CDN Resources
  {
    url: 'https://cdn.jsdelivr.net/gh/alexanderdeibel-Fintutto/fintutto-ecosystem@main/packages/ai-widget/dist/fintutto-ai-widget.js',
    label: 'Fintutto AI Widget (jsDelivr CDN)',
    category: 'cdn',
    source: 'index.html',
    critical: true,
  },

  // Backend / API Endpoints
  {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
    label: 'Supabase API Endpoint',
    category: 'api',
    source: '.env / index.html',
    critical: true,
  },

  // Google Fonts
  {
    url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap',
    label: 'Google Font: Work Sans',
    category: 'font',
    source: 'src/index.css',
    critical: false,
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    label: 'Google Font: Lora (gewichtet)',
    category: 'font',
    source: 'src/index.css',
    critical: false,
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
    label: 'Google Font: Inconsolata',
    category: 'font',
    source: 'src/index.css',
    critical: false,
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
    label: 'Google Font: Inter',
    category: 'font',
    source: 'src/index.css',
    critical: false,
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Lora&display=swap',
    label: 'Google Font: Lora',
    category: 'font',
    source: 'src/index.css',
    critical: false,
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Space+Mono&display=swap',
    label: 'Google Font: Space Mono',
    category: 'font',
    source: 'src/index.css',
    critical: false,
  },

  // Open Graph / Meta
  {
    url: 'https://lovable.dev/opengraph-image-p98pqg.png',
    label: 'Open Graph Bild (Lovable)',
    category: 'meta',
    source: 'index.html',
    critical: false,
  },

  // Stripe Dashboard
  {
    url: 'https://dashboard.stripe.com/products',
    label: 'Stripe Produkte Dashboard',
    category: 'stripe',
    source: 'src/pages/Products.tsx',
    critical: true,
  },
  {
    url: 'https://dashboard.stripe.com/products/create',
    label: 'Stripe Produkt erstellen',
    category: 'stripe',
    source: 'src/pages/Products.tsx',
    critical: true,
  },

  // Documentation
  {
    url: 'https://ui.shadcn.com/schema.json',
    label: 'shadcn/ui Schema',
    category: 'docs',
    source: 'components.json',
    critical: false,
  },
];

export const categoryLabels: Record<UrlCategory, string> = {
  cdn: 'CDN Ressourcen',
  api: 'API Endpoints',
  external: 'Externe Links',
  font: 'Schriftarten',
  meta: 'Meta / Open Graph',
  stripe: 'Stripe Dashboard',
  docs: 'Dokumentation',
};
