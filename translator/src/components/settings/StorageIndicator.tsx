import { HardDrive, Shield, ShieldAlert } from 'lucide-react'

interface StorageIndicatorProps {
  storageUsed: string
  storagePercent: number
  isPersistent: boolean
  onRequestPersistence: () => void
}

export default function StorageIndicator({
  storageUsed,
  storagePercent,
  isPersistent,
  onRequestPersistence,
}: StorageIndicatorProps) {
  return (
    <div className="space-y-3">
      {/* Storage bar */}
      <div className="flex items-center gap-3">
        <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Speicher</span>
            <span className="font-medium">{storageUsed}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storagePercent > 80 ? 'bg-destructive' : storagePercent > 50 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Persistence status */}
      <div className="flex items-center gap-2 text-sm">
        {isPersistent ? (
          <>
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">
              Persistent Storage aktiv — Daten werden nicht gelöscht
            </span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-600 dark:text-amber-400">
              Daten können vom Browser gelöscht werden.{' '}
              <button
                onClick={onRequestPersistence}
                className="underline hover:text-foreground transition-colors"
              >
                Schutz aktivieren
              </button>
            </span>
          </>
        )}
      </div>
    </div>
  )
}
