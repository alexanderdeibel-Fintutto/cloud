import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FintuttoAIChat } from "@fintutto/ai-chat";
import { supabase } from "./lib/supabase";

// Pages
import Dashboard from "./pages/Dashboard";
import Reparaturen from "./pages/Reparaturen";
import Dokumente from "./pages/Dokumente";
import Nebenkosten from "./pages/Nebenkosten";
import Mietrecht from "./pages/Mietrecht";
import Rechner from "./pages/Rechner";
import Profil from "./pages/Profil";
import Preise from "./pages/Preise";

// Layout
import Layout from "./components/Layout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reparaturen" element={<Reparaturen />} />
            <Route path="/dokumente" element={<Dokumente />} />
            <Route path="/nebenkosten" element={<Nebenkosten />} />
            <Route path="/mietrecht" element={<Mietrecht />} />
            <Route path="/rechner" element={<Rechner />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/preise" element={<Preise />} />
          </Routes>
        </Layout>

        {/* KI-Assistent - auf allen Seiten verfuegbar */}
        <FintuttoAIChat
          appId="mieterportal"
          supabaseClient={supabase}
          userTier="free" // TODO: Aus User-Profil laden
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
