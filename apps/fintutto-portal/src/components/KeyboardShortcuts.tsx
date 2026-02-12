import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['⌘', 'K'], description: 'Suche öffnen', category: 'Navigation' },
  { keys: ['⌘', '/'], description: 'Tastaturkürzel anzeigen', category: 'Navigation' },
  { keys: ['G', 'D'], description: 'Zum Dashboard', category: 'Navigation' },
  { keys: ['G', 'R'], description: 'Zu Rechnungen', category: 'Navigation' },
  { keys: ['G', 'B'], description: 'Zu Belegen', category: 'Navigation' },
  { keys: ['G', 'K'], description: 'Zu Kontakten', category: 'Navigation' },
  { keys: ['G', 'S'], description: 'Zu Einstellungen', category: 'Navigation' },

  // Aktionen
  { keys: ['N'], description: 'Neu erstellen (kontextabhängig)', category: 'Aktionen' },
  { keys: ['E'], description: 'Bearbeiten', category: 'Aktionen' },
  { keys: ['⌘', 'S'], description: 'Speichern', category: 'Aktionen' },
  { keys: ['⌘', 'P'], description: 'Drucken / PDF', category: 'Aktionen' },
  { keys: ['Esc'], description: 'Schließen / Abbrechen', category: 'Aktionen' },

  // Tabellen
  { keys: ['↑', '↓'], description: 'Zeile wählen', category: 'Tabellen' },
  { keys: ['Enter'], description: 'Zeile öffnen', category: 'Tabellen' },
  { keys: ['⌘', 'A'], description: 'Alle auswählen', category: 'Tabellen' },
  { keys: ['Delete'], description: 'Auswahl löschen', category: 'Tabellen' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline">Kürzel</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Tastaturkürzel
            </DialogTitle>
            <DialogDescription>
              Schneller navigieren mit Tastaturkürzeln
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-muted border rounded">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
            Drücken Sie <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">⌘</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">/</kbd> um diese Übersicht anzuzeigen
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
