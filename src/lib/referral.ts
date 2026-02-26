// Fintutto Referral System for Pflanzen-Manager
// Adapted from the central Fintutto referral system

export interface Referral {
  id: string;
  code: string;
  referredEmail: string;
  status: 'pending' | 'signed_up' | 'subscribed';
  app: string;
  createdAt: string;
  convertedAt: string | null;
}

export interface ReferralStats {
  totalInvited: number;
  totalSignups: number;
  totalSubscribed: number;
  creditsEarned: number;
  savingsEur: number;
  code: string;
}

const STORAGE_KEY = 'pm_referral_data';

// Rewards per action
export const REWARDS = {
  perSignup: { credits: 5, eurValue: 0.5 },
  perSubscription: { credits: 15, eurValue: 5.0, freeMonths: 1 },
  referred: { bonusCredits: 2, discountPercent: 20 },
};

function loadReferrals(): Referral[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveReferrals(referrals: Referral[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
}

export function getReferralCode(): string {
  const stored = localStorage.getItem('pm_referral_code');
  if (stored) return stored;
  const code = `FT-PM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  localStorage.setItem('pm_referral_code', code);
  return code;
}

export function getReferralLink(): string {
  const code = getReferralCode();
  return `https://zimmerpflanze.vercel.app/?ref=${code}`;
}

export function addReferral(email: string, app: string = 'pflanzen-manager'): Referral {
  const referrals = loadReferrals();
  const referral: Referral = {
    id: `ref-${Date.now()}`,
    code: getReferralCode(),
    referredEmail: email,
    status: 'pending',
    app,
    createdAt: new Date().toISOString(),
    convertedAt: null,
  };
  referrals.push(referral);
  saveReferrals(referrals);
  return referral;
}

export function getReferrals(): Referral[] {
  return loadReferrals();
}

export function getReferralStats(): ReferralStats {
  const referrals = loadReferrals();
  const signups = referrals.filter(r => r.status === 'signed_up' || r.status === 'subscribed').length;
  const subscribed = referrals.filter(r => r.status === 'subscribed').length;
  return {
    totalInvited: referrals.length,
    totalSignups: signups,
    totalSubscribed: subscribed,
    creditsEarned: signups * REWARDS.perSignup.credits + subscribed * REWARDS.perSubscription.credits,
    savingsEur: signups * REWARDS.perSignup.eurValue + subscribed * REWARDS.perSubscription.eurValue,
    code: getReferralCode(),
  };
}

// Fintutto Ecosystem Apps for cross-marketing
export const FINTUTTO_APPS = [
  {
    key: 'portal',
    name: 'Fintutto Portal',
    description: 'Rechner, Checker & Formulare fuer Mieter & Vermieter',
    icon: '🧮',
    url: 'https://portal.fintutto.cloud',
    category: 'tools',
  },
  {
    key: 'vermietify',
    name: 'Vermietify',
    description: 'Professionelle Immobilienverwaltung fuer Vermieter',
    icon: '🏠',
    url: 'https://vermietify.vercel.app',
    category: 'premium',
  },
  {
    key: 'ablesung',
    name: 'Ablesung',
    description: 'Zaehlerablesung & Verbrauchserfassung',
    icon: '📊',
    url: 'https://ablesung.vercel.app',
    category: 'tools',
  },
  {
    key: 'mieter',
    name: 'Mieter-Portal',
    description: 'Tools & Rechte-Infos fuer Mieter',
    icon: '🏡',
    url: 'https://mieter-kw8d.vercel.app',
    category: 'tools',
  },
  {
    key: 'bescheidboxer',
    name: 'BescheidBoxer',
    description: 'Steuerbescheid-Pruefer & Dokumenten-Tool',
    icon: '📋',
    url: 'https://bescheidboxer.vercel.app',
    category: 'tools',
  },
  {
    key: 'financialCompass',
    name: 'Financial Compass',
    description: 'Finanzuebersicht & Buchhaltung',
    icon: '🧭',
    url: 'https://fintutto-your-financial-compass.vercel.app',
    category: 'premium',
  },
] as const;

export type FintuttoApp = (typeof FINTUTTO_APPS)[number];

export function buildCrossMarketingLink(appUrl: string): string {
  const code = getReferralCode();
  const url = new URL(appUrl);
  url.searchParams.set('ref', code);
  url.searchParams.set('from', 'pflanzen-manager');
  return url.toString();
}
