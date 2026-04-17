import { createRoot } from "react-dom/client";
import { Component, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

// Global Error Boundary
class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("GlobalErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "white", background: "#1a1a2e", minHeight: "100vh" }}>
          <h1>App-Fehler</h1>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {this.state.error?.message}
            {"\n"}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("Service Worker registration failed:", error);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </GlobalErrorBoundary>
);
