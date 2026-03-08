import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { BookOpen, Award, Clock, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LEVEL_LABELS } from "@/lib/courses";
import { useCourses } from "@/hooks/useCourses";

export default function Courses() {
  const { courses, loading } = useCourses();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");

  const categories = useMemo(
    () => ["Alle", ...new Set(courses.map((c) => c.category))],
    [courses]
  );

  const filtered = courses.filter((course) => {
    const matchSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Alle" || course.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kurskatalog</h1>
          <p className="text-muted-foreground mt-1">{courses.length} Kurse zu Finanzen, Steuern und Investieren</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kurs suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link key={course.id} to={`/kurse/${course.id}`}>
              <Card className="h-full hover:border-primary/30 transition-all group">
                <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${course.icon}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${course.icon} flex items-center justify-center shadow-lg`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    {!course.free && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Premium
                      </span>
                    )}
                    {course.free && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                        Kostenlos
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {course.duration}
                    </span>
                    <span>{course.lessons.length} Lektionen</span>
                    <span className="capitalize">{LEVEL_LABELS[course.level]}</span>
                  </div>

                  {course.certificate && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Award className="h-3.5 w-3.5" /> Zertifikat nach Abschluss
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Keine Kurse gefunden.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
