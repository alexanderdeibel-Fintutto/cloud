import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'hot' | 'pinned' | 'category'
  className?: string
  style?: React.CSSProperties
}

export function Badge({ children, variant = 'default', className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
          'border border-border text-foreground': variant === 'outline',
          'bg-forum-hot/10 text-forum-hot': variant === 'hot',
          'bg-forum-pinned/10 text-forum-pinned': variant === 'pinned',
        },
        className
      )}
      style={style}
    >
      {children}
    </span>
  )
}
