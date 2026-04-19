import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DashboardWidget,
  WidgetType,
  useWidgetData,
  WIDGET_DEFINITIONS,
} from '@/hooks/useDashboardWidgets';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Calendar,
  Users,
  Target,
  ArrowUpDown,
  BarChart3,
  PieChart,
  Receipt,
  List,
  MoreVertical,
  X,
  ChevronUp,
  ChevronDown,
  Settings,
  GripVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WidgetProps {
  widget: DashboardWidget;
  editMode: boolean;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function Widget({ widget, editMode, onRemove, onMove, onUpdate }: WidgetProps) {
  const { data, loading } = useWidgetData(widget.type);

  const getWidgetContent = () => {
    if (loading) {
      return <WidgetSkeleton size={widget.size} />;
    }

    switch (widget.type) {
      case 'quick-stats':
        return <QuickStatsWidget data={data} />;
      case 'revenue-chart':
        return <RevenueChartWidget data={data} />;
      case 'expense-chart':
        return <ExpenseChartWidget data={data} />;
      case 'open-invoices':
        return <OpenInvoicesWidget data={data} />;
      case 'cash-balance':
        return <CashBalanceWidget data={data} />;
      case 'recent-transactions':
        return <RecentTransactionsWidget data={data} />;
      case 'budget-status':
        return <BudgetStatusWidget data={data} />;
      case 'upcoming-payments':
        return <UpcomingPaymentsWidget data={data} />;
      case 'tax-overview':
        return <TaxOverviewWidget data={data} />;
      case 'customer-overview':
        return <CustomerOverviewWidget data={data} />;
      case 'cashflow-mini':
        return <CashflowMiniWidget data={data} />;
      case 'profit-overview':
        return <ProfitOverviewWidget data={data} />;
      default:
        return <div>Widget nicht gefunden</div>;
    }
  };

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3',
  };

  return (
    <Card className={`${sizeClasses[widget.size]} ${editMode ? 'ring-2 ring-primary ring-dashed' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {editMode && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          )}
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        {editMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onMove('up')}>
                <ChevronUp className="h-4 w-4 mr-2" />
                Nach oben
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove('down')}>
                <ChevronDown className="h-4 w-4 mr-2" />
                Nach unten
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onRemove}
                className="text-destructive focus:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Entfernen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>{getWidgetContent()}</CardContent>
    </Card>
  );
}

function WidgetSkeleton({ size }: { size: string }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      {size !== 'small' && (
        <>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </>
      )}
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// Widget Components
function QuickStatsWidget({ data }: { data: any }) {
  if (!data) return null;

  const stats = [
    { label: 'Umsatz (Monat)', value: formatCurrency(data.revenue), color: 'text-green-600' },
    { label: 'Ausgaben (Monat)', value: formatCurrency(data.expenses), color: 'text-red-600' },
    { label: 'Gewinn', value: formatCurrency(data.profit), color: 'text-blue-600' },
    { label: 'Rechnungen', value: data.invoiceCount, color: '' },
    { label: 'Kunden', value: data.customerCount, color: '' },
    { label: 'Offene Forderungen', value: formatCurrency(data.openInvoicesAmount), color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function RevenueChartWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ExpenseChartWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

function OpenInvoicesWidget({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className="space-y-3">
      {data.map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium text-sm">{invoice.customer}</p>
            <p className="text-xs text-muted-foreground">Fällig: {invoice.dueDate}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{formatCurrency(invoice.amount)}</p>
            <Badge
              variant="outline"
              className={
                invoice.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                  invoice.status === 'due' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
              }
            >
              {invoice.status === 'overdue' ? 'Überfällig' :
                invoice.status === 'due' ? 'Fällig' : 'Offen'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function CashBalanceWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{formatCurrency(data.total)}</p>
          <div className="flex items-center gap-1 text-sm">
            {data.change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={data.change >= 0 ? 'text-green-600' : 'text-red-600'}>
              {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
            </span>
          </div>
        </div>
        <Wallet className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {data.accounts.map((acc: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{acc.name}</span>
            <span className="font-medium">{formatCurrency(acc.balance)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTransactionsWidget({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className="space-y-2">
      {data.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="text-sm font-medium">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
          </div>
          <p className={`font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}

function BudgetStatusWidget({ data }: { data: any }) {
  if (!data) return null;

  const percentage = (data.used / data.total) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>{formatCurrency(data.used)} von {formatCurrency(data.total)}</span>
          <span className="font-medium">{percentage.toFixed(0)}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
      </div>
      <div className="space-y-2">
        {data.categories.map((cat: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm w-20">{cat.name}</span>
            <Progress value={cat.used} className="h-2 flex-1" />
            <span className="text-sm w-10 text-right">{cat.used}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingPaymentsWidget({ data }: { data: any[] }) {
  if (!data) return null;

  const typeIcons: Record<string, React.ReactNode> = {
    salary: <Users className="h-4 w-4" />,
    insurance: <Receipt className="h-4 w-4" />,
    tax: <FileText className="h-4 w-4" />,
  };

  return (
    <div className="space-y-3">
      {data.map((payment) => (
        <div key={payment.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
          <div className="p-2 bg-background rounded-lg">
            {typeIcons[payment.type] || <Calendar className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{payment.description}</p>
            <p className="text-xs text-muted-foreground">Fällig: {payment.dueDate}</p>
          </div>
          <p className="font-bold text-red-600">{formatCurrency(payment.amount)}</p>
        </div>
      ))}
    </div>
  );
}

function TaxOverviewWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
          <p className="text-xs text-muted-foreground">USt zu zahlen</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(data.vatPayable)}</p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <p className="text-xs text-muted-foreground">Vorsteuer</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(data.vatReceivable)}</p>
        </div>
      </div>
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm">Netto-USt-Zahlung</span>
          <span className="font-bold">{formatCurrency(data.netVat)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Nächste Fälligkeit: {data.nextDue}</p>
      </div>
    </div>
  );
}

function CustomerOverviewWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{data.totalCustomers}</p>
          <p className="text-sm text-muted-foreground">Kunden gesamt</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          +{data.newThisMonth} neu
        </Badge>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">TOP KUNDEN</p>
        {data.topCustomers.map((customer: any, i: number) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-sm">{customer.name}</span>
            <span className="text-sm font-medium">{formatCurrency(customer.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CashflowMiniWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className={`text-xl font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.net >= 0 ? '+' : ''}{formatCurrency(data.net)}
          </p>
          <p className="text-xs text-muted-foreground">Netto Cash-Flow</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
          <p className="text-green-600 font-medium">{formatCurrency(data.inflow)}</p>
          <p className="text-xs text-muted-foreground">Einnahmen</p>
        </div>
        <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
          <p className="text-red-600 font-medium">{formatCurrency(data.outflow)}</p>
          <p className="text-xs text-muted-foreground">Ausgaben</p>
        </div>
      </div>
    </div>
  );
}

function ProfitOverviewWidget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.profit)}
          </p>
          <p className="text-sm text-muted-foreground">Aktueller Gewinn</p>
        </div>
        <Target className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Marge: </span>
          <span className="font-medium">{data.margin.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          {data.vsLastMonth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={data.vsLastMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {data.vsLastMonth >= 0 ? '+' : ''}{data.vsLastMonth.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
