import { useState, useCallback, useEffect } from 'react';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD' | 'CNY' | 'PLN' | 'CZK' | 'SEK' | 'NOK' | 'DKK';

export interface ExchangeRate {
  id: string;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  date: string;
  source: 'ecb' | 'manual';
}

export interface CurrencyTransaction {
  id: string;
  date: string;
  description: string;
  originalAmount: number;
  originalCurrency: CurrencyCode;
  convertedAmount: number;
  baseCurrency: CurrencyCode;
  exchangeRate: number;
  exchangeDifference?: number;
  type: 'booking' | 'invoice' | 'payment';
  referenceId: string;
  createdAt: string;
}

export interface CurrencySettings {
  baseCurrency: CurrencyCode;
  autoUpdateRates: boolean;
  updateFrequency: 'daily' | 'weekly' | 'manual';
  lastRateUpdate: string | null;
  roundingMode: 'standard' | 'commercial' | 'banking';
  decimalPlaces: number;
}

export const CURRENCIES: { code: CurrencyCode; name: string; symbol: string }[] = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
];

// ECB reference rates (demo data - in production would fetch from ECB API)
const DEFAULT_RATES: Record<CurrencyCode, number> = {
  EUR: 1.0,
  USD: 1.0856,
  GBP: 0.8534,
  CHF: 0.9412,
  JPY: 162.35,
  CAD: 1.4723,
  AUD: 1.6542,
  CNY: 7.8234,
  PLN: 4.3125,
  CZK: 25.234,
  SEK: 11.4523,
  NOK: 11.7834,
  DKK: 7.4589,
};

const STORAGE_KEY = 'fintutto_multi_currency';

