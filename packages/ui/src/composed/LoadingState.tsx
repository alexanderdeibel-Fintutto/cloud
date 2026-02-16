import { cn } from '../utils'
import { Skeleton } from '../primitives/Skeleton'

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots'
  text?: string
  className?: string
}

export function LoadingState({ variant = 'spinner', text, className }: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-1 py-12', className)}>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {text && <p className="mt-3 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
