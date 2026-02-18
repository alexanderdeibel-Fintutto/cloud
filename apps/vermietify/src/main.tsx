import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { AppConfigProvider } from "@fintutto/core";
import App from "./App.tsx";
import { vermietifyConfig } from "./app-config";
// Supabase-Import initialisiert auch den Shared Client
import "@/integrations/supabase/client";
import "./i18n";
import "./index.css";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("Service Worker registration failed:", error);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AppConfigProvider config={vermietifyConfig}>
      <App />
    </AppConfigProvider>
  </ThemeProvider>
);
