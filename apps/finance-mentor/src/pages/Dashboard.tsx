import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/AppLayout";
import { BookOpen, Award, Clock, ArrowRight, Play, Flame, ExternalLink, Route } from "lucide-react";
import { LEVEL_LABELS, LEARNING_PATHS, COURSES as ALL_COURSES } from "@/lib/courses";
import { getUpgradeSuggestions } from "@fintutto/shared";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useCourses } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useCourseProgress";

export default function Dashboard() {
  const { courses } = useCourses();
  const { lessonProgress, getCoursePercent } = useCourseProgress();

  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);
  const completedLessons = lessonProgress.filter((p) => p.progress >= 100).length;

  // Find the course with most recent incomplete progress to suggest "continue"
  const inProgressCourse = courses.find((c) => {
    const pct = getCoursePercent(c.id, c.lessons.length);
    return pct > 0 && pct < 100;
  }) || courses[0];

  const inProgressPercent = inProgressCourse
    ? getCoursePercent(inProgressCourse.id, inProgressCourse.lessons.length)
    : 0;

  const completedCourseCount = courses.filter(
    (c) => getCoursePercent(c.id, c.lessons.length) >= 100
  ).length;

  // Smart recommendations: one per category, prefer free beginner courses first
  const notStartedCourses = courses.filter(
    (c) => getCoursePercent(c.id, c.lessons.length) === 0
  );
  const recommendedCourses = (() => {
    if (notStartedCourses.length === 0) return courses.slice(0, 3);
    // Diversify by category, prefer free beginner courses
    const seenCategories = new Set<string>();
    const sorted = [...notStartedCourses].sort((a, b) => {
      const scoreA = (a.free ? 0 : 1) + (a.level === "anfaenger" ? 0 : a.level === "fortgeschritten" ? 1 : 2);
      const scoreB = (b.free ? 0 : 1) + (b.level === "anfaenger" ? 0 : b.level === "fortgeschritten" ? 1 : 2);
      return scoreA - scoreB;
    });
    const picks: typeof courses = [];
    for (const c of sorted) {
      if (picks.length >= 3) break;
      if (!seenCategories.has(c.category)) {
        picks.push(c);
        seenCategories.add(c.category);
      }
    }
    // Fill remaining slots if fewer than 3 categories available
    if (picks.length < 3) {
      for (const c of sorted) {
        if (picks.length >= 3) break;
        if (!picks.includes(c)) picks.push(c);
      }
    }
    return picks;
  })();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Willkommen zurueck!</h1>
          <p className="text-muted-foreground mt-1">Lerne weiter und baue dein Finanzwissen aus</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Lektionen", value: `${completedLessons}/${totalLessons}`, icon: BookOpen, color: "text-blue-400" },
            { label: "Kurse fertig", value: completedCourseCount.toString(), icon: Award, color: "text-amber-400" },
            { label: "Lernzeit", value: `${Math.round(completedLessons * 0.15 * 10) / 10} Std`, icon: Clock, color: "text-green-400" },
            { label: "Kurse gesamt", value: courses.length.toString(), icon: Flame, color: "text-orange-400" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Learning */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Weitermachen</CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressCourse && (
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${inProgressCourse.icon} flex items-center justify-center shadow-lg shrink-0`}>
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{inProgressCourse.title}</h3>
                  <p className="text-sm text-muted-foreground">{inProgressPercent}% abgeschlossen</p>
                  <Progress value={inProgressPercent} className="mt-2 h-2" />
                </div>
                <Button asChild>
                  <Link to={`/kurse/${inProgressCourse.id}`}>
                    {inProgressPercent > 0 ? "Fortsetzen" : "Starten"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Empfohlene Kurse</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/kurse">Alle Kurse</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedCourses.map((course) => (
              <Link key={course.id} to={`/kurse/${course.id}`}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${course.icon} flex items-center justify-center shadow-lg mb-3`}>
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{LEVEL_LABELS[course.level]}</span>
                      <span>&middot;</span>
                      <span>{course.duration}</span>
                      {course.certificate && (
                        <>
                          <span>&middot;</span>
                          <span className="text-primary flex items-center gap-1">
                            <Award className="h-3 w-3" /> Zertifikat
                          </span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Learning Paths Teaser */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Lernpfade</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lernpfade">Alle Pfade</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {LEARNING_PATHS.slice(0, 2).map((path) => {
              const pathCourses = path.courseIds
                .map((id) => ALL_COURSES.find((c) => c.id === id))
                .filter(Boolean) as typeof ALL_COURSES;
              const overallPercent = pathCourses.length > 0
                ? Math.round(pathCourses.reduce((sum, c) => sum + getCoursePercent(c.id, c.lessons.length), 0) / pathCourses.length)
                : 0;
              return (
                <Link key={path.id} to="/lernpfade">
                  <Card className="h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${path.icon} flex items-center justify-center shadow-lg`}>
                          <Route className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{path.title}</h3>
                          <p className="text-xs text-muted-foreground">{pathCourses.length} Kurse &middot; ca. {path.estimatedWeeks} Wochen</p>
                        </div>
                        <span className="text-sm font-bold">{overallPercent}%</span>
                      </div>
                      <Progress value={overallPercent} className="h-1.5" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cross-App Suggestions */}
        <EcosystemSuggestions />
      </div>
    </AppLayout>
  );
}

function EcosystemSuggestions() {
  const { entitlements } = useEntitlements();
  const userKeys = entitlements.map((e) => e.feature_key);
  const suggestions = getUpgradeSuggestions("finance-mentor", userKeys, 2);

  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fintutto Oekosystem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {suggestions.map((s) => (
            <div key={s.entitlementKey} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <span className="text-2xl">{s.appIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{s.app}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-primary font-medium">{s.price}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                    <a href={s.upgradeUrl} target="_blank" rel="noopener noreferrer">
                      Ansehen <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
