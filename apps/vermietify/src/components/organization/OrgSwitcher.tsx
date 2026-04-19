import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronsUpDown, Plus, Check, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrganizations, useSwitchOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Alle Organisationen des Nutzers laden (via organization_members)
  const { data: organizations = [], isLoading } = useMyOrganizations();
  const switchOrg = useSwitchOrganization();

  // Aktuelle Organisation aus der Liste ermitteln
  const selectedOrg = organizations.find(
    (o) => o.id === profile?.organization_id
  ) ?? organizations[0];

  const handleSelectOrg = (org: (typeof organizations)[0]) => {
    if (org.id === selectedOrg?.id) {
      setOpen(false);
      return;
    }
    // Organisation wechseln (aktualisiert profiles.organization_id + reload)
    switchOrg.mutate(org.id);
    setOpen(false);
  };

  // Switcher nur anzeigen wenn mehrere Organisationen vorhanden
  if (isLoading || organizations.length <= 1) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedOrg?.name || "Organisation wählen"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Suchen..." />
          <CommandList>
            <CommandEmpty>Keine Organisation gefunden.</CommandEmpty>
            <CommandGroup heading="Organisationen">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleSelectOrg(org)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOrg?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{org.name}</span>
                  {org.type === "personal" && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Privat
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  navigate("/admin/organisationen");
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Neue Organisation
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
