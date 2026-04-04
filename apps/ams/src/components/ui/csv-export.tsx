import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface CSVExportProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: { key: string; label: string }[];
  label?: string;
}

export function CSVExport({ data, filename, columns, label = 'CSV Export' }: CSVExportProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

    const header = cols.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
      cols.map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={!data || data.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
