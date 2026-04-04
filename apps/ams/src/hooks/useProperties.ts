import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BuildingSummary {
  id: string | null;
  name: string | null;
  street: string | null;
  house_number: string | null;
  zip: string | null;
  city: string | null;
  org_id: string | null;
  total_units: number | null;
  occupied_units: number | null;
  vacancy_rate: number | null;
  total_area: number | null;
}

export function useBuildingsSummary() {
  return useQuery({
    queryKey: ['buildings-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_buildings_summary')
        .select('*')
        .limit(500);
      if (error) throw error;
      return data as BuildingSummary[];
    },
  });
}

export function useEnergyProviders() {
  return useQuery({
    queryKey: ['energy-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_providers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useMietpreisbremseGebiete() {
  return useQuery({
    queryKey: ['mietpreisbremse-gebiete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mietpreisbremse_gebiete')
        .select('*')
        .order('city');
      if (error) throw error;
      return data;
    },
  });
}

export function usePropertyStats() {
  const { data: buildings } = useBuildingsSummary();

  return {
    totalBuildings: buildings?.length || 0,
    totalUnits: buildings?.reduce((sum, b) => sum + (b.total_units || 0), 0) || 0,
    occupiedUnits: buildings?.reduce((sum, b) => sum + (b.occupied_units || 0), 0) || 0,
    totalArea: buildings?.reduce((sum, b) => sum + (b.total_area || 0), 0) || 0,
    avgVacancy: buildings?.length
      ? (buildings.reduce((sum, b) => sum + (b.vacancy_rate || 0), 0) / buildings.length).toFixed(1)
      : '0',
  };
}
