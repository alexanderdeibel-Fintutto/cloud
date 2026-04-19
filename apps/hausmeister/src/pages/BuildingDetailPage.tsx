import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building as BuildingIcon, 
  MapPin, 
  Phone, 
  Mail,
  Home,
  Calendar,
  Ruler,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SuitePromoCards } from "@/components/apps/SuitePromoCards";
import type { Building, Unit } from "@/types";

// Mock data
const mockBuilding: Building = {
  id: "b1",
  company_id: "c1",
  name: "Parkstraße 12",
  address: "Parkstraße 12, 10115 Berlin",
  year_built: 1985,
  total_area: 1200,
  units_count: 8,
  created_at: "",
};

const mockUnits: Unit[] = [
  { id: "u1", building_id: "b1", unit_number: "EG-1", floor: 0, area: 85, tenant_name: "Familie Müller", status: "occupied" },
  { id: "u2", building_id: "b1", unit_number: "EG-2", floor: 0, area: 72, tenant_name: "Herr Schmidt", status: "occupied" },
  { id: "u3", building_id: "b1", unit_number: "1A", floor: 1, area: 95, status: "vacant" },
  { id: "u4", building_id: "b1", unit_number: "1B", floor: 1, area: 78, tenant_name: "Frau Weber", status: "occupied" },
  { id: "u5", building_id: "b1", unit_number: "2A", floor: 2, area: 95, tenant_name: "Familie Koch", status: "occupied" },
  { id: "u6", building_id: "b1", unit_number: "2B", floor: 2, area: 78, status: "maintenance" },
  { id: "u7", building_id: "b1", unit_number: "3A", floor: 3, area: 110, tenant_name: "Herr Braun", status: "occupied" },
  { id: "u8", building_id: "b1", unit_number: "3B", floor: 3, area: 88, tenant_name: "Frau Klein", status: "occupied" },
];

const statusConfig = {
  occupied: { label: "Vermietet", className: "bg-primary/10 text-primary" },
  vacant: { label: "Leer", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  maintenance: { label: "Wartung", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building] = useState<Building>(mockBuilding);
  const [units] = useState<Unit[]>(mockUnits);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold truncate">{building.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{building.address}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Building Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BuildingIcon className="h-4 w-4" />
              Gebäudeinformationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{building.address}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Home className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="font-semibold">{building.units_count}</div>
                <div className="text-xs text-muted-foreground">Einheiten</div>
              </div>
              {building.year_built && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-semibold">{building.year_built}</div>
                  <div className="text-xs text-muted-foreground">Baujahr</div>
                </div>
              )}
              {building.total_area && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-semibold">{building.total_area}</div>
                  <div className="text-xs text-muted-foreground">m²</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hausverwaltung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start touch-target">
              <Phone className="h-4 w-4 mr-2" />
              030 123 456 789
            </Button>
            <Button variant="outline" className="w-full justify-start touch-target">
              <Mail className="h-4 w-4 mr-2" />
              kontakt@hausverwaltung.de
            </Button>
          </CardContent>
        </Card>

        {/* Units */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4" />
              Wohnungen ({units.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {units.map((unit) => {
              const status = statusConfig[unit.status];
              return (
                <div 
                  key={unit.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{unit.unit_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {unit.tenant_name || "Kein Mieter"}
                      {unit.area && ` • ${unit.area} m²`}
                    </div>
                  </div>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Start Tour Button */}
        <Button size="lg" className="w-full touch-target">
          <Play className="h-5 w-5 mr-2" />
          Rundgang starten
        </Button>

        {/* Suite Promo – Weitere Apps für dein Gebäude */}
        <SuitePromoCards />
      </div>
    </div>
  );
}
