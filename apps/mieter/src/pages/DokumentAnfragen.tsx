import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Receipt, Home, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { documentRequestSchema } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";

const documentTypes = [
  { value: "mietbescheinigung", label: "Mietbescheinigung", icon: FileText, description: "Für Behörden & Arbeitgeber" },
  { value: "nebenkostenabrechnung", label: "Nebenkostenabrechnung", icon: Receipt, description: "Letzte Abrechnung" },
  { value: "wohnungsgeberbestaetigung", label: "Wohnungsgeberbestätigung", icon: Home, description: "Für Ummeldung" },
  { value: "mietvertrag", label: "Mietvertragskopie", icon: FileCheck, description: "Kopie des Vertrags" },
];

export default function DokumentAnfragen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    if (!user) { toast({ variant: "destructive", title: "Fehler", description: "Sie müssen angemeldet sein." }); return; }

    const validationResult = documentRequestSchema.safeParse({ document_type: selectedType || undefined, notes: notes || undefined });
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => { if (err.path[0]) errors[err.path[0] as string] = err.message; });
      setValidationErrors(errors);
      toast({ variant: "destructive", title: "Validierungsfehler", description: validationResult.error.errors[0]?.message || "Bitte überprüfen Sie Ihre Eingaben." });
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase.from("documents").insert({
        user_id: user.id,
        title: documentTypes.find(d => d.value === validationResult.data.document_type)?.label || validationResult.data.document_type,
        document_type: validationResult.data.document_type,
        content_json: validationResult.data.notes ? { notes: validationResult.data.notes } : null,
      });
      if (insertError) { if (import.meta.env.DEV) console.error("Insert error:", insertError); throw new Error("Fehler beim Speichern der Anfrage."); }

      toast({ title: "Dokument angefordert", description: `Ihre Anfrage für "${documentTypes.find(d => d.value === selectedType)?.label}" wurde übermittelt.` });
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Submit error:", error);
      toast({ variant: "destructive", title: "Fehler", description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten." });
    } finally { setLoading(false); }
  };

  return (
    <MobileLayout showNav={false}>
      <PageHeader title="Dokument anfragen" subtitle="Wählen Sie das gewünschte Dokument" backTo="/" />

      <div className="px-4 py-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Dokumenttyp wählen *</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {documentTypes.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedType === doc.value;
                return (
                  <Button key={doc.value} type="button" variant={isSelected ? "default" : "outline"} className="w-full h-auto py-3 justify-start"
                    onClick={() => setSelectedType(doc.value)}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{doc.label}</p>
                        <p className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{doc.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Anmerkungen (optional)</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder="Besondere Wünsche oder Hinweise..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500}
                className={validationErrors.notes ? "border-destructive" : ""} />
              <div className="flex justify-between mt-1">
                {validationErrors.notes && <p className="text-sm text-destructive">{validationErrors.notes}</p>}
                <p className="text-xs text-muted-foreground ml-auto">{notes.length}/500</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-info/5 border-info/20">
            <CardContent className="p-4">
              <p className="text-sm text-info">Die Bearbeitung dauert in der Regel 2-3 Werktage. Sie werden per E-Mail benachrichtigt.</p>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading || !selectedType}>
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wird gesendet...</>) : "Dokument anfragen"}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
