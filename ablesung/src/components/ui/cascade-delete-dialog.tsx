import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface CascadeItem {
  label: string;
  count: number;
}

interface CascadeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cascadeItems?: CascadeItem[];
  isDeleting?: boolean;
}

export function CascadeDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cascadeItems = [],
  isDeleting = false,
}: CascadeDeleteDialogProps) {
  const hasCascadeData = cascadeItems.some(item => item.count > 0);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-0 rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center gap-2">
            {hasCascadeData && (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span>{description}</span>
            
            {hasCascadeData && (
              <div className="mt-4 p-3 bg-accent border border-border rounded-xl">
                <p className="font-medium text-destructive mb-2">
                  Folgende Daten werden ebenfalls gelöscht:
                </p>
                <ul className="space-y-1 text-sm">
                  {cascadeItems
                    .filter(item => item.count > 0)
                    .map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        <span>
                          {item.count} {item.label}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Löschen...
              </>
            ) : (
              'Endgültig löschen'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
