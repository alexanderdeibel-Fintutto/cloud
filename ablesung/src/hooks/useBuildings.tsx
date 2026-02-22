import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { 
  Building, 
  Unit, 
  Meter, 
  MeterReading, 
  BuildingWithUnits,
  UnitWithMeters,
  MeterWithReadings,
  MeterType,
  UnitType,
  UnitStatus
} from '@/types/database';

export function useBuildings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Fetch all buildings with units and meters
  const { data: buildings, isLoading, error, refetch } = useQuery({
    queryKey: ['buildings', profile?.organization_id],
    queryFn: async (): Promise<BuildingWithUnits[]> => {
      if (!user || !profile?.organization_id) return [];

      // Fetch buildings
      const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (buildingsError) throw buildingsError;
      if (!buildingsData?.length) return [];

      const buildingIds = buildingsData.map(b => b.id);

      // Fetch units
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .in('building_id', buildingIds);

      if (unitsError) throw unitsError;

      const unitIds = (unitsData || []).map(u => u.id);

      // Fetch meters via units
      const { data: metersData, error: metersError } = unitIds.length > 0
        ? await supabase
            .from('meters')
            .select('*')
            .in('unit_id', unitIds)
        : { data: [] as Meter[], error: null };

      if (metersError) throw metersError;

      const meterIds = (metersData || []).map(m => m.id);

      // Fetch readings
      const { data: readingsData, error: readingsError } = await supabase
        .from('meter_readings')
        .select('*')
        .in('meter_id', meterIds)
        .order('reading_date', { ascending: false });

      if (readingsError) throw readingsError;

      // Helper function to add readings to meters
      const addReadingsToMeter = (meter: Meter): MeterWithReadings => {
        const meterReadings = (readingsData as MeterReading[] || []).filter(r => r.meter_id === meter.id);
        const lastReading = meterReadings[0];
        const previousReading = meterReadings[1];
        const consumption = lastReading && previousReading 
          ? lastReading.reading_value - previousReading.reading_value 
          : undefined;

        return {
          ...meter,
          readings: meterReadings,
          lastReading,
          consumption,
        };
      };

      // Combine data
      const result: BuildingWithUnits[] = (buildingsData as Building[]).map(building => {
        const buildingUnits = (unitsData as Unit[] || []).filter(u => u.building_id === building.id);

        const unitsWithMeters: UnitWithMeters[] = buildingUnits.map(unit => {
          const unitMeters = (metersData as Meter[] || []).filter(m => m.unit_id === unit.id);
          const metersWithReadings: MeterWithReadings[] = unitMeters.map(addReadingsToMeter);

          return {
            ...unit,
            meters: metersWithReadings,
            building,
          };
        });

        // Collect all meters from all units for building-level meter list
        const allBuildingMeters = unitsWithMeters.flatMap(u => u.meters);

        return {
          ...building,
          units: unitsWithMeters,
          meters: allBuildingMeters,
        };
      });

      return result;
    },
    enabled: !!user && !!profile?.organization_id,
  });

  // Create building
  const createBuilding = useMutation({
    mutationFn: async (data: Omit<Building, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: newBuilding, error } = await supabase
        .from('buildings')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return newBuilding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Update building
  const updateBuilding = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Building> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('buildings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Delete building
  const deleteBuilding = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Create unit
  const createUnit = useMutation({
    mutationFn: async (data: { 
      building_id: string; 
      unit_number: string; 
      floor?: number;
      area?: number;
      rooms?: number;
      type?: UnitType;
      status?: UnitStatus;
    }) => {
      const { data: newUnit, error } = await supabase
        .from('units')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newUnit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Delete unit
  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Create meter (attached to a unit)
  const createMeter = useMutation({
    mutationFn: async (data: {
      unit_id: string;
      meter_number: string;
      meter_type: MeterType;
      installation_date?: string;
      replaced_by?: string;
    }) => {
      const { data: newMeter, error } = await supabase
        .from('meters')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newMeter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Delete meter
  const deleteMeter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Create reading
  const createReading = useMutation({
    mutationFn: async (data: {
      meter_id: string;
      reading_value: number;
      reading_date?: string;
      image_url?: string;
      source?: 'manual' | 'ocr' | 'api';
      confidence?: number;
    }) => {
      const insertData = {
        ...data,
        reading_date: data.reading_date || new Date().toISOString().split('T')[0],
        source: data.source || 'manual',
        submitted_by: user?.id,
      };

      const { data: newReading, error } = await supabase
        .from('meter_readings')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return newReading;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Delete reading
  const deleteReading = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meter_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  return {
    buildings: buildings || [],
    isLoading,
    error,
    refetch,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    createUnit,
    deleteUnit,
    createMeter,
    deleteMeter,
    createReading,
    deleteReading,
  };
}
