import * as React from 'react'

const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ open, onOpenChange: _, ...props }, ref) => (
  <div ref={ref} data-state={open ? 'open' : 'closed'} {...props} />
))
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ ...props }, ref) => <button ref={ref} type="button" {...props} />)
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const parent = React.useContext(CollapsibleContext)
  if (!parent) return <div ref={ref} {...props} />
  return parent ? <div ref={ref} {...props} /> : null
})
CollapsibleContent.displayName = 'CollapsibleContent'

const CollapsibleContext = React.createContext<boolean>(true)

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
