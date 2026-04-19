import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Volume2, Clock, Trash2, Dog, Flame, Car, Snowflake, TreePine, Moon, Music, AlertCircle, CheckCircle2
} from "lucide-react";

const hausordnungItems = [
  { icon: Moon, title: "Ruhezeiten", description: "Nachtruhe von 22:00 bis 6:00 Uhr, Mittagsruhe von 13:00 bis 15:00 Uhr", color: "primary" as const, important: true },
  { icon: Volume2, title: "Lärmbelästigung", description: "Vermeiden Sie laute Geräusche, die andere Mieter stören könnten", color: "coral" as const, important: false },
  { icon: Music, title: "Musik & Feiern", description: "Feiern mit Musik bitte vorher ankündigen und Ruhezeiten einhalten", color: "secondary" as const, important: false },
  { icon: Trash2, title: "Müllentsorgung", description: "Müll trennen und nur in den vorgesehenen Behältern entsorgen. Sperrmüll gesondert anmelden.", color: "mint" as const, important: true },
  { icon: TreePine, title: "Garten & Gemeinschaftsflächen", description: "Gemeinschaftsflächen sauber halten. Grillen nur an vorgesehenen Plätzen.", color: "mint" as const, important: false },
  { icon: Dog, title: "Haustiere", description: "Haustiere sind nach Genehmigung erlaubt. Hunde müssen im Treppenhaus angeleint sein.", color: "amber" as const, important: false },
  { icon: Car, title: "Parken", description: "Nur auf zugewiesenen Stellplätzen parken. Fahrräder im Fahrradkeller abstellen.", color: "sky" as const, important: false },
  { icon: Flame, title: "Brandschutz", description: "Fluchtwege freihalten. Rauchen nur in der Wohnung oder auf dem Balkon.", color: "coral" as const, important: true },
  { icon: Snowflake, title: "Winterdienst", description: "Im Wechsel ist jeder Mieter für den Winterdienst verantwortlich (lt. Aushang).", color: "sky" as const, important: false },
  { icon: Clock, title: "Treppenhaus-Reinigung", description: "Die Treppenhausreinigung erfolgt im wöchentlichen Wechsel nach Plan.", color: "primary" as const, important: false },
];

export default function Hausordnung() {
  return (
    <MobileLayout>
      <PageHeader title="Hausordnung" subtitle="Regeln für ein harmonisches Zusammenleben" />

      <div className="px-4 -mt-2 space-y-4 pb-4">
        <AnimatedCard delay={0} accentColor="primary">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Wichtiger Hinweis</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Die Einhaltung der Hausordnung dient dem friedlichen Zusammenleben aller Mieter.
                </p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        <div className="space-y-3">
          {hausordnungItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <AnimatedCard delay={50 + index * 30} accentColor={item.color}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <IconBadge icon={Icon} variant={item.color} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.title}</p>
                          {item.important && (
                            <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase">Wichtig</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        <AnimatedCard delay={600} accentColor="mint">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-mint flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Hausordnung akzeptiert</p>
                <p className="text-sm text-muted-foreground">Mit Mietvertragsunterzeichnung</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
}
