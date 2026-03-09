import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { BookOpen, Clock, ArrowRight, CheckCircle2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LEARNING_PATHS, COURSES } from "@/lib/courses";
import { useCourseProgress } from "@/hooks/useCourseProgress";

export default function LearningPaths() {
  const { getCoursePercent } = useCourseProgress();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lernpfade</h1>
          <p className="text-muted-foreground mt-1">
            Kuratierte Kursreihen, die dich Schritt fuer Schritt zum Ziel fuehren
          </p>
        </div>

        <div className="space-y-6">
          {LEARNING_PATHS.map((path) => {
            const pathCourses = path.courseIds
              .map((id) => COURSES.find((c) => c.id === id))
              .filter(Boolean) as typeof COURSES;

            const totalLessons = pathCourses.reduce(
              (sum, c) => sum + c.lessons.length,
              0
            );

            const completedCourses = pathCourses.filter(
              (c) => getCoursePercent(c.id, c.lessons.length) >= 100
            ).length;

            const overallPercent =
              pathCourses.length > 0
                ? Math.round(
                    pathCourses.reduce(
                      (sum, c) =>
                        sum + getCoursePercent(c.id, c.lessons.length),
                      0
                    ) / pathCourses.length
                  )
                : 0;

            return (
              <Card key={path.id} className="overflow-hidden">
                <div
                  className={`h-2 bg-gradient-to-r ${path.icon}`}
                />
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`h-14 w-14 rounded-xl bg-gradient-to-br ${path.icon} flex items-center justify-center shadow-lg shrink-0`}
                    >
                      <Route className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{path.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {path.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />{" "}
                          {pathCourses.length} Kurse, {totalLessons} Lektionen
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> ca.{" "}
                          {path.estimatedWeeks} Wochen
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold">
                        {overallPercent}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {completedCourses}/{pathCourses.length} fertig
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <Progress value={overallPercent} className="h-2 mb-5" />

                  {/* Course List */}
                  <div className="grid gap-2">
                    {pathCourses.map((course, idx) => {
                      const pct = getCoursePercent(
                        course.id,
                        course.lessons.length
                      );
                      const isDone = pct >= 100;

                      return (
                        <Link
                          key={course.id}
                          to={`/kurse/${course.id}`}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group"
                        >
                          <span className="text-xs font-mono text-muted-foreground w-5 text-center">
                            {idx + 1}
                          </span>
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${course.icon} flex items-center justify-center shrink-0`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                isDone ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.lessons.length} Lektionen &middot;{" "}
                              {course.duration}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {pct > 0 && pct < 100 && (
                              <span className="text-xs text-primary font-medium">
                                {pct}%
                              </span>
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  {overallPercent < 100 && (
                    <div className="mt-4 flex justify-end">
                      <Button asChild size="sm">
                        <Link
                          to={`/kurse/${
                            pathCourses.find(
                              (c) =>
                                getCoursePercent(c.id, c.lessons.length) < 100
                            )?.id || pathCourses[0].id
                          }`}
                        >
                          {overallPercent > 0 ? "Fortsetzen" : "Starten"}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
