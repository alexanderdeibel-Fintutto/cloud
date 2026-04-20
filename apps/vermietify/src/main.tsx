import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import React from "react";
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

// Temporärer Error Boundary zur Fehlerdiagnose
class DiagnosticErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("DIAGNOSTIC_ERROR:", error.message, error.stack, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return React.createElement(
        "pre",
        {
          style: {
            color: "red",
            padding: "20px",
            background: "#111",
            fontSize: "12px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          },
        },
        `RENDER ERROR:\n${this.state.error.name}: ${this.state.error.message}\n\n${this.state.error.stack}`
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <DiagnosticErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </DiagnosticErrorBoundary>
);
