import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function KPICard({ title, value, change, icon: Icon, iconColor }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {change.trend === 'up' && (
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                )}
                {change.trend === 'down' && (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.trend === 'up' && 'text-chart-2',
                    change.trend === 'down' && 'text-destructive',
                    change.trend === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change.value}
                </span>
                <span className="text-sm text-muted-foreground">vs. Vormonat</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-lg bg-primary/10 p-3', iconColor)}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
