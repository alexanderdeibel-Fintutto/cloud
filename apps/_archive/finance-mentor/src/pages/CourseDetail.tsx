import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import {
  BookOpen, Award, Clock, Lock, Play, CheckCircle2,
  ArrowLeft, Users
} from "lucide-react";
import { LEVEL_LABELS } from "@/lib/courses";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useCourses } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { Progress } from "@/components/ui/progress";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { hasFeature } = useEntitlements();
  const { courses } = useCourses();
  const course = courses.find((c) => c.id === courseId);
  const { isLessonComplete, markLessonComplete, getCoursePercent } = useCourseProgress(courseId);

  const hasPremium = hasFeature("learn_premium_courses");

  if (!course) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Kurs nicht gefunden.</p>
          <Button variant="link" asChild className="mt-2">
            <Link to="/kurse">Zurueck zum Katalog</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const freeLessons = course.lessons.filter((l) => l.free);
  const premiumLessons = course.lessons.filter((l) => !l.free);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/kurse">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Alle Kurse
          </Link>
        </Button>

        {/* Course Header */}
        <div className="flex items-start gap-5">
          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${course.icon} flex items-center justify-center shadow-lg shrink-0`}>
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-1">{course.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
              <span>{course.lessons.length} Lektionen</span>
              <span className="capitalize">{LEVEL_LABELS[course.level]}</span>
              {course.certificate && (
                <span className="flex items-center gap-1 text-primary">
                  <Award className="h-4 w-4" /> Zertifikat
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {course.lessons.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Kurs-Fortschritt</span>
                <span className="text-sm text-muted-foreground">{getCoursePercent(course.id, course.lessons.length)}%</span>
              </div>
              <Progress value={getCoursePercent(course.id, course.lessons.length)} />
            </CardContent>
          </Card>
        )}

        {/* Free Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kostenlose Lektionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {freeLessons.map((lesson, idx) => {
              const done = isLessonComplete(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => !done && markLessonComplete(course.id, lesson.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-accent transition-colors text-left"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    done ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                  {done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Premium Lessons */}
        {premiumLessons.length > 0 && (
          <Card className={!hasPremium && !course.free ? "border-primary/30" : ""}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Premium Lektionen
                {!hasPremium && <Lock className="h-4 w-4 text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {premiumLessons.map((lesson, idx) => {
                const canAccess = hasPremium || course.free;
                const done = isLessonComplete(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    disabled={!canAccess}
                    onClick={() => canAccess && !done && markLessonComplete(course.id, lesson.id)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-left ${
                      canAccess ? "hover:bg-accent cursor-pointer" : "opacity-60"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : freeLessons.length + idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                    </div>
                    {!canAccess
                      ? <Lock className="h-4 w-4 text-muted-foreground" />
                      : done
                        ? <CheckCircle2 className="h-4 w-4 text-primary" />
                        : <Play className="h-4 w-4 text-primary" />
                    }
                  </button>
                );
              })}

              {!hasPremium && !course.free && (
                <div className="mt-4 p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-sm mb-3">
                    Schalte alle Lektionen und das Zertifikat frei mit Premium.
                  </p>
                  <Button asChild>
                    <Link to="/preise">Premium starten</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
