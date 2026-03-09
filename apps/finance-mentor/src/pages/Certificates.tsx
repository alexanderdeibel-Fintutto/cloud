import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { Award, Download, BookOpen, Hash, Loader2 } from "lucide-react";
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

function generateCertPDF(cert: Certificate, userName: string) {
  const width = 842;
  const height = 595;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0f172a"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#6366f1" stroke-width="2" rx="12"/>
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="#6366f1" stroke-width="0.5" stroke-dasharray="6 4" rx="8"/>

  <text x="${width / 2}" y="100" text-anchor="middle" fill="#6366f1" font-family="serif" font-size="14" letter-spacing="6">FINTUTTO FINANCE MENTOR</text>
  <text x="${width / 2}" y="160" text-anchor="middle" fill="#e2e8f0" font-family="serif" font-size="40" font-weight="bold">ZERTIFIKAT</text>

  <text x="${width / 2}" y="220" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">Hiermit wird bescheinigt, dass</text>
  <text x="${width / 2}" y="265" text-anchor="middle" fill="#e2e8f0" font-family="serif" font-size="28" font-weight="bold">${escapeXml(userName)}</text>
  <line x1="250" y1="280" x2="592" y2="280" stroke="#6366f1" stroke-width="1"/>

  <text x="${width / 2}" y="320" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">den Kurs erfolgreich abgeschlossen hat:</text>
  <text x="${width / 2}" y="360" text-anchor="middle" fill="#a78bfa" font-family="serif" font-size="22" font-style="italic">&quot;${escapeXml(cert.courseTitle)}&quot;</text>

  <text x="${width / 2}" y="410" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">Ergebnis: ${cert.finalScore}%  |  Datum: ${cert.date}</text>

  <text x="${width / 2}" y="490" text-anchor="middle" fill="#475569" font-family="monospace" font-size="11">Zertifikat-Nr: ${escapeXml(cert.certificateNumber)}</text>

  <text x="${width / 2}" y="545" text-anchor="middle" fill="#334155" font-family="sans-serif" font-size="10">portal.fintutto.cloud  |  Verifizierbar unter fintutto.cloud/verify</text>
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Zertifikat_${cert.certificateNumber}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateCertPDF(cert, user?.email || "Teilnehmer/in")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Zertifikat herunterladen
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