export function useMultiCurrency() {
  const [settings, setSettings] = useState<CurrencySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      baseCurrency: 'EUR',
      autoUpdateRates: true,
      updateFrequency: 'daily',
      lastRateUpdate: null,
      roundingMode: 'standard',
      decimalPlaces: 2,
    };
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rates`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Initialize with default rates
    const today = new Date().toISOString().split('T')[0];
    return Object.entries(DEFAULT_RATES).map(([currency, rate]) => ({
      id: `rate_${currency}_EUR`,
      fromCurrency: currency as CurrencyCode,
      toCurrency: 'EUR' as CurrencyCode,
      rate: currency === 'EUR' ? 1 : 1 / rate,
      date: today,
      source: 'ecb' as const,
    }));
  });

  const [transactions, setTransactions] = useState<CurrencyTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rates`, JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Get exchange rate
  const getExchangeRate = useCallback((from: CurrencyCode, to: CurrencyCode, date?: string): number => {
    if (from === to) return 1;

    // Find rate for the specific date or closest available
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Try direct rate
    let rate = exchangeRates.find(
      r => r.fromCurrency === from && r.toCurrency === to && r.date <= targetDate
    );
    if (rate) return rate.rate;

    // Try inverse rate
    rate = exchangeRates.find(
      r => r.fromCurrency === to && r.toCurrency === from && r.date <= targetDate
    );
    if (rate) return 1 / rate.rate;

    // Calculate through EUR
    const fromToEur = exchangeRates.find(r => r.fromCurrency === from && r.toCurrency === 'EUR');
    const toToEur = exchangeRates.find(r => r.fromCurrency === to && r.toCurrency === 'EUR');

    if (fromToEur && toToEur) {
      return fromToEur.rate / toToEur.rate;
    }

    // Fallback to default rates
    const fromRate = DEFAULT_RATES[from] || 1;
    const toRate = DEFAULT_RATES[to] || 1;
    return toRate / fromRate;
  }, [exchangeRates]);

  // Convert amount
  const convertAmount = useCallback((
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    date?: string
  ): number => {
    const rate = getExchangeRate(from, to, date);
    const converted = amount * rate;

    // Apply rounding
    const multiplier = Math.pow(10, settings.decimalPlaces);
    switch (settings.roundingMode) {
      case 'commercial':
        return Math.round(converted * multiplier) / multiplier;
      case 'banking':
        // Banker's rounding (round half to even)
        const scaled = converted * multiplier;
        const floor = Math.floor(scaled);
        const decimal = scaled - floor;
        if (decimal === 0.5) {
          return (floor % 2 === 0 ? floor : floor + 1) / multiplier;
        }
        return Math.round(scaled) / multiplier;
      default:
        return Math.round(converted * multiplier) / multiplier;
    }
  }, [getExchangeRate, settings.decimalPlaces, settings.roundingMode]);

  // Update exchange rates (simulated ECB fetch)
  const updateExchangeRates = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    // Simulate small rate fluctuations for demo
    const newRates: ExchangeRate[] = Object.entries(DEFAULT_RATES).map(([currency, baseRate]) => {
      const fluctuation = 1 + (Math.random() - 0.5) * 0.02; // ±1% fluctuation
      const rate = currency === 'EUR' ? 1 : (1 / baseRate) * fluctuation;

      return {
        id: `rate_${currency}_EUR_${today}`,
        fromCurrency: currency as CurrencyCode,
        toCurrency: 'EUR' as CurrencyCode,
        rate,
        date: today,
        source: 'ecb' as const,
      };
    });

    setExchangeRates(prev => [...newRates, ...prev.filter(r => r.date !== today)]);
    setSettings(prev => ({ ...prev, lastRateUpdate: new Date().toISOString() }));

    return newRates;
  }, []);

  // Set manual exchange rate
  const setManualRate = useCallback((
    from: CurrencyCode,
    to: CurrencyCode,
    rate: number,
    date: string
  ) => {
    const newRate: ExchangeRate = {
      id: `rate_${from}_${to}_${date}_manual`,
      fromCurrency: from,
      toCurrency: to,
      rate,
      date,
      source: 'manual',
    };

    setExchangeRates(prev => [newRate, ...prev.filter(
      r => !(r.fromCurrency === from && r.toCurrency === to && r.date === date)
    )]);
  }, []);

  // Record currency transaction
  const recordCurrencyTransaction = useCallback((
    transaction: Omit<CurrencyTransaction, 'id' | 'createdAt' | 'convertedAmount' | 'exchangeRate' | 'exchangeDifference'>
  ): CurrencyTransaction => {
    const rate = getExchangeRate(transaction.originalCurrency, transaction.baseCurrency, transaction.date);
    const convertedAmount = convertAmount(
      transaction.originalAmount,
      transaction.originalCurrency,
      transaction.baseCurrency,
      transaction.date
    );

    const newTransaction: CurrencyTransaction = {
      ...transaction,
      id: `curr_tx_${Date.now()}`,
      convertedAmount,
      exchangeRate: rate,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, [getExchangeRate, convertAmount]);

  // Calculate exchange difference (for payment vs booking date)
  const calculateExchangeDifference = useCallback((
    originalAmount: number,
    originalCurrency: CurrencyCode,
    bookingDate: string,
    paymentDate: string
  ): { difference: number; type: 'gain' | 'loss' | 'none' } => {
    const bookingRate = getExchangeRate(originalCurrency, settings.baseCurrency, bookingDate);
    const paymentRate = getExchangeRate(originalCurrency, settings.baseCurrency, paymentDate);

    const bookingValue = originalAmount * bookingRate;
    const paymentValue = originalAmount * paymentRate;
    const difference = paymentValue - bookingValue;

    return {
      difference: Math.abs(difference),
      type: difference > 0.01 ? 'gain' : difference < -0.01 ? 'loss' : 'none',
    };
  }, [getExchangeRate, settings.baseCurrency]);

  // Format currency
  const formatCurrency = useCallback((amount: number, currency: CurrencyCode): string => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: settings.decimalPlaces,
      maximumFractionDigits: settings.decimalPlaces,
    }).format(amount);
  }, [settings.decimalPlaces]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<CurrencySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Get historical rates
  const getHistoricalRates = useCallback((currency: CurrencyCode, days: number = 30): ExchangeRate[] => {
    return exchangeRates
      .filter(r => r.fromCurrency === currency && r.toCurrency === settings.baseCurrency)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  }, [exchangeRates, settings.baseCurrency]);

  // Statistics
  const stats = {
    totalTransactions: transactions.length,
    totalExchangeGains: transactions
      .filter(t => t.exchangeDifference && t.exchangeDifference > 0)
      .reduce((sum, t) => sum + (t.exchangeDifference || 0), 0),
    totalExchangeLosses: transactions
      .filter(t => t.exchangeDifference && t.exchangeDifference < 0)
      .reduce((sum, t) => sum + Math.abs(t.exchangeDifference || 0), 0),
    currenciesUsed: [...new Set(transactions.map(t => t.originalCurrency))],
  };

  return {
    settings,
    updateSettings,
    exchangeRates,
    transactions,
    getExchangeRate,
    convertAmount,
    updateExchangeRates,
    setManualRate,
    recordCurrencyTransaction,
    calculateExchangeDifference,
    formatCurrency,
    getHistoricalRates,
    currencies: CURRENCIES,
    stats,
  };
}
