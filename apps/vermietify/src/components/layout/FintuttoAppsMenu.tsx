import { useState, useRef, useEffect } from "react";
import { getEcosystemBarItems } from "@fintutto/shared";
import { LayoutGrid } from "lucide-react";

const apps = getEcosystemBarItems("vermietify");

export function FintuttoAppsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        title="Fintutto Apps"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border z-50 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2 px-1">Fintutto Apps</p>
          <div className="grid grid-cols-3 gap-1">
            {apps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-center"
                onClick={() => setOpen(false)}
              >
                <span className="text-2xl mb-1">{app.icon}</span>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">{app.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
