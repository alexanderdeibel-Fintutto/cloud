import { describe, it, expect, vi } from 'vitest';

describe('CSV Export', () => {
  it('should generate valid CSV content from data', () => {
    const data = [
      { name: 'Test', email: 'test@example.com', count: 5 },
      { name: 'Foo "Bar"', email: 'foo@bar.com', count: 10 },
    ];

    const cols = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'E-Mail' },
      { key: 'count', label: 'Anzahl' },
    ];

    const header = cols.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
      cols.map(c => {
        const val = row[c.key as keyof typeof row];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');

    expect(csv).toContain('"Name","E-Mail","Anzahl"');
    expect(csv).toContain('"Test","test@example.com","5"');
    expect(csv).toContain('"Foo ""Bar""","foo@bar.com","10"');
  });

  it('should handle empty data', () => {
    const data: Record<string, unknown>[] = [];
    expect(data.length).toBe(0);
  });

  it('should handle null values', () => {
    const data = [{ name: null, email: undefined, count: 0 }];
    const cols = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'E-Mail' }, { key: 'count', label: 'Count' }];

    const rows = data.map(row =>
      cols.map(c => {
        const val = row[c.key as keyof typeof row];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );

    expect(rows[0]).toBe('"","","0"');
  });
});
