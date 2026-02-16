// @fintutto/ui — Shared Design System
// Primitives, Composed Components, Theme Presets

// Utility
export { cn } from './utils'

// Primitives
export { Button, buttonVariants, type ButtonProps } from './primitives/Button'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './primitives/Card'
export { Input, type InputProps } from './primitives/Input'
export { Label } from './primitives/Label'
export { Separator } from './primitives/Separator'
export { Skeleton } from './primitives/Skeleton'
export { Badge, badgeVariants, type BadgeProps } from './primitives/Badge'

// Composed
export { AppShell } from './composed/AppShell'
export { EmptyState } from './composed/EmptyState'
export { LoadingState } from './composed/LoadingState'
export { ErrorBoundary } from './composed/ErrorBoundary'

// Theme
export { themePresets, type ThemePreset } from './theme/presets'
