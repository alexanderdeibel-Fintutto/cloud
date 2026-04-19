import { useState } from "react";
import { Search, Building2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BuildingCard } from "@/components/buildings/BuildingCard";
import { Input } from "@/components/ui/input";
import type { Building } from "@/types";

// Mock data
const mockBuildings: (Building & { openTasks: number })[] = [
  {
    id: "b1",
    company_id: "c1",
    name: "Parkstraße 12",
    address: "Parkstraße 12, 10115 Berlin",
    year_built: 1985,
    total_area: 1200,
    units_count: 8,
    created_at: "",
    openTasks: 3,
  },
  {
    id: "b2",
    company_id: "c1",
    name: "Lindenallee 5",
    address: "Lindenallee 5, 10115 Berlin",
    year_built: 1992,
    total_area: 2400,
    units_count: 12,
    created_at: "",
    openTasks: 1,
  },
  {
    id: "b3",
    company_id: "c1",
    name: "Hauptstraße 88",
    address: "Hauptstraße 88, 10117 Berlin",
    year_built: 2005,
    total_area: 800,
    units_count: 4,
    created_at: "",
    openTasks: 0,
  },
  {
    id: "b4",
    company_id: "c1",
    name: "Am Marktplatz 3",
    address: "Am Marktplatz 3, 10178 Berlin",
    year_built: 1970,
    total_area: 3200,
    units_count: 16,
    created_at: "",
    openTasks: 5,
  },
];

export default function BuildingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [buildings] = useState(mockBuildings);

  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOpenTasks = buildings.reduce((sum, b) => sum + b.openTasks, 0);

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Objekte"
        subtitle={`${buildings.length} Gebäude • ${totalOpenTasks} offene Aufgaben`}
      />

      {/* Search */}
      <div className="px-4 py-3 border-b border-border sticky top-[73px] z-30 bg-card/50 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Gebäude suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-xl bg-secondary/50 border-border focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filteredBuildings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Keine Gebäude gefunden
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Versuche einen anderen Suchbegriff
            </p>
          </div>
        ) : (
          filteredBuildings.map((building, index) => (
            <BuildingCard
              key={building.id}
              building={building}
              openTasks={building.openTasks}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
