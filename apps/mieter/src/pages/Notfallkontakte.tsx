import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Phone, AlertTriangle, Flame, Shield, Zap, Droplets, Wrench, Building2, Clock, MapPin, PhoneCall } from "lucide-react";

const emergencyContacts = [
  { id: 1, title: "Polizei", number: "110", description: "Bei Einbruch, Gewalt, Bedrohung", icon: Shield, color: "primary" as const, isEmergency: true },
  { id: 2, title: "Feuerwehr & Rettung", number: "112", description: "Brand, Unfall, medizinischer Notfall", icon: Flame, color: "coral" as const, isEmergency: true },
  { id: 3, title: "Giftnotruf", number: "030 19240", description: "Vergiftungen aller Art", icon: AlertTriangle, color: "amber" as const, isEmergency: true },
];

const serviceContacts = [
  { id: 4, title: "Hausverwaltung", number: "+49 30 1234567", description: "Mo-Fr 8:00-17:00", icon: Building2, color: "primary" as const, name: "Müller Hausverwaltung GmbH" },
  { id: 5, title: "Hausmeister", number: "+49 151 12345678", description: "Für kleine Reparaturen & Fragen", icon: Wrench, color: "mint" as const, name: "Herr Schmidt" },
  { id: 6, title: "Notfall-Hausmeister", number: "+49 151 98765432", description: "24/7 für dringende Notfälle", icon: Clock, color: "coral" as const, name: "Bereitschaftsdienst" },
];

const utilityContacts = [
  { id: 7, title: "Stromausfall melden", number: "0800 1234567", description: "Störungshotline 24/7", icon: Zap, color: "amber" as const },
  { id: 8, title: "Gas-Notdienst", number: "0800 9876543", description: "Bei Gasgeruch sofort anrufen!", icon: Flame, color: "coral" as const },
  { id: 9, title: "Wasser-Notdienst", number: "0800 1111222", description: "Rohrbruch, Wasserschaden", icon: Droplets, color: "sky" as const },
];

export default function Notfallkontakte() {
  const handleCall = (number: string) => { window.location.href = `tel:${number.replace(/\s/g, '')}`; };

  return (
    <MobileLayout>
      <PageHeader title="Notfallkontakte" subtitle="Wichtige Nummern für den Ernstfall" />

      <div className="px-4 -mt-2 space-y-4 pb-4">
        {/* Emergency */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Notfallnummern</h2>
          </div>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div key={contact.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                  <AnimatedCard delay={50} accentColor={contact.color}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <IconBadge icon={Icon} variant={contact.color} size="lg" pulse />
                        <div className="flex-1"><p className="font-bold text-lg">{contact.title}</p><p className="text-sm text-muted-foreground">{contact.description}</p></div>
                        <Button onClick={() => handleCall(contact.number)} className="h-14 w-14 rounded-2xl gradient-primary shadow-lg shadow-primary/30"><Phone className="h-6 w-6" /></Button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50"><p className="text-2xl font-bold font-mono text-center text-primary">{contact.number}</p></div>
                    </CardContent>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Service */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Hausverwaltung & Service</h2>
          <div className="space-y-3">
            {serviceContacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div key={contact.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
                  <AnimatedCard delay={100 + index * 30} accentColor={contact.color}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <IconBadge icon={Icon} variant={contact.color} size="md" />
                        <div className="flex-1">
                          <p className="font-semibold">{contact.title}</p>
                          <p className="text-sm text-muted-foreground">{contact.name}</p>
                          <div className="flex items-center gap-1 mt-1"><Clock className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{contact.description}</span></div>
                        </div>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => handleCall(contact.number)}><PhoneCall className="h-5 w-5" /></Button>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Utilities */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Versorgungsunternehmen</h2>
          <AnimatedCard delay={300}>
            <div className="divide-y divide-border/50">
              {utilityContacts.map((contact) => {
                const Icon = contact.icon;
                return (
                  <CardContent key={contact.id} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleCall(contact.number)}>
                    <IconBadge icon={Icon} variant={contact.color} size="sm" />
                    <div className="flex-1"><p className="font-medium text-sm">{contact.title}</p><p className="text-xs text-muted-foreground">{contact.description}</p></div>
                    <div className="text-right"><p className="font-mono font-semibold text-sm">{contact.number}</p></div>
                  </CardContent>
                );
              })}
            </div>
          </AnimatedCard>
        </div>

        {/* Location */}
        <AnimatedCard delay={400} accentColor="primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <IconBadge icon={MapPin} variant="primary" size="md" />
              <div className="flex-1">
                <p className="font-semibold">Ihre Adresse für Notrufe</p>
                <p className="text-sm text-muted-foreground">Musterstraße 42, 12345 Berlin</p>
                <p className="text-sm text-muted-foreground">3. OG links</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
}
