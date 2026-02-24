import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Building2, ChevronRight, Loader2, Trash2, Home, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CascadeDeleteDialog } from '@/components/ui/cascade-delete-dialog';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { UnitWithMeters, Building } from '@/types/database';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function Units() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildingId = searchParams.get('building');
  const { buildings, isLoading, deleteUnit } = useBuildings();
  const [deleteUnitData, setDeleteUnitData] = useState<(UnitWithMeters & { building?: Building }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Find the selected building
  const selectedBuilding = buildingId 
    ? buildings.find(b => b.id === buildingId) 
    : null;

  // Get units - filtered by building if specified, otherwise all units
  const allUnits = useMemo(() => {
    if (buildingId && selectedBuilding) {
      return selectedBuilding.units.map(u => ({ ...u, building: selectedBuilding }));
    }
    return buildings.flatMap(b => 
      b.units.map(u => ({ ...u, building: b }))
    );
  }, [buildings, buildingId, selectedBuilding]);

  const handleDelete = async () => {
    if (!deleteUnitData) return;
    
    setIsDeleting(true);
    try {
      await deleteUnit.mutateAsync(deleteUnitData.id);
      toast({
        title: 'Einheit gelöscht',
        description: `"${deleteUnitData.unit_number}" wurde erfolgreich gelöscht.`,
      });
      setDeleteUnitData(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Einheit konnte nicht gelöscht werden.',
      });
    }
    setIsDeleting(false);
  };

  // Calculate cascade counts for a unit
  const getCascadeCounts = (unit: UnitWithMeters) => {
    const meterCount = unit.meters.length;
    const readingCount = unit.meters.reduce((sum, m) => sum + m.readings.length, 0);
    return { meterCount, readingCount };
  };

  const pageTitle = selectedBuilding ? selectedBuilding.name : "Einheiten";

  return (
    <AppLayout title={pageTitle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button when viewing a specific building */}
        {selectedBuilding && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </motion.div>
        )}

        {/* Building info when filtering */}
        {selectedBuilding && (
          <Card className="glass-card border-0 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">{selectedBuilding.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedBuilding.address && `${selectedBuilding.address}, `}{selectedBuilding.city || 'Keine Adresse'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full mb-6 gradient-primary text-primary-foreground font-semibold py-6 rounded-2xl shadow-glow text-base"
            onClick={() => selectedBuilding 
              ? navigate(`/units/new?building=${selectedBuilding.id}`) 
              : navigate('/buildings/new')
            }
          >
            <Plus className="w-5 h-5 mr-2" />
            {selectedBuilding ? 'Neue Einheit anlegen' : 'Neues Gebäude anlegen'}
          </Button>
        </motion.div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-primary" />
          </motion.div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </motion.div>
      ) : allUnits.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent/50 mx-auto mb-5 flex items-center justify-center shadow-soft"
          >
            <Home className="w-10 h-10 text-muted-foreground" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Keine Einheiten</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {selectedBuilding 
              ? `Legen Sie die erste Einheit für "${selectedBuilding.name}" an.`
              : 'Legen Sie zuerst ein Gebäude an, um Einheiten zu verwalten.'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {allUnits.map((unit, index) => (
              <motion.div
                key={unit.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="overflow-hidden glass-card border-0 card-elevated">
                  <CardContent className="p-0">
                    <div className="flex items-center">
                      <Link 
                        to={`/units/${unit.id}`}
                        className="flex items-center gap-4 flex-1 p-4 group"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                        >
                          <Building2 className="w-6 h-6 text-primary" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {unit.unit_number}
                          </p>
                          {unit.building && (
                            <p className="text-sm text-muted-foreground truncate">
                              {unit.building.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                              {unit.meters.length} Zähler
                            </span>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-muted-foreground group-hover:text-primary transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                      </Link>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mr-2 rounded-xl"
                          onClick={() => setDeleteUnitData(unit)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Unit Confirmation */}
      {deleteUnitData && (
        <CascadeDeleteDialog
          open={!!deleteUnitData}
          onOpenChange={(open) => !open && setDeleteUnitData(null)}
          onConfirm={handleDelete}
          title={`"${deleteUnitData.unit_number}" löschen?`}
          description="Diese Aktion kann nicht rückgängig gemacht werden."
          isDeleting={isDeleting}
          cascadeItems={(() => {
            const counts = getCascadeCounts(deleteUnitData);
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
