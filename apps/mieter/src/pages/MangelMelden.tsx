import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Droplet, Zap, Flame, Wind, DoorOpen, AlertTriangle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { issueSchema } from "@/lib/validation";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CategoryItem {
  value: string;
  label: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "mint" | "coral" | "sky" | "amber" | "warning" | "info";
}

const categories: CategoryItem[] = [
  { value: "sanitaer", label: "Sanitär", icon: Droplet, color: "sky" },
  { value: "elektrik", label: "Elektrik", icon: Zap, color: "amber" },
  { value: "heizung", label: "Heizung", icon: Flame, color: "coral" },
  { value: "fenster_tueren", label: "Fenster & Türen", icon: DoorOpen, color: "mint" },
  { value: "wasserschaden", label: "Wasserschaden", icon: AlertTriangle, color: "info" },
  { value: "schimmel", label: "Schimmel", icon: Wind, color: "secondary" },
  { value: "sonstiges", label: "Sonstiges", icon: HelpCircle, color: "primary" },
];

const priorities = [
  { value: "niedrig", label: "Niedrig", color: "bg-success" },
  { value: "mittel", label: "Mittel", color: "bg-warning" },
  { value: "hoch", label: "Hoch", color: "bg-coral" },
  { value: "notfall", label: "Notfall", color: "bg-destructive animate-pulse" },
];

export default function MangelMelden() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    priority: "mittel",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!user) {
      toast({ variant: "destructive", title: "Fehler", description: "Sie müssen angemeldet sein, um einen Mangel zu melden." });
      return;
    }

    const validationResult = issueSchema.safeParse({
      category: formData.category,
      description: formData.description,
      priority: formData.priority,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setValidationErrors(errors);
      toast({ variant: "destructive", title: "Validierungsfehler", description: "Bitte überprüfen Sie Ihre Eingaben." });
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (formData.image) {
        try {
          const uploadResult = await uploadImage(formData.image, "issue-images", user.id);
          imageUrl = uploadResult.path;
        } catch (uploadError) {
          if (import.meta.env.DEV) console.error("Image upload error:", uploadError);
          toast({ variant: "destructive", title: "Bild-Upload fehlgeschlagen", description: uploadError instanceof Error ? uploadError.message : "Fehler beim Hochladen des Bildes." });
          setLoading(false);
          return;
        }
      }

      const { error: insertError } = await supabase.from("issues").insert({
        user_id: user.id,
        category: validationResult.data.category,
        description: validationResult.data.description,
        priority: validationResult.data.priority,
        image_url: imageUrl,
        status: "offen",
      });

      if (insertError) {
        if (import.meta.env.DEV) console.error("Insert error:", insertError);
        throw new Error("Fehler beim Speichern des Mangels.");
      }

      toast({ title: "Mangel gemeldet", description: "Ihre Meldung wurde erfolgreich übermittelt." });
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Submit error:", error);
      toast({ variant: "destructive", title: "Fehler", description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showNav={false}>
      <PageHeader title="Mangel melden" subtitle="Beschreiben Sie das Problem" backTo="/" />

      <div className="px-4 py-4 space-y-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <AnimatedCard delay={0}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Kategorie wählen *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                        isSelected ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/30 hover:bg-muted/50"
                      )}
                    >
                      <IconBadge icon={Icon} variant={cat.color} size="md" pulse={isSelected} />
                      <span className={cn("text-xs font-medium text-center leading-tight", isSelected ? "text-primary" : "text-muted-foreground")}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {validationErrors.category && <p className="text-sm text-destructive mt-2">{validationErrors.category}</p>}
            </CardContent>
          </AnimatedCard>

          {/* Description */}
          <AnimatedCard delay={100}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Beschreibung *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Beschreiben Sie den Mangel detailliert (mind. 10 Zeichen)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={cn("resize-none transition-all focus:ring-2 focus:ring-primary/20", validationErrors.description && "border-destructive")}
                maxLength={2000}
              />
              <div className="flex justify-between mt-2">
                {validationErrors.description && <p className="text-sm text-destructive">{validationErrors.description}</p>}
                <p className="text-xs text-muted-foreground ml-auto">{formData.description.length}/2000</p>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Priority */}
          <AnimatedCard delay={200}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dringlichkeit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map((p) => {
                  const isSelected = formData.priority === p.value;
                  return (
                    <Button
                      key={p.value}
                      type="button"
                      variant="outline"
                      className={cn("h-auto py-3 flex flex-col gap-1.5 transition-all", isSelected && "ring-2 ring-primary ring-offset-2")}
                      onClick={() => setFormData({ ...formData, priority: p.value })}
                    >
                      <span className={cn("w-4 h-4 rounded-full", p.color)} />
                      <span className="text-xs">{p.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Photo Upload */}
          <AnimatedCard delay={300}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Foto (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Vorschau" className="w-full h-48 object-cover" />
                  <Button type="button" variant="secondary" size="sm" className="absolute top-2 right-2 shadow-lg"
                    onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }); }}>
                    Entfernen
                  </Button>
                </div>
              ) : (
                <Label htmlFor="image" className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors animate-pulse-soft" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Foto aufnehmen oder hochladen</span>
                  <Input id="image" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                </Label>
              )}
            </CardContent>
          </AnimatedCard>

          <Button type="submit" className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/20" size="lg" disabled={loading}>
            {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Wird gesendet...</>) : "Mangel melden"}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
