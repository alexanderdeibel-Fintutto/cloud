import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { PlantProvider } from '@/hooks/usePlantContext';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// App Pages
import Dashboard from '@/pages/Dashboard';
import MyPlants from '@/pages/plants/MyPlants';
import PlantCatalog from '@/pages/plants/PlantCatalog';
import PlantCatalogDetail from '@/pages/plants/PlantCatalogDetail';
import PlantDetail from '@/pages/plants/PlantDetail';
import ApartmentsPage from '@/pages/apartments/ApartmentsPage';
import CarePlanPage from '@/pages/care/CarePlanPage';
import CalendarPage from '@/pages/care/CalendarPage';
import VacationPlanPage from '@/pages/vacation/VacationPlanPage';
import ShoppingPage from '@/pages/shopping/ShoppingPage';
import SettingsPage from '@/pages/SettingsPage';
import PlantScannerPage from '@/pages/scanner/PlantScannerPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlantProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* App Routes with Layout */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/plants" element={<MyPlants />} />
                  <Route path="/plants/:plantId" element={<PlantDetail />} />
                  <Route path="/catalog" element={<PlantCatalog />} />
                  <Route path="/catalog/:speciesId" element={<PlantCatalogDetail />} />
                  <Route path="/apartments" element={<ApartmentsPage />} />
                  <Route path="/care" element={<CarePlanPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/vacation" element={<VacationPlanPage />} />
                  <Route path="/shopping" element={<ShoppingPage />} />
                  <Route path="/scanner" element={<PlantScannerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PlantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
