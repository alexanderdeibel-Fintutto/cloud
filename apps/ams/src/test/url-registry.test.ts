import { describe, it, expect } from 'vitest';
import { urlRegistry, categoryLabels } from '@/lib/url-registry';

describe('URL Registry', () => {
  it('should contain at least one URL entry', () => {
    expect(urlRegistry.length).toBeGreaterThan(0);
  });

  it('every entry should have a valid URL', () => {
    for (const entry of urlRegistry) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });

  it('every entry should have a non-empty label', () => {
    for (const entry of urlRegistry) {
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it('every entry should have a valid category', () => {
    const validCategories = Object.keys(categoryLabels);
    for (const entry of urlRegistry) {
      expect(validCategories).toContain(entry.category);
    }
  });

  it('every entry should have a non-empty source', () => {
    for (const entry of urlRegistry) {
      expect(entry.source.length).toBeGreaterThan(0);
    }
  });

  it('should not have duplicate URLs', () => {
    const urls = urlRegistry.map((e) => e.url);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });

  it('should contain at least one critical URL', () => {
    const criticalCount = urlRegistry.filter((e) => e.critical).length;
    expect(criticalCount).toBeGreaterThan(0);
  });

  it('should contain the Supabase API endpoint', () => {
    const supabase = urlRegistry.find((e) => e.category === 'api');
    expect(supabase).toBeDefined();
    expect(supabase!.url).toContain('supabase.co');
  });

  it('should contain Google Fonts entries', () => {
    const fonts = urlRegistry.filter((e) => e.category === 'font');
    expect(fonts.length).toBeGreaterThanOrEqual(6);
  });
});
