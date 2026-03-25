/**
 * @fintutto/shared — WorkspaceSwitcher
 *
 * Universeller Workspace-Switcher für Financial Compass (Firmen) und Vermietify (Organisationen).
 * Analog zum CompanySwitcher im Translator.
 *
 * Props:
 * - workspaces: Liste der verfügbaren Workspaces
 * - activeWorkspace: Aktuell aktiver Workspace
 * - onSwitch: Callback beim Wechsel
 * - onNew: Callback für "Neue Firma/Organisation anlegen"
 * - label: Anzeige-Label ("Firma" oder "Organisation")
 */
import { useState } from 'react'
import { Building2, ChevronDown, Plus, Check } from 'lucide-react'
import type { Workspace } from '../hooks/useWorkspace'

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  onSwitch: (workspace: Workspace) => void
  onNew?: () => void
  label?: string
  className?: string
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onSwitch,
  onNew,
  label = 'Workspace',
  className = '',
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)

  if (!activeWorkspace) return null

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
          <p className="text-sm font-medium truncate leading-none">{activeWorkspace.name}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg py-1 overflow-hidden">
            <div className="px-3 py-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {workspaces.length} {label}{workspaces.length !== 1 ? 'n' : ''}
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSwitch(ws)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ws.name}</p>
                    {ws.legal_form && (
                      <p className="text-xs text-muted-foreground truncate">{ws.legal_form}</p>
                    )}
                  </div>
                  {activeWorkspace.id === ws.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {onNew && (
              <>
                <div className="border-t border-border mx-2 my-1" />
                <button
                  onClick={() => {
                    onNew()
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-accent transition-colors text-left text-primary"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Neue {label} anlegen</p>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
