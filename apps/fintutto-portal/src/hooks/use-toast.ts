// Minimal use-toast hook for fintutto-portal
import { useState } from 'react'
import type React from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  function toast({ title, description, variant = 'default', action }: Omit<Toast, 'id'>) {
    const id = String(++toastCount)
    setToasts((prev) => [...prev, { id, title, description, variant, action }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, toast, dismiss }
}
