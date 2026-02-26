import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "@/hooks/useBusiness";
import { Briefcase, Loader2, ArrowRight } from "lucide-react";

const BUSINESS_TYPES = [
  { id: "freelancer", label: "Freelancer", description: "Selbststaendig taetig" },
  { id: "einzelunternehmen", label: "Einzelunternehmen", description: "Gewerbetreibend" },
  { id: "gbr", label: "GbR", description: "Gesellschaft buergerlichen Rechts" },
  { id: "ug", label: "UG (haftungsbeschraenkt)", description: "Mini-GmbH" },
  { id: "gmbh", label: "GmbH", description: "Gesellschaft mit beschraenkter Haftung" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { business, createBusiness } = useBusiness();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [taxId, setTaxId] = useState("");
  const [vatId, setVatId] = useState("");
  const [saving, setSaving] = useState(false);

  // If business already exists, redirect to dashboard
  if (business) {
    navigate("/dashboard");
    return null;
  }

  const handleCreate = async () => {
    if (!name || !businessType) return;

    setSaving(true);
    const result = await createBusiness(name, businessType, taxId || undefined, vatId || undefined);
    setSaving(false);

    if (result) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Fintutto Biz</h1>
              <p className="text-sm text-muted-foreground">Richten Sie Ihr Geschaeft ein</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Geschaeftsinformationen</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Wie heisst Ihr Geschaeft und welche Rechtsform haben Sie?
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Geschaeftsname *</label>
                  <input
                    type="text"
                    placeholder="z.B. Max Mustermann Design"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Rechtsform *</label>
                  <div className="grid gap-2">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setBusinessType(type.id)}
                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                          businessType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                        {businessType === type.id && (
                          <div className="h-4 w-4 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!name || !businessType}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Weiter
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Steuerdaten (optional)</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sie koennen dies auch spaeter in den Einstellungen ergaenzen.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Steuernummer</label>
                  <input
                    type="text"
                    placeholder="z.B. 12/345/67890"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">USt-IdNr.</label>
                  <input
                    type="text"
                    placeholder="z.B. DE123456789"
                    value={vatId}
                    onChange={(e) => setVatId(e.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Zurueck
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Geschaeft erstellen"
                    )}
                  </button>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="w-full text-sm text-muted-foreground hover:text-white text-center"
                >
                  Ueberspringen und spaeter ergaenzen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
