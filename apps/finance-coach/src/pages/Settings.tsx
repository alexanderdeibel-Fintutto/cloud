import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { supabase } from "@/integrations/supabase/client";
import { Crown, ExternalLink, Save, User } from "lucide-react";

// SSOT: Profil-Daten aus der zentralen profiles-Tabelle
interface CoreProfile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export default function Settings() {
  const { user } = useAuth();
  const { entitlements } = useEntitlements();
  const financeEntitlements = entitlements.filter((e) =>
    e.feature_key.startsWith("finance_")
  );

  // SSOT: Profil-State
  const [profile, setProfile] = useState<CoreProfile>({ first_name: "", last_name: "", phone: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // SSOT: Profil laden
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as CoreProfile);
      });
  }, [user?.id]);

  // SSOT: Profil speichern
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setProfileLoading(true);
    await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        phone: profile.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setProfileLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground mt-1">Konto und Praeferenzen verwalten</p>
        </div>

        {/* SSOT: Zentrales Profil – gilt in allen Fintutto-Apps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Mein Profil
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Diese Daten gelten in allen Fintutto-Apps (Single Source of Truth).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vorname</Label>
                <Input
                  value={profile.first_name || ""}
                  onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="Max"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Nachname</Label>
                <Input
                  value={profile.last_name || ""}
                  onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="Mustermann"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+49 123 456789"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input value={user?.email || ""} disabled className="mt-1.5" />
            </div>
            <Button onClick={handleSaveProfile} disabled={profileLoading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {profileSaved ? "Gespeichert ✓" : profileLoading ? "Speichern..." : "Profil speichern"}
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Registriert seit</Label>
              <Input
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString("de-DE") : ""}
                disabled
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Entitlements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Deine Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financeEntitlements.length > 0 ? (
              <div className="space-y-2">
                {financeEntitlements.map((e) => (
                  <div key={e.feature_key} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm font-medium">{e.feature_key.replace("finance_", "").replace(/_/g, " ")}</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {e.source}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-3">
                  Du hast noch kein Premium-Abo. Upgrade fuer KI-Insights, Multi-Bank und mehr.
                </p>
                <Button asChild>
                  <a href="/preise">
                    Preise ansehen
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ecosystem Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fintutto Oekosystem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Dein Konto funktioniert in allen Fintutto-Apps. Entdecke weitere Tools.
            </p>
            <Button variant="outline" asChild>
              <a href="https://portal.fintutto.cloud/apps" target="_blank" rel="noopener noreferrer">
                Alle Apps ansehen
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
