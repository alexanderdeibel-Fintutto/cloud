import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/AppLayout";
import { Search, BookOpenCheck } from "lucide-react";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary";

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");

  const filtered = useMemo(() => {
    return GLOSSARY.filter((entry) => {
      const q = search.toLowerCase();
      const matchSearch =
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q);
      const matchCategory = category === "Alle" || entry.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const entry of filtered) {
      const letter = entry.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(entry);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Finanz-Glossar</h1>
          <p className="text-muted-foreground mt-1">
            {GLOSSARY.length} Begriffe einfach erklaert
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Begriff suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 scrollbar-hide">
            {["Alle", ...GLOSSARY_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Entries */}
        {grouped.map(([letter, entries]) => (
          <div key={letter}>
            <h2 className="text-lg font-bold text-primary mb-3">{letter}</h2>
            <div className="grid gap-3">
              {entries.map((entry) => (
                <Card key={entry.term} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{entry.term}</h3>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {entry.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {entry.definition}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpenCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Kein Begriff gefunden.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
