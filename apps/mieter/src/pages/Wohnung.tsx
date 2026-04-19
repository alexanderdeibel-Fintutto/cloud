import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, Maximize, Layers, Calendar, Euro, Thermometer, Droplets, Zap, Key, User, Building2, ChevronRight, Copy, Check
} from "lucide-react";
import { useState } from "react";

export default function Wohnung() {
  const [copied, setCopied] = useState(false);

  const wohnungData = {
    address: "Musterstraße 42", postalCity: "12345 Berlin", apartment: "Wohnung 3. OG links",
    area: "78,5 m²", rooms: "3 Zimmer", floor: "3. Obergeschoss", moveInDate: "01.04.2023",
    rentCold: "650,00 €", rentUtilities: "200,00 €", rentTotal: "850,00 €",
    deposit: "1.950,00 €", depositStatus: "Vollständig gezahlt",
    landlord: "Müller Hausverwaltung GmbH", landlordContact: "info@mueller-hv.de", tenantNumber: "MH-2023-0042"
  };

  const copyTenantNumber = () => {
    navigator.clipboard.writeText(wohnungData.tenantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileLayout>
      <PageHeader title="Meine Wohnung" subtitle={wohnungData.address} />

      <div className="px-4 -mt-2 space-y-4 pb-4">
        {/* Address Card */}
        <AnimatedCard delay={0} accentColor="primary">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <Home className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-white/90">{wohnungData.address}</p>
                <p className="text-white/60">{wohnungData.postalCity}</p>
                <p className="text-sm text-white/50 mt-1">{wohnungData.apartment}</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-white/50" />
                <span className="text-sm text-white/50">Mieternummer:</span>
                <span className="font-mono font-semibold text-white/90">{wohnungData.tenantNumber}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10" onClick={copyTenantNumber}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <AnimatedCard delay={100} accentColor="sky">
            <CardContent className="p-4 text-center">
              <IconBadge icon={Maximize} variant="sky" size="md" className="mx-auto mb-2" />
              <p className="text-2xl font-bold text-white/90">{wohnungData.area}</p>
              <p className="text-xs text-white/50">Wohnfläche</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={150} accentColor="mint">
            <CardContent className="p-4 text-center">
              <IconBadge icon={Layers} variant="mint" size="md" className="mx-auto mb-2" />
              <p className="text-2xl font-bold text-white/90">{wohnungData.rooms}</p>
              <p className="text-xs text-white/50">Zimmer</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={200} accentColor="coral">
            <CardContent className="p-4 text-center">
              <IconBadge icon={Building2} variant="coral" size="md" className="mx-auto mb-2" />
              <p className="text-lg font-bold text-white/90">{wohnungData.floor}</p>
              <p className="text-xs text-white/50">Etage</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={250} accentColor="amber">
            <CardContent className="p-4 text-center">
              <IconBadge icon={Calendar} variant="amber" size="md" className="mx-auto mb-2" />
              <p className="text-lg font-bold text-white/90">{wohnungData.moveInDate}</p>
              <p className="text-xs text-white/50">Einzugsdatum</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Rent Details */}
        <AnimatedCard delay={300} accentColor="primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <IconBadge icon={Euro} variant="primary" size="sm" />
              <h3 className="font-semibold text-white/90">Mietkosten</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-white/60">Kaltmiete</span><span className="font-semibold text-white/90">{wohnungData.rentCold}</span></div>
              <div className="flex justify-between items-center"><span className="text-white/60">Nebenkosten</span><span className="font-semibold text-white/90">{wohnungData.rentUtilities}</span></div>
              <div className="h-px bg-white/[0.08]" />
              <div className="flex justify-between items-center"><span className="font-semibold text-white/90">Gesamtmiete</span><span className="text-xl font-bold text-primary">{wohnungData.rentTotal}</span></div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Deposit */}
        <AnimatedCard delay={350} accentColor="mint">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconBadge icon={Key} variant="mint" size="md" />
                <div><p className="font-semibold text-white/90">Kaution</p><p className="text-sm text-white/50">{wohnungData.deposit}</p></div>
              </div>
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">{wohnungData.depositStatus}</span>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Meters */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Zähler in der Wohnung</h3>
          <AnimatedCard delay={400}>
            <div className="divide-y divide-white/[0.08]">
              {[
                { icon: Zap, label: "Stromzähler", value: "DE0001234567890", color: "amber" as const },
                { icon: Thermometer, label: "Gaszähler", value: "G0987654321", color: "coral" as const },
                { icon: Droplets, label: "Wasserzähler (kalt)", value: "WK-2023-001", color: "sky" as const },
                { icon: Droplets, label: "Wasserzähler (warm)", value: "WW-2023-001", color: "coral" as const },
              ].map((meter) => {
                const Icon = meter.icon;
                return (
                  <CardContent key={meter.label} className="p-4 flex items-center gap-3">
                    <IconBadge icon={Icon} variant={meter.color} size="sm" />
                    <div className="flex-1"><p className="font-medium text-sm text-white/90">{meter.label}</p><p className="text-xs text-white/40 font-mono">{meter.value}</p></div>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </CardContent>
                );
              })}
            </div>
          </AnimatedCard>
        </div>

        {/* Landlord */}
        <AnimatedCard delay={450} accentColor="primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg"><User className="h-6 w-6 text-white" /></div>
              <div className="flex-1"><p className="font-semibold text-white/90">{wohnungData.landlord}</p><p className="text-sm text-white/50">{wohnungData.landlordContact}</p></div>
              <Button variant="outline" size="sm" className="border-white/[0.12] text-white/70 hover:text-white hover:bg-white/10">Kontakt</Button>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
}