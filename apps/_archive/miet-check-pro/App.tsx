import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import GlobalAIChatButton from "@/components/ai/GlobalAIChatButton";
import MietpreisbremseCheck from "./pages/MietpreisbremseCheck";
import Berechnungen from "./pages/Berechnungen";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MietpreisbremseCheck />} />
              <Route path="/mietpreisbremse" element={<MietpreisbremseCheck />} />
              <Route path="/berechnungen" element={<Berechnungen />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/success" element={<Success />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalAIChatButton />
          </BrowserRouter>
        </TooltipProvider>
      </ProductsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
