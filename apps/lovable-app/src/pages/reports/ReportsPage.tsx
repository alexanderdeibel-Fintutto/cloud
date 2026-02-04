import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Printer,
  Share2,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';

// Demo-Daten für BWA
const bwaData = {
  period: 'Januar 2026',
  revenue: [
    { name: 'Umsatzerlöse', current: 28500, previous: 25000, budget: 30000 },
  ],
  expenses: [
    { name: 'Materialaufwand', current: 0, previous: 0, budget: 0 },
    { name: 'Personalaufwand', current: 0, previous: 8500, budget: 10000 },
    { name: 'Miete', current: 2500, previous: 2500, budget: 2500 },
    { name: 'Versicherungen', current: 350, previous: 350, budget: 400 },
    { name: 'Telefon/Internet', current: 90, previous: 85, budget: 100 },
    { name: 'Bürobedarf', current: 180, previous: 120, budget: 150 },
    { name: 'Beratungskosten', current: 890, previous: 500, budget: 1000 },
    { name: 'IT-Kosten', current: 60, previous: 55, budget: 100 },
    { name: 'Sonstige Kosten', current: 130, previous: 200, budget: 250 },
  ],
};

const reports = [
  {
    id: 'bwa',
    name: 'BWA',
    description: 'Betriebswirtschaftliche Auswertung',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'guv',
    name: 'GuV',
    description: 'Gewinn- und Verlustrechnung',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'bilanz',
    name: 'Bilanz',
    description: 'Vermögensübersicht',
    icon: PieChart,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'ustva',
    name: 'UStVA',
    description: 'Umsatzsteuer-Voranmeldung',
    icon: Building2,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Buchungsjournal',
    icon: FileText,
    color: 'bg-gray-100 text-gray-600',
  },
  {
    id: 'summen',
    name: 'Summen & Salden',
    description: 'Kontensalden-Liste',
    icon: FileSpreadsheet,
    color: 'bg-cyan-100 text-cyan-600',
  },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-01');
  const [selectedReport, setSelectedReport] = useState('bwa');

  // BWA Berechnungen
  const totalRevenue = bwaData.revenue.reduce((sum, r) => sum + r.current, 0);
  const totalExpenses = bwaData.expenses.reduce((sum, e) => sum + e.current, 0);
  const operatingResult = totalRevenue - totalExpenses;
  const previousRevenue = bwaData.revenue.reduce((sum, r) => sum + r.previous, 0);
  const previousExpenses = bwaData.expenses.reduce((sum, e) => sum + e.previous, 0);
  const previousResult = previousRevenue - previousExpenses;
  const resultChange = operatingResult - previousResult;
  const resultChangePercent = previousResult !== 0 ? (resultChange / previousResult) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Berichte</h1>
          <p className="text-gray-500 mt-1">
            Auswertungen und Finanzberichte auf Knopfdruck
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border-0 focus:ring-0 bg-transparent"
            >
              <option value="2026-02">Februar 2026</option>
              <option value="2026-01">Januar 2026</option>
              <option value="2025-12">Dezember 2025</option>
              <option value="2025-q4">Q4 2025</option>
              <option value="2025">Jahr 2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className={cn(
              'cursor-pointer transition-all',
              selectedReport === report.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-md'
            )}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="p-4 text-center">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center',
                  report.color
                )}
              >
                <report.icon className="w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-900">{report.name}</p>
              <p className="text-xs text-gray-500 mt-1">{report.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BWA Report */}
      {selectedReport === 'bwa' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Gesamterlöse</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Gesamtaufwand</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Betriebsergebnis</p>
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        operatingResult >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatCurrency(operatingResult)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      operatingResult >= 0 ? 'bg-green-100' : 'bg-red-100'
                    )}
                  >
                    {operatingResult >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">vs. Vormonat</p>
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        resultChange >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {resultChange >= 0 ? '+' : ''}
                      {resultChangePercent.toFixed(1)}%
                    </p>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      resultChange >= 0 ? 'bg-green-100' : 'bg-red-100'
                    )}
                  >
                    {resultChange >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BWA Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                BWA – {bwaData.period}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Drucken
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Teilen
                </Button>
                <Button variant="gradient" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Position
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Aktuell
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Vormonat
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Plan
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Abweichung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Revenue Section */}
                    <tr className="bg-green-50 font-semibold">
                      <td colSpan={5} className="py-2 px-4 text-sm text-green-800">
                        Betriebserlöse
                      </td>
                    </tr>
                    {bwaData.revenue.map((item) => (
                      <tr key={item.name} className="border-b">
                        <td className="py-2 px-4 text-sm">{item.name}</td>
                        <td className="py-2 px-4 text-sm text-right font-medium">
                          {formatCurrency(item.current)}
                        </td>
                        <td className="py-2 px-4 text-sm text-right text-gray-500">
                          {formatCurrency(item.previous)}
                        </td>
                        <td className="py-2 px-4 text-sm text-right text-gray-500">
                          {formatCurrency(item.budget)}
                        </td>
                        <td
                          className={cn(
                            'py-2 px-4 text-sm text-right font-medium',
                            item.current >= item.budget ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {item.current >= item.budget ? '+' : ''}
                          {((item.current - item.budget) / item.budget * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold border-b">
                      <td className="py-2 px-4 text-sm">Summe Erlöse</td>
                      <td className="py-2 px-4 text-sm text-right">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td className="py-2 px-4 text-sm text-right text-gray-500">
                        {formatCurrency(previousRevenue)}
                      </td>
                      <td className="py-2 px-4 text-sm text-right text-gray-500">
                        {formatCurrency(bwaData.revenue.reduce((s, r) => s + r.budget, 0))}
                      </td>
                      <td className="py-2 px-4 text-sm text-right"></td>
                    </tr>

                    {/* Expenses Section */}
                    <tr className="bg-red-50 font-semibold">
                      <td colSpan={5} className="py-2 px-4 text-sm text-red-800">
                        Betriebsaufwand
                      </td>
                    </tr>
                    {bwaData.expenses.map((item) => (
                      <tr key={item.name} className="border-b">
                        <td className="py-2 px-4 text-sm">{item.name}</td>
                        <td className="py-2 px-4 text-sm text-right font-medium">
                          {item.current > 0 ? formatCurrency(item.current) : '–'}
                        </td>
                        <td className="py-2 px-4 text-sm text-right text-gray-500">
                          {item.previous > 0 ? formatCurrency(item.previous) : '–'}
                        </td>
                        <td className="py-2 px-4 text-sm text-right text-gray-500">
                          {item.budget > 0 ? formatCurrency(item.budget) : '–'}
                        </td>
                        <td
                          className={cn(
                            'py-2 px-4 text-sm text-right font-medium',
                            item.budget === 0 || item.current <= item.budget
                              ? 'text-green-600'
                              : 'text-red-600'
                          )}
                        >
                          {item.budget > 0
                            ? `${item.current <= item.budget ? '' : '+'}${((item.current - item.budget) / item.budget * 100).toFixed(1)}%`
                            : '–'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold border-b">
                      <td className="py-2 px-4 text-sm">Summe Aufwand</td>
                      <td className="py-2 px-4 text-sm text-right">
                        {formatCurrency(totalExpenses)}
                      </td>
                      <td className="py-2 px-4 text-sm text-right text-gray-500">
                        {formatCurrency(previousExpenses)}
                      </td>
                      <td className="py-2 px-4 text-sm text-right text-gray-500">
                        {formatCurrency(bwaData.expenses.reduce((s, e) => s + e.budget, 0))}
                      </td>
                      <td className="py-2 px-4 text-sm text-right"></td>
                    </tr>

                    {/* Result */}
                    <tr className="bg-primary-50 font-bold">
                      <td className="py-3 px-4 text-sm">Betriebsergebnis</td>
                      <td
                        className={cn(
                          'py-3 px-4 text-sm text-right',
                          operatingResult >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {formatCurrency(operatingResult)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-500">
                        {formatCurrency(previousResult)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-500">
                        {formatCurrency(
                          bwaData.revenue.reduce((s, r) => s + r.budget, 0) -
                            bwaData.expenses.reduce((s, e) => s + e.budget, 0)
                        )}
                      </td>
                      <td
                        className={cn(
                          'py-3 px-4 text-sm text-right',
                          resultChange >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {resultChange >= 0 ? '+' : ''}
                        {formatCurrency(resultChange)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Placeholder for other reports */}
      {selectedReport !== 'bwa' && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reports.find((r) => r.id === selectedReport)?.name}
            </h3>
            <p className="text-gray-500 mb-6">
              Dieser Bericht wird in der vollständigen Version verfügbar sein.
            </p>
            <Button variant="gradient">
              <Download className="w-4 h-4 mr-2" />
              Demo-Bericht herunterladen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
