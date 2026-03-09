import { useState, useEffect } from "react";
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

  const financeEntitlements = entitlements.filter((e) =>
    e.feature_key.startsWith("finance_")
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground mt-1">Konto und Praeferenzen verwalten</p>
        </div>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>E-Mail</Label>
              <Input value={user?.email || ""} disabled className="mt-1.5" />
            </div>
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
