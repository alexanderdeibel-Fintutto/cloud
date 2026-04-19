import { ReadingStatus, getReadingStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface ReadingStatusBadgeProps {
  lastReadingDate?: string;
  intervalDays?: number;
  className?: string;
}

const statusConfig: Record<ReadingStatus, { label: string; className: string }> = {
  current: { label: 'Aktuell', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  due: { label: 'Fällig', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  overdue: { label: 'Überfällig', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export function ReadingStatusBadge({ lastReadingDate, intervalDays = 30, className }: ReadingStatusBadgeProps) {
  const status = getReadingStatus(lastReadingDate, intervalDays);
  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
