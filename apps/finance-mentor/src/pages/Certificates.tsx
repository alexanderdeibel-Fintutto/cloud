import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { Award, Download, BookOpen, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Certificate {
  id: string;
  courseTitle: string;
  date: string;
  certificateNumber: string;
  finalScore: number;
}

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchCerts() {
      const { data, error } = await supabase
        .from("learn_certificates")
        .select(`
          id,
          certificate_number,
          final_score,
          issued_at,
          course_id,
          learn_courses!inner(title)
        `)
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });

      if (!error && data) {
        setCertificates(
          data.map((c: any) => ({
            id: c.id,
            courseTitle: c.learn_courses?.title || "Kurs",
            date: new Date(c.issued_at).toLocaleDateString("de-DE", {
              day: "2-digit", month: "long", year: "numeric",
            }),
            certificateNumber: c.certificate_number,
            finalScore: c.final_score,
          }))
        );
      }
      setLoading(false);
    }

    fetchCerts();
  }, [user]);

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
              <Card key={cert.id} className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-1">{cert.courseTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-1">Abgeschlossen am {cert.date}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-1">
                    <Hash className="h-3 w-3" />
                    <span>{cert.certificateNumber}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mb-4">
                    Ergebnis: {cert.finalScore}%
                  </p>
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
