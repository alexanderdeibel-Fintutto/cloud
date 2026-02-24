import { useState } from 'react'
import {
  FileText,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Eye,
  FileImage,
  File,
} from 'lucide-react'
import { Button } from './ui/button'

interface DokumentVorschauProps {
  url: string | null
  titel: string
}

export default function DokumentVorschau({ url, titel }: DokumentVorschauProps) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
        <File className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Kein Dokument vorhanden</p>
        <p className="text-xs text-muted-foreground mt-1">
          Laden Sie den Bescheid hoch, um ihn hier anzuzeigen
        </p>
      </div>
    )
  }

  const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('/pdf')
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)/i.test(url)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => { setZoom(100); setRotation(0) }

  return (
    <>
      {/* Preview Trigger */}
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        Dokument anzeigen
      </Button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-label="Dokument-Vorschau">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Content */}
          <div className="absolute inset-4 sm:inset-8 flex flex-col bg-background rounded-xl border border-border shadow-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                {isPdf ? (
                  <FileText className="h-5 w-5 text-red-500" />
                ) : isImage ? (
                  <FileImage className="h-5 w-5 text-blue-500" />
                ) : (
                  <File className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-semibold text-sm">{titel}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isPdf ? 'PDF-Dokument' : isImage ? 'Bild' : 'Dokument'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Zoom Controls */}
                <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Verkleinern">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Vergroessern">
                  <ZoomIn className="h-4 w-4" />
                </Button>

                {/* Rotate (for images) */}
                {isImage && (
                  <Button variant="ghost" size="sm" onClick={handleRotate} title="Drehen">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                )}

                {/* Reset */}
                {(zoom !== 100 || rotation !== 0) && (
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                    Zuruecksetzen
                  </Button>
                )}

                <div className="w-px h-6 bg-border mx-1" />

                {/* Download & Open */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  title="In neuem Tab oeffnen"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <a href={url} download title="Herunterladen">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Close */}
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} title="Schliessen">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document View */}
            <div className="flex-1 overflow-auto bg-muted/30 flex items-start justify-center p-4">
              {isPdf ? (
                <iframe
                  src={`${url}#toolbar=0`}
                  title={titel}
                  className="w-full h-full border-0 rounded-lg bg-white"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                  }}
                />
              ) : isImage ? (
                <img
                  src={url}
                  alt={titel}
                  className="max-w-full rounded-lg shadow-lg transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <File className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Vorschau nicht verfuegbar</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dieses Dateiformat kann nicht direkt angezeigt werden.
                  </p>
                  <div className="flex gap-2">
                    <a href={url} download>
                      <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Herunterladen
                      </Button>
                    </a>
                    <Button variant="outline" className="gap-2" onClick={() => window.open(url, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                      Im Browser oeffnen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
