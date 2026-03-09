import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Crown, ExternalLink, Sun, Moon } from "lucide-react";

function useThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("fintutto-theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return { isDark, toggle };
}

export default function Settings() {
  const { user } = useAuth();
  const { entitlements } = useEntitlements();
  const { isDark, toggle: toggleTheme } = useThemeToggle();

  const learnEntitlements = entitlements.filter((e) =>
    e.feature_key.startsWith("learn_")
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>E-Mail</Label>
              <Input value={user?.email || ""} disabled className="mt-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Dein Abo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learnEntitlements.length > 0 ? (
              <div className="space-y-2">
                {learnEntitlements.map((e) => (
                  <div key={e.feature_key} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm font-medium">{e.feature_key.replace("learn_", "").replace(/_/g, " ")}</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{e.source}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-3">
                  Free-Tier aktiv. Upgrade fuer alle Kurse und Zertifikate.
                </p>
                <Button asChild>
                  <a href="/preise">Preise ansehen</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Darstellung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Farbschema</p>
                <p className="text-xs text-muted-foreground">
                  {isDark ? "Dunkler Modus aktiv" : "Heller Modus aktiv"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDark ? "Hell" : "Dunkel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fintutto Oekosystem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Dein Konto funktioniert in allen Fintutto-Apps.
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
