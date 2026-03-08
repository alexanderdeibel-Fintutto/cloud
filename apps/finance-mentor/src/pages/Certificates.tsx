import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { Award, Download, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Certificates() {
  // Mock: no certificates yet
  const certificates: { id: string; courseTitle: string; date: string }[] = [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Zertifikate</h1>
          <p className="text-muted-foreground mt-1">Deine abgeschlossenen Kurse und Zertifikate</p>
        </div>

        {certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-1">{cert.courseTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Abgeschlossen am {cert.date}</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PDF herunterladen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Noch keine Zertifikate</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Schliesse einen Premium-Kurs ab, um dein erstes Zertifikat zu erhalten.
              </p>
              <Button asChild>
                <Link to="/kurse">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Kurse entdecken
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
