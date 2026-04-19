import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  FileText, Download, Eye, Search, Calendar, FolderOpen, File, FileCheck, Receipt, Home, Shield
} from "lucide-react";
import { useState } from "react";

const documentCategories = [
  { id: "all", label: "Alle", icon: FolderOpen, count: 8 },
  { id: "contract", label: "Vertrag", icon: FileCheck, count: 2 },
  { id: "bills", label: "Abrechnungen", icon: Receipt, count: 4 },
  { id: "other", label: "Sonstiges", icon: File, count: 2 },
];

const documents = [
  { id: 1, title: "Mietvertrag", category: "contract", date: "01.04.2023", size: "2,4 MB", icon: FileCheck, color: "primary" as const, important: true },
  { id: 2, title: "Wohnungsübergabeprotokoll", category: "contract", date: "01.04.2023", size: "1,8 MB", icon: Home, color: "mint" as const, important: true },
  { id: 3, title: "Nebenkostenabrechnung 2024", category: "bills", date: "15.01.2025", size: "856 KB", icon: Receipt, color: "amber" as const, important: false },
  { id: 4, title: "Nebenkostenabrechnung 2023", category: "bills", date: "20.01.2024", size: "742 KB", icon: Receipt, color: "amber" as const, important: false },
  { id: 5, title: "Mieterhöhung", category: "other", date: "01.01.2025", size: "320 KB", icon: FileText, color: "coral" as const, important: true },
  { id: 6, title: "Hausratversicherung", category: "other", date: "15.04.2023", size: "1,2 MB", icon: Shield, color: "sky" as const, important: false },
];

export default function Dokumente() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileLayout>
      <PageHeader title="Dokumente" subtitle="Alle Ihre wichtigen Unterlagen" />

      <div className="px-4 -mt-2 space-y-4 pb-4">
        {/* Search */}
        <AnimatedCard delay={0}>
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Dokument suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-0" />
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {documentCategories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <motion.button key={category.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-card border border-border hover:bg-muted"}`}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{category.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-muted"}`}>{category.count}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <EmptyState variant="search" title="Keine Dokumente gefunden" description="Versuchen Sie einen anderen Suchbegriff oder Filter." />
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <AnimatedCard delay={50 + index * 30} accentColor={doc.color}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <IconBadge icon={Icon} variant={doc.color} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{doc.title}</p>
                            {doc.important && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold flex-shrink-0">Wichtig</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{doc.date}</span>
                            <span className="text-xs text-muted-foreground">{doc.size}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Storage Info */}
        <AnimatedCard delay={400} accentColor="mint">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconBadge icon={FolderOpen} variant="mint" size="sm" />
                <div><p className="font-medium text-sm">Speicherplatz</p><p className="text-xs text-muted-foreground">8,2 MB von 100 MB verwendet</p></div>
              </div>
              <div className="w-20 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full w-[8%] bg-mint rounded-full" /></div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
}
