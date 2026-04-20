import { LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  sparklineData?: number[];
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  iconColor = 'text-primary',
  sparklineData 
}: KPICardProps) {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const sparklineColor = changeType === 'negative' ? 'hsl(var(--destructive))' : 'hsl(var(--success))';

  // Convert sparkline data to chart format
  const chartData = sparklineData?.map((value, index) => ({ value, index })) || [];

  return (
    <div className="kpi-card-mobile sm:kpi-card group relative overflow-hidden">
      {/* Sparkline in background - hidden on mobile */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute top-2 right-2 w-16 sm:w-20 h-8 sm:h-10 opacity-60 hidden sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg bg-primary/10 ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
        </div>
        {change && (
          <span className={`text-xs sm:text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 truncate">{title}</p>
        <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{value}</p>
      </div>
    </div>
  );
}
