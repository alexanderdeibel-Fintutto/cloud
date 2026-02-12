import { useState, useEffect, useCallback } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export type PaymentProvider = 'stripe' | 'paypal' | 'klarna' | 'sofort';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentProviderConfig {
  id: string;
  company_id: string;
  provider: PaymentProvider;
  enabled: boolean;
  is_test_mode: boolean;
  api_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  settings: ProviderSettings;
  created_at: string;
  updated_at: string;
}

export interface ProviderSettings {
  currencies: string[];
  payment_methods: string[];
  auto_capture: boolean;
  statement_descriptor?: string;
  receipt_email: boolean;
}

export interface OnlinePayment {
  id: string;
  company_id: string;
  invoice_id?: string;
  provider: PaymentProvider;
  provider_payment_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customer_email: string;
  customer_name?: string;
  description: string;
  payment_method?: string;
  payment_link?: string;
  receipt_url?: string;
  fee_amount?: number;
  net_amount?: number;
  refunded_amount?: number;
  metadata?: Record<string, string>;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface PaymentLink {
  id: string;
  company_id: string;
  invoice_id?: string;
  url: string;
  amount: number;
  currency: string;
  description: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  payments_count: number;
  total_collected: number;
}

const PROVIDERS_STORAGE_KEY = 'fintutto_payment_providers';
const PAYMENTS_STORAGE_KEY = 'fintutto_online_payments';
const LINKS_STORAGE_KEY = 'fintutto_payment_links';

export function useOnlinePayments() {
  const { currentCompany } = useCompany();
  const [providers, setProviders] = useState<PaymentProviderConfig[]>([]);
  const [payments, setPayments] = useState<OnlinePayment[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const storedProviders = localStorage.getItem(`${PROVIDERS_STORAGE_KEY}_${currentCompany.id}`);
    const storedPayments = localStorage.getItem(`${PAYMENTS_STORAGE_KEY}_${currentCompany.id}`);
    const storedLinks = localStorage.getItem(`${LINKS_STORAGE_KEY}_${currentCompany.id}`);

    if (storedProviders) {
      try {
        setProviders(JSON.parse(storedProviders));
      } catch {
        setProviders([]);
      }
    } else {
      // Demo providers
      setProviders([
        {
          id: 'prov-1',
          company_id: currentCompany.id,
          provider: 'stripe',
          enabled: true,
          is_test_mode: true,
          api_key: 'pk_test_***',
          settings: {
            currencies: ['EUR', 'USD'],
            payment_methods: ['card', 'sepa_debit', 'giropay'],
            auto_capture: true,
            statement_descriptor: 'FINTUTTO',
            receipt_email: true,
          },
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'prov-2',
          company_id: currentCompany.id,
          provider: 'paypal',
          enabled: false,
          is_test_mode: true,
          settings: {
            currencies: ['EUR'],
            payment_methods: ['paypal'],
            auto_capture: true,
            receipt_email: true,
          },
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }

    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
      } catch {
        setPayments([]);
      }
    } else {
      // Demo payments
      setPayments([
        {
          id: 'pay-1',
          company_id: currentCompany.id,
          invoice_id: 'inv-001',
          provider: 'stripe',
          provider_payment_id: 'pi_3abc123',
          amount: 1250.00,
          currency: 'EUR',
          status: 'completed',
          customer_email: 'kunde@example.com',
          customer_name: 'Max Mustermann',
          description: 'Rechnung RE-2024-0001',
          payment_method: 'card',
          receipt_url: 'https://pay.stripe.com/receipts/123',
          fee_amount: 31.25,
          net_amount: 1218.75,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'pay-2',
          company_id: currentCompany.id,
          invoice_id: 'inv-002',
          provider: 'stripe',
          provider_payment_id: 'pi_4def456',
          amount: 780.50,
          currency: 'EUR',
          status: 'pending',
          customer_email: 'firma@example.com',
          customer_name: 'ABC GmbH',
          description: 'Rechnung RE-2024-0002',
          payment_link: 'https://checkout.stripe.com/pay/cs_123',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }

    if (storedLinks) {
      try {
        setPaymentLinks(JSON.parse(storedLinks));
      } catch {
        setPaymentLinks([]);
      }
    } else {
      // Demo payment links
      setPaymentLinks([
        {
          id: 'link-1',
          company_id: currentCompany.id,
          invoice_id: 'inv-002',
          url: 'https://checkout.stripe.com/pay/cs_123',
          amount: 780.50,
          currency: 'EUR',
          description: 'Rechnung RE-2024-0002',
          is_active: true,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          payments_count: 0,
          total_collected: 0,
        },
      ]);
    }

    setLoading(false);
  }, [currentCompany]);

  // Save functions
  const saveProviders = useCallback((list: PaymentProviderConfig[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${PROVIDERS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setProviders(list);
  }, [currentCompany]);

  const savePayments = useCallback((list: OnlinePayment[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${PAYMENTS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setPayments(list);
  }, [currentCompany]);

  const saveLinks = useCallback((list: PaymentLink[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${LINKS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setPaymentLinks(list);
  }, [currentCompany]);

  // Configure provider
  const configureProvider = useCallback((data: {
    provider: PaymentProvider;
    api_key?: string;
    secret_key?: string;
    is_test_mode?: boolean;
    settings?: Partial<ProviderSettings>;
  }) => {
    if (!currentCompany) return null;

    const existing = providers.find(p => p.provider === data.provider);

    if (existing) {
      const updated = providers.map(p =>
        p.provider === data.provider
          ? {
              ...p,
              api_key: data.api_key || p.api_key,
              secret_key: data.secret_key || p.secret_key,
              is_test_mode: data.is_test_mode ?? p.is_test_mode,
              settings: { ...p.settings, ...data.settings },
              updated_at: new Date().toISOString(),
            }
          : p
      );
      saveProviders(updated);
      return updated.find(p => p.provider === data.provider);
    } else {
      const newProvider: PaymentProviderConfig = {
        id: `prov-${Date.now()}`,
        company_id: currentCompany.id,
        provider: data.provider,
        enabled: false,
        is_test_mode: data.is_test_mode ?? true,
        api_key: data.api_key,
        secret_key: data.secret_key,
        settings: {
          currencies: ['EUR'],
          payment_methods: getDefaultPaymentMethods(data.provider),
          auto_capture: true,
          receipt_email: true,
          ...data.settings,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveProviders([...providers, newProvider]);
      return newProvider;
    }
  }, [currentCompany, providers, saveProviders]);

  // Enable/disable provider
  const toggleProvider = useCallback((providerId: string, enabled: boolean) => {
    const updated = providers.map(p =>
      p.id === providerId
        ? { ...p, enabled, updated_at: new Date().toISOString() }
        : p
    );
    saveProviders(updated);
  }, [providers, saveProviders]);

  // Create payment link
  const createPaymentLink = useCallback((data: {
    invoice_id?: string;
    amount: number;
    currency?: string;
    description: string;
    expires_at?: string;
  }) => {
    if (!currentCompany) return null;

    const enabledProvider = providers.find(p => p.enabled);
    if (!enabledProvider) return null;

    const link: PaymentLink = {
      id: `link-${Date.now()}`,
      company_id: currentCompany.id,
      invoice_id: data.invoice_id,
      url: `https://checkout.stripe.com/pay/cs_${Date.now()}`,
      amount: data.amount,
      currency: data.currency || 'EUR',
      description: data.description,
      expires_at: data.expires_at,
      is_active: true,
      created_at: new Date().toISOString(),
      payments_count: 0,
      total_collected: 0,
    };

    saveLinks([link, ...paymentLinks]);
    return link;
  }, [currentCompany, providers, paymentLinks, saveLinks]);

  // Deactivate payment link
  const deactivateLink = useCallback((linkId: string) => {
    const updated = paymentLinks.map(l =>
      l.id === linkId ? { ...l, is_active: false } : l
    );
    saveLinks(updated);
  }, [paymentLinks, saveLinks]);

  // Create payment (simulated)
  const createPayment = useCallback((data: {
    invoice_id?: string;
    provider?: PaymentProvider;
    amount: number;
    currency?: string;
    customer_email: string;
    customer_name?: string;
    description: string;
  }) => {
    if (!currentCompany) return null;

    const provider = data.provider || providers.find(p => p.enabled)?.provider || 'stripe';

    const payment: OnlinePayment = {
      id: `pay-${Date.now()}`,
      company_id: currentCompany.id,
      invoice_id: data.invoice_id,
      provider,
      provider_payment_id: `pi_${Date.now()}`,
      amount: data.amount,
      currency: data.currency || 'EUR',
      status: 'pending',
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      description: data.description,
      payment_link: `https://checkout.stripe.com/pay/cs_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    savePayments([payment, ...payments]);
    return payment;
  }, [currentCompany, providers, payments, savePayments]);

  // Process payment (simulated)
  const processPayment = useCallback(async (paymentId: string) => {
    // Simulate processing
    const updated = payments.map(p =>
      p.id === paymentId
        ? { ...p, status: 'processing' as PaymentStatus }
        : p
    );
    savePayments(updated);

    // Simulate completion after delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const completed = payments.map(p => {
      if (p.id !== paymentId) return p;
      const fee = p.amount * 0.025; // 2.5% fee
      return {
        ...p,
        status: 'completed' as PaymentStatus,
        completed_at: new Date().toISOString(),
        fee_amount: fee,
        net_amount: p.amount - fee,
        payment_method: 'card',
        receipt_url: `https://pay.stripe.com/receipts/${Date.now()}`,
      };
    });
    savePayments(completed);

    return completed.find(p => p.id === paymentId);
  }, [payments, savePayments]);

  // Refund payment
  const refundPayment = useCallback((paymentId: string, amount?: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'completed') return null;

    const refundAmount = amount || payment.amount;
    const updated = payments.map(p =>
      p.id === paymentId
        ? {
            ...p,
            status: refundAmount >= p.amount ? 'refunded' as PaymentStatus : p.status,
            refunded_amount: (p.refunded_amount || 0) + refundAmount,
          }
        : p
    );
    savePayments(updated);
    return updated.find(p => p.id === paymentId);
  }, [payments, savePayments]);

  // Get statistics
  const getStats = useCallback(() => {
    const completed = payments.filter(p => p.status === 'completed');
    const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing');
    const refunded = payments.filter(p => p.status === 'refunded');

    return {
      totalPayments: payments.length,
      completedPayments: completed.length,
      pendingPayments: pending.length,
      totalVolume: completed.reduce((sum, p) => sum + p.amount, 0),
      totalFees: completed.reduce((sum, p) => sum + (p.fee_amount || 0), 0),
      netRevenue: completed.reduce((sum, p) => sum + (p.net_amount || p.amount), 0),
      refundedAmount: refunded.reduce((sum, p) => sum + (p.refunded_amount || p.amount), 0),
      activeProviders: providers.filter(p => p.enabled).length,
      activeLinks: paymentLinks.filter(l => l.is_active).length,
    };
  }, [payments, providers, paymentLinks]);

  // Get provider info
  const getProviderInfo = useCallback((provider: PaymentProvider) => {
    const info = {
      stripe: { name: 'Stripe', color: 'bg-indigo-500', icon: '💳', fees: '1.4% + 0.25€' },
      paypal: { name: 'PayPal', color: 'bg-blue-500', icon: '🅿️', fees: '2.49% + 0.35€' },
      klarna: { name: 'Klarna', color: 'bg-pink-500', icon: '🛍️', fees: '2.99%' },
      sofort: { name: 'Sofort', color: 'bg-gray-700', icon: '🏦', fees: '0.9% + 0.25€' },
    };
    return info[provider];
  }, []);

  return {
    providers,
    payments,
    paymentLinks,
    loading,
    configureProvider,
    toggleProvider,
    createPaymentLink,
    deactivateLink,
    createPayment,
    processPayment,
    refundPayment,
    getStats,
    getProviderInfo,
  };
}

function getDefaultPaymentMethods(provider: PaymentProvider): string[] {
  switch (provider) {
    case 'stripe':
      return ['card', 'sepa_debit', 'giropay', 'sofort'];
    case 'paypal':
      return ['paypal'];
    case 'klarna':
      return ['klarna_pay_later', 'klarna_pay_now'];
    case 'sofort':
      return ['sofort'];
    default:
      return ['card'];
  }
}
