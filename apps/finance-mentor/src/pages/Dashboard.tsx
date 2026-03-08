import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/AppLayout";
import { BookOpen, Award, Clock, ArrowRight, Play, Flame } from "lucide-react";
import { COURSES, LEVEL_LABELS } from "@/lib/courses";

export default function Dashboard() {
  // Mock user progress
  const completedLessons = 8;
  const totalLessons = COURSES.reduce((sum, c) => sum + c.lessons.length, 0);
  const streak = 5;
  const certificates = 0;

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
            { label: "Abgeschlossen", value: `${completedLessons}/${totalLessons}`, icon: BookOpen, color: "text-blue-400" },
            { label: "Zertifikate", value: certificates.toString(), icon: Award, color: "text-amber-400" },
            { label: "Lernzeit", value: "3,5 Std", icon: Clock, color: "text-green-400" },
            { label: "Streak", value: `${streak} Tage`, icon: Flame, color: "text-orange-400" },
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
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${COURSES[0].icon} flex items-center justify-center shadow-lg shrink-0`}>
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{COURSES[0].title}</h3>
                <p className="text-sm text-muted-foreground">Lektion 3 von {COURSES[0].lessons.length}</p>
                <Progress value={37} className="mt-2 h-2" />
              </div>
              <Button asChild>
                <Link to={`/kurse/${COURSES[0].id}`}>
                  Fortsetzen
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
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
            {COURSES.slice(0, 3).map((course) => (
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
      </div>
    </AppLayout>
  );
}
