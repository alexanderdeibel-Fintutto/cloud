import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Building2, Trash2, Gauge, ChevronRight, AlertCircle, Home, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CascadeDeleteDialog } from '@/components/ui/cascade-delete-dialog';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { ReadingStatusBadge } from '@/components/meters/ReadingStatusBadge';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { MeterWithReadings, METER_TYPE_LABELS, METER_TYPE_UNITS, UnitWithMeters } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { AddMeterDialog } from '@/components/meters/AddMeterDialog';

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

// Reusable meter card component
function MeterCard({ meter, index, badge, onNavigate, onDelete }: {
  meter: MeterWithReadings;
  index: number;
  badge: React.ReactNode;
  onNavigate: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      key={meter.id}
      variants={itemVariants}
      layout
      exit={{ opacity: 0, scale: 0.9, x: -100 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="overflow-hidden glass-card border-0 card-elevated">
        <CardContent className="p-0">
          <div className="flex items-center">
            <div 
              className="flex items-center gap-4 flex-1 p-4 group cursor-pointer"
              onClick={onNavigate}
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
              >
                <MeterIcon type={meter.meter_type} className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {METER_TYPE_LABELS[meter.meter_type]}
                  </p>
                  {badge}
                  {meter.replaced_by && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted-foreground/30">
                      <Link2 className="w-3 h-3 mr-1" />Verkettet
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  Nr. {meter.meter_number}
                </p>
                {meter.lastReading && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                      {meter.lastReading.reading_value.toLocaleString('de-DE')} {METER_TYPE_UNITS[meter.meter_type]}
                    </span>
                  </div>
                )}
              </div>
              <motion.div
                whileHover={{ x: 5 }}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mr-2 rounded-xl"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function BuildingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buildings, isLoading, deleteMeter } = useBuildings();
  const { toast } = useToast();
  
  const [deleteMeterData, setDeleteMeterData] = useState<MeterWithReadings | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddMeter, setShowAddMeter] = useState(false);

  const building = buildings.find(b => b.id === id);
  const buildingMeters = building?.meters || [];
  const unitMeters: Array<MeterWithReadings & { unitName: string; unitId: string }> = (building?.units || []).flatMap(
    unit => unit.meters.map(m => ({ ...m, unitName: unit.unit_number, unitId: unit.id }))
  );
  const allMetersCount = buildingMeters.length + unitMeters.length;

  const handleDeleteMeter = async () => {
    if (!deleteMeterData) return;
    
    setIsDeleting(true);
    try {
      await deleteMeter.mutateAsync(deleteMeterData.id);
      toast({
        title: 'Zähler gelöscht',
        description: `Zähler "${deleteMeterData.meter_number}" wurde erfolgreich gelöscht.`,
      });
      setDeleteMeterData(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Zähler konnte nicht gelöscht werden.',
      });
    }
    setIsDeleting(false);
  };

  if (isLoading) {
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

  if (!building) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Gebäude nicht gefunden</h2>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Zurück zur Übersicht
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={building.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
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

        {/* Building info */}
        <Card className="glass-card border-0 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">{building.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {building.address && `${building.address}, `}{building.city || 'Keine Adresse'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add meter button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full mb-6 gradient-primary text-primary-foreground font-semibold py-6 rounded-2xl shadow-glow text-base"
            onClick={() => setShowAddMeter(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Neuen Zähler anlegen
          </Button>
        </motion.div>
      </motion.div>

      {/* Meters list */}
      {allMetersCount === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent/50 mx-auto mb-5 flex items-center justify-center shadow-soft"
          >
            <Gauge className="w-10 h-10 text-muted-foreground" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Keine Zähler</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Legen Sie den ersten Zähler für "{building.name}" an.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* Building-level meters */}
          {buildingMeters.length > 0 && (
            <>
              <motion.div variants={itemVariants} className="mb-1">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Gebäudezähler ({buildingMeters.length})
                </h3>
              </motion.div>
              <AnimatePresence mode="popLayout">
                {buildingMeters.map((meter, index) => (
                  <MeterCard
                    key={meter.id}
                    meter={meter}
                    index={index}
                    badge={<><Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary"><Building2 className="w-3 h-3 mr-1" />Gebäude</Badge><ReadingStatusBadge lastReadingDate={meter.lastReading?.reading_date} /></>}
                    onNavigate={() => navigate(`/meters/${meter.id}`)}
                    onDelete={() => setDeleteMeterData(meter)}
                  />
                ))}
              </AnimatePresence>
            </>
          )}

          {/* Unit-level meters */}
          {unitMeters.length > 0 && (
            <>
              <motion.div variants={itemVariants} className="mb-1 mt-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Einheitenzähler ({unitMeters.length})
                </h3>
              </motion.div>
              <AnimatePresence mode="popLayout">
                {unitMeters.map((meter, index) => (
                  <MeterCard
                    key={meter.id}
                    meter={meter}
                    index={index}
                    badge={<><Badge variant="outline" className="text-[10px] px-1.5 py-0 border-secondary/50 text-secondary-foreground"><Home className="w-3 h-3 mr-1" />{meter.unitName}</Badge><ReadingStatusBadge lastReadingDate={meter.lastReading?.reading_date} /></>}
                    onNavigate={() => navigate(`/meters/${meter.id}`)}
                    onDelete={() => setDeleteMeterData(meter)}
                  />
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}

      {/* Add Meter Dialog */}
      <AddMeterDialog
        open={showAddMeter}
        onOpenChange={setShowAddMeter}
        buildingId={building.id}
      />

      {/* Delete Meter Confirmation */}
      {deleteMeterData && (
        <CascadeDeleteDialog
          open={!!deleteMeterData}
          onOpenChange={(open) => !open && setDeleteMeterData(null)}
          onConfirm={handleDeleteMeter}
          title={`Zähler "${deleteMeterData.meter_number}" löschen?`}
          description="Diese Aktion kann nicht rückgängig gemacht werden."
          isDeleting={isDeleting}
          cascadeItems={[
            { label: 'Ablesung(en)', count: deleteMeterData.readings.length },
          ]}
        />
      )}
    </AppLayout>
  );
}
