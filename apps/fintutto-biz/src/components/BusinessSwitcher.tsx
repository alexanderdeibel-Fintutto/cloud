import { useState } from "react";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import type { UserBusiness } from "@/hooks/useBusinesses";

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  freelancer: "Freelancer",
  einzelunternehmen: "Einzelunternehmen",
  gbr: "GbR",
  ug: "UG (haftungsbeschränkt)",
  gmbh: "GmbH",
};

interface BusinessSwitcherProps {
  businesses: UserBusiness[];
  activeBusinessId: string | null;
  onSwitch: (id: string) => void;
  onCreateNew: () => void;
}

export function BusinessSwitcher({
  businesses,
  activeBusinessId,
  onSwitch,
  onCreateNew,
}: BusinessSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = businesses.find((b) => b.business_id === activeBusinessId);

  if (businesses.length === 0) return null;

  return (
    <div className="relative px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
      >
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-white truncate">
            {active?.business_name ?? "Firma wählen"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {active ? BUSINESS_TYPE_LABELS[active.business_type] ?? active.business_type : ""}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute left-3 right-3 top-full mt-1 z-20 rounded-lg border border-white/10 bg-zinc-900 shadow-xl overflow-hidden">
            <div className="py-1">
              {businesses.map((biz) => (
                <button
                  key={biz.business_id}
                  onClick={() => {
                    onSwitch(biz.business_id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-white truncate">{biz.business_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {BUSINESS_TYPE_LABELS[biz.business_type] ?? biz.business_type}
                      {biz.role !== "owner" && (
                        <span className="ml-1 text-primary">({biz.role})</span>
                      )}
                    </p>
                  </div>
                  {biz.business_id === activeBusinessId && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 py-1">
              <button
                onClick={() => {
                  onCreateNew();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-primary hover:bg-white/5 transition-colors"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Neue Firma anlegen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
