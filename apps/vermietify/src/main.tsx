import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
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

const rootEl = document.getElementById("root")!;

try {
  createRoot(rootEl).render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  );
} catch (err: unknown) {
  // Zeige den echten Fehler im DOM an (temporär für Diagnose)
  const msg = err instanceof Error ? `${err.name}: ${err.message}\n\n${err.stack}` : String(err);
  console.error("RENDER_ERROR:", msg);
  rootEl.innerHTML = `<pre style="color:red;padding:20px;background:#111;font-size:12px;white-space:pre-wrap;word-break:break-all;">${msg}</pre>`;
}
