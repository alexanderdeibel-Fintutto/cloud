import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Loader2, Building2, ChevronRight, Gauge, Trash2, BarChart3, FileText, Lightbulb, Sun, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CascadeDeleteDialog } from '@/components/ui/cascade-delete-dialog';
import { useBuildings } from '@/hooks/useBuildings';
import { useProfile } from '@/hooks/useProfile';
import { CrossMarketingBanner } from '@/components/dashboard/CrossMarketingBanner';
import { FintuttoSuiteSection } from '@/components/dashboard/FintuttoSuiteSection';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { BuildingWithUnits, getReadingStatus } from '@/types/database';
import { useEnergyContracts } from '@/hooks/useEnergyContracts';
import { QuickReadingWidget } from '@/components/dashboard/QuickReadingWidget';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { buildings, isLoading, deleteBuilding } = useBuildings();
  const { profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  
  const [deleteBuildingData, setDeleteBuildingData] = useState<BuildingWithUnits | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Preload products on app start for pricing page and cross-marketing
  useProducts('zaehler');
  const { upcomingDeadlines } = useEnergyContracts();

  // Compute KPIs from all meters across all buildings
  const kpis = useMemo(() => {
    const allMeters = [
      ...buildings.flatMap(b => b.meters || []),
      ...buildings.flatMap(b => b.units?.flatMap(u => u.meters) || []),
    ];
    const totalMeters = allMeters.length;
    const totalReadings = allMeters.reduce((sum, m) => sum + m.readings.length, 0);

    let overdue = 0;
    let due = 0;
    let ok = 0;
    allMeters.forEach(m => {
      const status = getReadingStatus(m.lastReading?.reading_date);
      if (status === 'overdue') overdue++;
      else if (status === 'due') due++;
      else ok++;
    });

    return { totalMeters, totalReadings, overdue, due, ok };
  }, [buildings]);

  const handleDeleteBuilding = async () => {
    if (!deleteBuildingData) return;
    
    setIsDeleting(true);
    try {
      await deleteBuilding.mutateAsync(deleteBuildingData.id);
      toast({
        title: 'Gebäude gelöscht',
        description: `"${deleteBuildingData.name}" wurde erfolgreich gelöscht.`,
      });
      setDeleteBuildingData(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Das Gebäude konnte nicht gelöscht werden.',
      });
    }
    setIsDeleting(false);
  };

  // Calculate cascade counts for a building
  const getCascadeCounts = (building: BuildingWithUnits) => {
    const meterCount = building.meters?.length || 0;
    const readingCount = (building.meters || []).reduce(
      (sum, m) => sum + m.readings.length,
      0
    );
    return { meterCount, readingCount };
  };

  // Loading state
  if (isLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-primary" />
          </motion.div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </AppLayout>
    );
  }

  // No organization yet - show empty state with prompt to create first building
  // Organization will be auto-created when user creates first building
  if (!profile?.organization_id) {
    return (
      <AppLayout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent/50 mx-auto mb-5 flex items-center justify-center shadow-soft"
          >
            <Plus className="w-10 h-10 text-muted-foreground" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Willkommen! 👋</h2>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Starten Sie mit der Einrichtung Ihres ersten Gebäudes.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => navigate('/buildings/new')}
              className="gradient-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Erstes Gebäude anlegen
            </Button>
          </motion.div>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Cross-Marketing Banner */}
      <CrossMarketingBanner className="mb-4" />

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6"
      >
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 rounded-2xl shadow-glow text-base"
            onClick={() => navigate('/read')}
          >
            <Camera className="w-5 h-5 mr-2" />
            Zähler ablesen
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline"
            onClick={() => navigate('/buildings/new')}
            className="h-full aspect-square rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-accent/50"
          >
            <Plus className="w-6 h-6 text-primary" />
          </Button>
        </motion.div>
      </motion.div>

      {/* KPI Row */}
      {kpis.totalMeters > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{kpis.totalMeters}</p>
              <p className="text-xs text-muted-foreground">Zähler</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{kpis.totalReadings}</p>
              <p className="text-xs text-muted-foreground">Ablesungen</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-3 text-center">
              {kpis.overdue > 0 ? (
                <>
                  <p className="text-2xl font-bold text-destructive">{kpis.overdue}</p>
                  <p className="text-xs text-destructive">Überfällig</p>
                </>
              ) : kpis.due > 0 ? (
                <>
                  <p className="text-2xl font-bold text-amber-500">{kpis.due}</p>
                  <p className="text-xs text-amber-500">Fällig</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-xs text-green-600">Alles aktuell</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* A.7: Quick Reading Widget for due/overdue meters */}
      {kpis.totalMeters > 0 && <QuickReadingWidget />}

      {/* Contract Deadline Alert */}
      {upcomingDeadlines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className="border-amber-500/30 bg-amber-500/5 border">
            <CardContent className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/contracts')}>
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {upcomingDeadlines.length} Wechseltermin{upcomingDeadlines.length > 1 ? 'e' : ''} bald fällig
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {upcomingDeadlines[0].providerName} – {upcomingDeadlines[0].daysUntilDeadline} Tage
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Feature Quick-Links */}
      {kpis.totalMeters > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-2 mb-6"
        >
          {[
            { href: '/analysis', icon: BarChart3, label: 'Analyse', color: 'text-blue-500' },
            { href: '/contracts', icon: FileText, label: 'Verträge', color: 'text-purple-500' },
            { href: '/savings', icon: Lightbulb, label: 'Sparen', color: 'text-amber-500' },
            { href: '/solar', icon: Sun, label: 'Solar', color: 'text-yellow-500' },
          ].map(({ href, icon: Icon, label, color }) => (
            <motion.div key={href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                className="glass-card border-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(href)}
              >
                <CardContent className="p-3 flex flex-col items-center gap-1">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Buildings Overview */}
      <AnimatePresence mode="wait">
        {buildings.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent/50 mx-auto mb-5 flex items-center justify-center shadow-soft"
            >
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">Keine Gebäude</h2>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              Legen Sie Ihr erstes Gebäude an, um Einheiten und Zähler zu verwalten.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => navigate('/buildings/new')}
                className="gradient-primary text-primary-foreground font-semibold px-6 rounded-xl shadow-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gebäude anlegen
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Section: Buildings */}
            <motion.div variants={itemVariants} className="mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Meine Gebäude ({buildings.length})
              </h2>
            </motion.div>

            {buildings.map((building, index) => (
              <motion.div
                key={building.id}
                variants={itemVariants}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card border-0 overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/buildings/${building.id}`)}
                      >
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{building.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {building.address && `${building.address}, `}{building.city || 'Keine Adresse'}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Gauge className="w-3 h-3" />
                              {(building.meters?.length || 0) + (building.units?.reduce((sum, u) => sum + (u.meters?.length || 0), 0) || 0)} Zähler
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteBuildingData(building);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

          {/* Fintutto Suite Promo */}
          <FintuttoSuiteSection />

          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Building Confirmation */}
      {deleteBuildingData && (
        <CascadeDeleteDialog
          open={!!deleteBuildingData}
          onOpenChange={(open) => !open && setDeleteBuildingData(null)}
          onConfirm={handleDeleteBuilding}
          title={`"${deleteBuildingData.name}" löschen?`}
          description="Diese Aktion kann nicht rückgängig gemacht werden."
          isDeleting={isDeleting}
          cascadeItems={(() => {
            const counts = getCascadeCounts(deleteBuildingData);
            return [
              { label: 'Zähler', count: counts.meterCount },
              { label: 'Ablesung(en)', count: counts.readingCount },
            ];
          })()}
        />
      )}
    </AppLayout>
  );
}
