import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Zap, Flame, Droplets, Thermometer } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { meterReadingSchema } from "@/lib/validation";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Confetti from "react-confetti";

interface MeterType {
  value: string;
  label: string;
  icon: LucideIcon;
  unit: string;
  gradient: string;
  bgColor: string;
}

const meterTypes: MeterType[] = [
  { value: "strom", label: "Strom", icon: Zap, unit: "kWh", gradient: "gradient-amber", bgColor: "bg-amber/10" },
  { value: "gas", label: "Gas", icon: Flame, unit: "m³", gradient: "gradient-coral", bgColor: "bg-coral/10" },
  { value: "kaltwasser", label: "Kaltwasser", icon: Droplets, unit: "m³", gradient: "gradient-sky", bgColor: "bg-sky/10" },
  { value: "warmwasser", label: "Warmwasser", icon: Thermometer, unit: "m³", gradient: "gradient-primary", bgColor: "bg-primary/10" },
];

export default function ZaehlerAblesen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ meterType: "", value: "", image: null as File | null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const previousReadings: Record<string, number> = { strom: 12456, gas: 3421, kaltwasser: 156, warmwasser: 89 };
  const selectedMeter = meterTypes.find(m => m.value === formData.meterType);
  const previousValue = formData.meterType ? previousReadings[formData.meterType] : null;
  const consumption = formData.value && previousValue ? parseFloat(formData.value) - previousValue : null;

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
    if (!user) { toast({ variant: "destructive", title: "Fehler", description: "Sie müssen angemeldet sein." }); return; }

    const numericValue = parseFloat(formData.value);
    const validationResult = meterReadingSchema.safeParse({ meter_type: formData.meterType, value: isNaN(numericValue) ? undefined : numericValue, previous_value: previousValue ?? undefined });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => { if (err.path[0]) errors[err.path[0] as string] = err.message; });
      setValidationErrors(errors);
      toast({ variant: "destructive", title: "Validierungsfehler", description: "Bitte überprüfen Sie Ihre Eingaben." });
      return;
    }

    if (consumption !== null && consumption < 0) {
      setValidationErrors({ value: "Der neue Zählerstand kann nicht kleiner sein als der vorherige." });
      toast({ variant: "destructive", title: "Fehler", description: "Der neue Zählerstand kann nicht kleiner sein als der vorherige." });
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (formData.image) {
        try {
          const uploadResult = await uploadImage(formData.image, "meter-images", user.id);
          imageUrl = uploadResult.path;
        } catch (uploadError) {
          if (import.meta.env.DEV) console.error("Image upload error:", uploadError);
          toast({ variant: "destructive", title: "Bild-Upload fehlgeschlagen", description: uploadError instanceof Error ? uploadError.message : "Fehler beim Hochladen des Bildes." });
          setLoading(false);
          return;
        }
      }

      const { error: insertError } = await supabase.from("meter_readings").insert({
        user_id: user.id, meter_type: validationResult.data.meter_type, value: validationResult.data.value,
        previous_value: previousValue, image_url: imageUrl, source: "manual",
      });

      if (insertError) { if (import.meta.env.DEV) console.error("Insert error:", insertError); throw new Error("Fehler beim Speichern."); }

      setShowConfetti(true);
      toast({ title: "🎉 Zählerstand übermittelt!", description: `${selectedMeter?.label}-Zählerstand wurde erfolgreich gespeichert.` });
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Submit error:", error);
      toast({ variant: "destructive", title: "Fehler", description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten." });
    } finally { setLoading(false); }
  };

  return (
    <MobileLayout showNav={false}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <PageHeader title="Zähler ablesen" subtitle="Zählerstand eingeben" backTo="/" />

      <div className="px-4 py-4 space-y-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatedCard delay={0}>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Zählertyp wählen *</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {meterTypes.map((meter) => {
                  const Icon = meter.icon;
                  const isSelected = formData.meterType === meter.value;
                  return (
                    <button key={meter.value} type="button"
                      onClick={() => setFormData({ ...formData, meterType: meter.value, value: "" })}
                      className={cn("relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                        isSelected ? "border-primary scale-105 shadow-lg" : "border-border hover:border-primary/30 hover:shadow-md")}>
                      {isSelected && <div className={cn("absolute inset-0 opacity-10", meter.gradient)} />}
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative z-10 transition-all",
                        isSelected ? meter.gradient : meter.bgColor, isSelected && "animate-bounce-in")}>
                        <Icon className={cn("h-7 w-7", isSelected ? "text-white" : "text-foreground")} />
                      </div>
                      <div className="relative z-10 text-center">
                        <span className={cn("font-semibold block", isSelected ? "text-primary" : "text-foreground")}>{meter.label}</span>
                        <span className="text-xs text-muted-foreground">{meter.unit}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </AnimatedCard>

          {formData.meterType && (
            <AnimatedCard delay={100}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Zählerstand eingeben *</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className={cn("p-4 rounded-xl", selectedMeter?.bgColor)}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vorheriger Stand:</span>
                    <span className="font-bold text-lg">{previousValue?.toLocaleString('de-DE')} {selectedMeter?.unit}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Aktueller Zählerstand ({selectedMeter?.unit})</Label>
                  <Input id="value" type="number" placeholder={`z.B. ${(previousValue || 0) + 100}`}
                    value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className={cn("h-16 text-2xl font-mono text-center tracking-widest transition-all focus:ring-2 focus:ring-primary/20",
                      validationErrors.value || validationErrors.meter_type ? "border-destructive" : "")}
                    min="0" step="0.001" />
                  {(validationErrors.value || validationErrors.meter_type) && <p className="text-sm text-destructive">{validationErrors.value || validationErrors.meter_type}</p>}
                </div>
                {consumption !== null && consumption >= 0 && (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20 animate-scale-in">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-success font-medium">Verbrauch seit letzter Ablesung:</span>
                      <span className="font-bold text-xl text-success animate-bounce-in">{consumption.toLocaleString('de-DE')} {selectedMeter?.unit}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          )}

          <AnimatedCard delay={200}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Foto des Zählers (optional)</CardTitle></CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Zähler Vorschau" className="w-full h-48 object-cover" />
                  <Button type="button" variant="secondary" size="sm" className="absolute top-2 right-2 shadow-lg"
                    onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }); }}>Entfernen</Button>
                </div>
              ) : (
                <Label htmlFor="image" className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors animate-pulse-soft" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Zähler fotografieren</span>
                  <Input id="image" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                </Label>
              )}
            </CardContent>
          </AnimatedCard>

          <Button type="submit" className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/20" size="lg"
            disabled={loading || !formData.meterType || !formData.value}>
            {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Wird gesendet...</>) : "Zählerstand übermitteln"}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
