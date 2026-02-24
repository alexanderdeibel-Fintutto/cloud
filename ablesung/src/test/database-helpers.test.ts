import { describe, it, expect } from 'vitest';
import {
  getReadingStatus,
  calculateAnnualConsumption,
  calculateCost,
  getEfficiencyGrade,
  formatNumber,
  formatEuro,
  METER_TYPE_LABELS,
  METER_TYPE_UNITS,
  METER_TYPE_GROUPS,
  METER_TYPE_PRICE_DEFAULTS,
  CONSUMPTION_BENCHMARKS,
  MeterReading,
} from '@/types/database';

// ═══════════════════════════════════════════════════════════════════
// getReadingStatus
// ═══════════════════════════════════════════════════════════════════
describe('getReadingStatus', () => {
  it('returns "overdue" when no last reading date', () => {
    expect(getReadingStatus(undefined)).toBe('overdue');
    expect(getReadingStatus(undefined, 30)).toBe('overdue');
  });

  it('returns "current" when reading is recent', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getReadingStatus(today, 30)).toBe('current');
  });

  it('returns "current" when reading is within interval', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(getReadingStatus(tenDaysAgo, 30)).toBe('current');
  });

  it('returns "due" when reading is between interval and 1.5x interval', () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(getReadingStatus(fortyDaysAgo, 30)).toBe('due');
  });

  it('returns "overdue" when reading is very old', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(getReadingStatus(sixtyDaysAgo, 30)).toBe('overdue');
  });

  it('respects custom interval', () => {
    const fiftyDaysAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(getReadingStatus(fiftyDaysAgo, 60)).toBe('current');
    expect(getReadingStatus(fiftyDaysAgo, 30)).toBe('overdue');
  });
});

// ═══════════════════════════════════════════════════════════════════
// calculateAnnualConsumption
// ═══════════════════════════════════════════════════════════════════
describe('calculateAnnualConsumption', () => {
  it('returns null with less than 2 readings', () => {
    expect(calculateAnnualConsumption([])).toBeNull();
    expect(calculateAnnualConsumption([
      { id: '1', meter_id: 'm1', reading_date: '2025-01-01', reading_value: 100, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
    ])).toBeNull();
  });

  it('returns null when period is less than 30 days', () => {
    const readings: MeterReading[] = [
      { id: '1', meter_id: 'm1', reading_date: '2025-01-01', reading_value: 100, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
      { id: '2', meter_id: 'm1', reading_date: '2025-01-15', reading_value: 110, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
    ];
    expect(calculateAnnualConsumption(readings)).toBeNull();
  });

  it('calculates annual consumption correctly for 6 months', () => {
    const readings: MeterReading[] = [
      { id: '1', meter_id: 'm1', reading_date: '2025-01-01', reading_value: 1000, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
      { id: '2', meter_id: 'm1', reading_date: '2025-07-01', reading_value: 2500, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
    ];
    const result = calculateAnnualConsumption(readings);
    // 1500 in ~181 days → ~3025 per year
    expect(result).toBeGreaterThan(2900);
    expect(result).toBeLessThan(3100);
  });

  it('works with unsorted readings', () => {
    const readings: MeterReading[] = [
      { id: '2', meter_id: 'm1', reading_date: '2025-07-01', reading_value: 2000, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
      { id: '1', meter_id: 'm1', reading_date: '2025-01-01', reading_value: 1000, submitted_by: null, source: 'manual', confidence: null, image_url: null, is_verified: false, created_at: '' },
    ];
    const result = calculateAnnualConsumption(readings);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// calculateCost
// ═══════════════════════════════════════════════════════════════════
describe('calculateCost', () => {
  it('uses default price when no custom price given', () => {
    const result = calculateCost(100, 'electricity');
    // 100 * 0.32 = 32
    expect(result).toBe(32);
  });

  it('uses custom price when provided', () => {
    const result = calculateCost(100, 'electricity', 0.40);
    expect(result).toBe(40);
  });

  it('handles zero consumption', () => {
    expect(calculateCost(0, 'gas')).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    const result = calculateCost(33, 'electricity', 0.333);
    // 33 * 0.333 = 10.989 → 10.99
    expect(result).toBe(10.99);
  });
});

// ═══════════════════════════════════════════════════════════════════
// getEfficiencyGrade
// ═══════════════════════════════════════════════════════════════════
describe('getEfficiencyGrade', () => {
  it('returns A+ for very low consumption', () => {
    expect(getEfficiencyGrade(500, 2000)).toBe('A+');
  });

  it('returns A for low consumption', () => {
    expect(getEfficiencyGrade(1200, 2000)).toBe('A');
  });

  it('returns C for average consumption', () => {
    expect(getEfficiencyGrade(2000, 2000)).toBe('C');
  });

  it('returns G for very high consumption', () => {
    expect(getEfficiencyGrade(4000, 2000)).toBe('G');
  });

  it('covers all grades', () => {
    const grades = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const ratios = [0.4, 0.6, 0.8, 0.95, 1.1, 1.2, 1.4, 2.0];
    ratios.forEach((ratio, i) => {
      expect(getEfficiencyGrade(ratio * 1000, 1000)).toBe(grades[i]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// formatNumber / formatEuro
// ═══════════════════════════════════════════════════════════════════
describe('formatNumber', () => {
  it('formats integers', () => {
    const result = formatNumber(1234);
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  it('formats with decimals', () => {
    const result = formatNumber(1234.5, 1);
    expect(result).toContain('5');
  });
});

describe('formatEuro', () => {
  it('formats as EUR currency', () => {
    const result = formatEuro(42.5);
    expect(result).toContain('42');
    expect(result).toContain('€');
  });
});

// ═══════════════════════════════════════════════════════════════════
// Constants completeness
// ═══════════════════════════════════════════════════════════════════
describe('METER_TYPE constants', () => {
  const allTypes = [
    'electricity', 'gas', 'water_cold', 'water_hot', 'heating',
    'pv_feed_in', 'pv_self_consumption', 'pv_production',
    'electricity_ht', 'electricity_nt', 'electricity_common',
    'heat_pump', 'ev_charging', 'district_heating', 'cooling',
    'oil', 'pellets', 'lpg',
  ];

  it('METER_TYPE_LABELS has entries for all 18 types', () => {
    allTypes.forEach(type => {
      expect(METER_TYPE_LABELS).toHaveProperty(type);
      expect(typeof METER_TYPE_LABELS[type as keyof typeof METER_TYPE_LABELS]).toBe('string');
    });
  });

  it('METER_TYPE_UNITS has entries for all 18 types', () => {
    allTypes.forEach(type => {
      expect(METER_TYPE_UNITS).toHaveProperty(type);
    });
  });

  it('METER_TYPE_GROUPS covers all types', () => {
    const allGroupedTypes = Object.values(METER_TYPE_GROUPS).flatMap(g => g.types);
    allTypes.forEach(type => {
      expect(allGroupedTypes).toContain(type);
    });
  });

  it('CONSUMPTION_BENCHMARKS has at least 10 entries', () => {
    expect(CONSUMPTION_BENCHMARKS.length).toBeGreaterThanOrEqual(10);
  });
});
