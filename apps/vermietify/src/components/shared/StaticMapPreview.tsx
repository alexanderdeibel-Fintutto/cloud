import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { useStaticMap } from "@/hooks/useStaticMap";

interface StaticMapPreviewProps {
  address: string;
  className?: string;
  height?: string;
  zoom?: number;
  showLink?: boolean;
}

export function StaticMapPreview({
  address,
  className = "",
  height = "200px",
  zoom = 15,
  showLink = true,
}: StaticMapPreviewProps) {
  const { image, isLoading, error } = useStaticMap(address, { zoom });

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : image ? (
        <>
          <img
            src={image}
            alt={`Karte: ${address}`}
            className="h-full w-full object-cover"
          />
          {showLink && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Google Maps
            </a>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <MapPin className="h-6 w-6 text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">
            {error || "Keine Kartenvorschau verfuegbar"}
          </p>
          {showLink && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              In Google Maps oeffnen
            </a>
          )}
        </div>
      )}
    </div>
  );
}
