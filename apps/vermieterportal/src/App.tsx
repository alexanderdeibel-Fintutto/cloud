import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FintuttoAIChat } from "@fintutto/ai-chat";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { logActivity } from "./lib/activityLogger";

// Pages
import Dashboard from "./pages/Dashboard";
import Objekte from "./pages/Objekte";
import Mieter from "./pages/Mieter";
import Finanzen from "./pages/Finanzen";
import Betriebskosten from "./pages/Betriebskosten";
import Formulare from "./pages/Formulare";
import Steuern from "./pages/Steuern";
import Einstellungen from "./pages/Einstellungen";

// Layout
import Layout from "./components/Layout";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') logActivity('login')
      if (event === 'SIGNED_OUT') logActivity('logout')
      if (event === 'USER_UPDATED') logActivity('signup')
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/objekte" element={<Objekte />} />
            <Route path="/mieter" element={<Mieter />} />
            <Route path="/finanzen" element={<Finanzen />} />
            <Route path="/betriebskosten" element={<Betriebskosten />} />
            <Route path="/formulare" element={<Formulare />} />
            <Route path="/steuern" element={<Steuern />} />
            <Route path="/einstellungen" element={<Einstellungen />} />
          </Routes>
        </Layout>

        {/* KI-Assistent - auf allen Seiten verfuegbar */}
        <FintuttoAIChat
          appId="vermieterportal"
          supabaseClient={supabase}
          userTier="pro" // TODO: Aus User-Profil laden
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
