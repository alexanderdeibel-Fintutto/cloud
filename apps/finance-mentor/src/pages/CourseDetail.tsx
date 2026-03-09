import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import {
  BookOpen, Award, Clock, Lock, Play, CheckCircle2,
  ArrowLeft, Users, ChevronDown, ChevronUp, Lightbulb, Target
} from "lucide-react";
import { LEVEL_LABELS } from "@/lib/courses";
import { LESSON_CONTENT } from "@/lib/lesson-content";
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
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

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

  const toggleLesson = (lessonId: string) => {
    setOpenLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

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
              const contentKey = `${courseId}::${lesson.id}`;
              const content = LESSON_CONTENT[contentKey];
              const isOpen = openLessonId === lesson.id;

              return (
                <div key={lesson.id} className="rounded-xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => content ? toggleLesson(lesson.id) : (!done && markLessonComplete(course.id, lesson.id))}
                    className="w-full flex items-center gap-4 p-3 hover:bg-accent transition-colors text-left"
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
                    {content
                      ? (isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-primary" />)
                      : (done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />)
                    }
                  </button>

                  {/* Lesson Content Panel */}
                  {content && isOpen && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30 bg-muted/20">
                      <p className="text-sm text-muted-foreground mt-4 italic">{content.summary}</p>

                      {content.sections.map((section, i) => (
                        <div key={i}>
                          <h4 className="font-semibold text-sm mb-1">{section.heading}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
                        </div>
                      ))}

                      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-primary mb-0.5">Kernaussage</p>
                          <p className="text-sm">{content.keyTakeaway}</p>
                        </div>
                      </div>

                      {content.exercise && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50">
                          <Target className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-400 mb-0.5">Uebung</p>
                            <p className="text-sm text-muted-foreground">{content.exercise}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          variant={done ? "outline" : "default"}
                          onClick={() => {
                            if (!done) markLessonComplete(course.id, lesson.id);
                            setOpenLessonId(null);
                          }}
                        >
                          {done ? "Bereits abgeschlossen" : "Lektion abschliessen"}
                          {!done && <CheckCircle2 className="h-4 w-4 ml-1" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
