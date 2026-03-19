import { useRef, useEffect, useState, useCallback } from 'react'
import { MapPin, Loader2, ZoomIn, ZoomOut, Layers, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGoogleMapsApi } from '@/hooks/useGoogleMapsApi'

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

export default function MapView({
  markers = [],
  center = { lat: 52.5200, lng: 13.4050 },
  zoom = 12,
  searchable = true,
  onMarkerClick,
  className = '',
}: MapViewProps) {
  const { ready, error: apiError } = useGoogleMapsApi()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  // Initialize map
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      gestureHandling: 'cooperative',
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    })

    mapInstanceRef.current = map
    infoWindowRef.current = new google.maps.InfoWindow()
  }, [ready])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    if (markers.length === 0) return

    const bounds = new google.maps.LatLngBounds()

    markers.forEach((marker) => {
      const position = { lat: marker.lat, lng: marker.lng }
      bounds.extend(position)

      const gMarker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current!,
        title: marker.label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: marker.type === 'property' ? '#7c3aed' : '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 10,
        },
        label: {
          text: marker.label[0] || '',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
        },
      })

      gMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 4px 8px; font-family: sans-serif;">
              <strong style="font-size: 13px;">${marker.label}</strong>
              ${marker.details ? `<p style="font-size: 11px; color: #666; margin: 4px 0 0;">${marker.details}</p>` : ''}
            </div>
          `)
          infoWindowRef.current.open(mapInstanceRef.current!, gMarker)
        }
        onMarkerClick?.(marker)
      })

      markersRef.current.push(gMarker)
    })

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, 50)
    } else if (markers.length === 1) {
      mapInstanceRef.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng })
      mapInstanceRef.current.setZoom(14)
    }
  }, [markers, ready])

  const handleZoomIn = useCallback(() => {
    const map = mapInstanceRef.current
    if (map) map.setZoom((map.getZoom() || zoom) + 1)
  }, [zoom])

  const handleZoomOut = useCallback(() => {
    const map = mapInstanceRef.current
    if (map) map.setZoom((map.getZoom() || zoom) - 1)
  }, [zoom])

  const toggleMapType = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const next = mapType === 'roadmap' ? 'satellite' : 'roadmap'
    map.setMapTypeId(next)
    setMapType(next)
  }, [mapType])

  // Fallback for when Google Maps fails to load
  if (apiError) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Karte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted rounded-xl overflow-hidden flex flex-col items-center justify-center text-muted-foreground" style={{ height: '300px' }}>
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">Karte konnte nicht geladen werden</p>
            <p className="text-xs mt-1">{apiError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Karte
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={toggleMapType}>
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-xl overflow-hidden" style={{ height: '300px' }}>
          {!ready ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div ref={mapRef} className="h-full w-full" />
          )}
        </div>

        {/* Legend */}
        {markers.length > 0 && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-purple-600" />
              <span>Immobilien ({markers.filter((m) => m.type === 'property').length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Suchergebnisse</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
