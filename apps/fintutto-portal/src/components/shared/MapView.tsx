import { MapPin, Navigation, Search, ZoomIn, ZoomOut, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MapMarker {
  id: string
  lat: number
  lng: number
  label: string
  type: 'property' | 'search' | 'poi'
  details?: string
}

interface MapViewProps {
  markers?: MapMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
  searchable?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  className?: string
}

// Placeholder map component - in production, integrate with Leaflet/Mapbox/Google Maps
export default function MapView({
  markers = [],
  center = { lat: 52.5200, lng: 13.4050 }, // Berlin
  zoom = 12,
  searchable = true,
  onMarkerClick,
  className = '',
}: MapViewProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Karte
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {searchable && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Adresse suchen..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* Map Placeholder */}
        <div className="relative bg-muted rounded-xl overflow-hidden" style={{ height: '300px' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <MapPin className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Kartenansicht</p>
            <p className="text-xs mt-1">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)} (Zoom: {zoom})
            </p>
          </div>

          {/* Grid overlay to simulate map tiles */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Markers */}
          {markers.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center gap-4">
              {markers.slice(0, 5).map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => onMarkerClick?.(marker)}
                  className="flex flex-col items-center group"
                  title={marker.label}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md ${
                    marker.type === 'property' ? 'bg-primary text-white' : 'bg-white text-primary'
                  }`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] mt-1 bg-white/90 px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {marker.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {markers.length === 0 && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-xs text-center text-muted-foreground bg-background/80 backdrop-blur rounded-lg py-2 px-3">
                Kartenintegration bereit. Füge Immobilien hinzu, um sie auf der Karte zu sehen.
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        {markers.length > 0 && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Immobilien ({markers.filter((m) => m.type === 'property').length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-white border border-primary" />
              <span>Suchergebnisse</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
