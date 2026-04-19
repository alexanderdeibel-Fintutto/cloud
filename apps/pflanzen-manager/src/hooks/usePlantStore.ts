/**
 * usePlantStore – Supabase-backed store für den Pflanzen-Manager
 * Ersetzt die frühere localStorage-Implementierung vollständig.
 */
import { useState, useEffect, useCallback } from 'react';
import { addDays, isAfter, isBefore, isToday, parseISO, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type {
  Apartment,
  Room,
  UserPlant,
  CareEvent,
  CareReminder,
  VacationPlan,
  ShoppingItem,
} from '@/types';
import { PLANT_SPECIES } from '@/data/plants';

export function usePlantStore() {
  const { user, isLoading: authLoading } = useAuth();

  const [apartments, setApartments]       = useState<Apartment[]>([]);
  const [rooms, setRooms]                 = useState<Room[]>([]);
  const [plants, setPlants]               = useState<UserPlant[]>([]);
  const [careEvents, setCareEvents]       = useState<CareEvent[]>([]);
  const [vacationPlans, setVacationPlans] = useState<VacationPlan[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading]             = useState(true);

  // ── Initial Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    loadAll();
  }, [user, authLoading]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadApartments(),
      loadRooms(),
      loadPlants(),
      loadCareEvents(),
      loadVacationPlans(),
      loadShoppingItems(),
    ]);
    setLoading(false);
  };

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadApartments = async () => {
    const { data } = await supabase.from('pm_apartments').select('*').order('created_at');
    if (data) setApartments(data as Apartment[]);
  };

  const loadRooms = async () => {
    const { data } = await supabase.from('pm_rooms').select('*').order('name');
    if (data) setRooms(data as Room[]);
  };

  const loadPlants = async () => {
    const { data } = await supabase.from('pm_user_plants').select('*').order('created_at');
    if (data) setPlants(data as UserPlant[]);
  };

  const loadCareEvents = async () => {
    const { data } = await supabase
      .from('pm_care_events')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(500);
    if (data) setCareEvents(data as CareEvent[]);
  };

  const loadVacationPlans = async () => {
    const { data } = await supabase
      .from('pm_vacation_plans')
      .select(`*, helpers:pm_vacation_helpers(*), tasks:pm_vacation_tasks(*)`)
      .order('start_date');
    if (data) setVacationPlans(data as unknown as VacationPlan[]);
  };

  const loadShoppingItems = async () => {
    const { data } = await supabase.from('pm_shopping_items').select('*').order('created_at');
    if (data) setShoppingItems(data as ShoppingItem[]);
  };

  // ── Apartments ────────────────────────────────────────────────────────────
  const addApartment = useCallback(async (apt: Omit<Apartment, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pm_apartments')
      .insert({ ...apt, user_id: user.id })
      .select()
      .single();
    if (!error && data) setApartments(prev => [...prev, data as Apartment]);
  }, [user]);

  const updateApartment = useCallback(async (id: string, updates: Partial<Apartment>) => {
    const { data, error } = await supabase
      .from('pm_apartments').update(updates).eq('id', id).select().single();
    if (!error && data)
      setApartments(prev => prev.map(a => a.id === id ? data as Apartment : a));
  }, []);

  const deleteApartment = useCallback(async (id: string) => {
    const { error } = await supabase.from('pm_apartments').delete().eq('id', id);
    if (!error) setApartments(prev => prev.filter(a => a.id !== id));
  }, []);

  // ── Rooms ─────────────────────────────────────────────────────────────────
  const addRoom = useCallback(async (room: Omit<Room, 'id'>) => {
    const { data, error } = await supabase
      .from('pm_rooms').insert(room).select().single();
    if (!error && data) setRooms(prev => [...prev, data as Room]);
  }, []);

  const updateRoom = useCallback(async (id: string, updates: Partial<Room>) => {
    const { data, error } = await supabase
      .from('pm_rooms').update(updates).eq('id', id).select().single();
    if (!error && data)
      setRooms(prev => prev.map(r => r.id === id ? data as Room : r));
  }, []);

  const deleteRoom = useCallback(async (id: string) => {
    const { error } = await supabase.from('pm_rooms').delete().eq('id', id);
    if (!error) setRooms(prev => prev.filter(r => r.id !== id));
  }, []);

  const getRoomsForApartment = useCallback(
    (apartmentId: string) => rooms.filter(r => r.apartment_id === apartmentId),
    [rooms]
  );

  // ── Plants ────────────────────────────────────────────────────────────────
  const addPlant = useCallback(async (plant: Omit<UserPlant, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pm_user_plants')
      .insert({ ...plant, user_id: user.id })
      .select().single();
    if (!error && data) setPlants(prev => [...prev, data as UserPlant]);
  }, [user]);

  const updatePlant = useCallback(async (id: string, updates: Partial<UserPlant>) => {
    const { data, error } = await supabase
      .from('pm_user_plants').update(updates).eq('id', id).select().single();
    if (!error && data)
      setPlants(prev => prev.map(p => p.id === id ? data as UserPlant : p));
  }, []);

  const deletePlant = useCallback(async (id: string) => {
    const { error } = await supabase.from('pm_user_plants').delete().eq('id', id);
    if (!error) setPlants(prev => prev.filter(p => p.id !== id));
  }, []);

  const getEnrichedPlants = useCallback((): UserPlant[] => {
    return plants.map(plant => {
      const species    = PLANT_SPECIES.find(s => s.id === plant.species_id);
      const room       = rooms.find(r => r.id === plant.room_id);
      const apartment  = room ? apartments.find(a => a.id === room.apartment_id) : undefined;
      return { ...plant, species, room: room ? { ...room, apartment } : undefined };
    });
  }, [plants, rooms, apartments]);

  // ── Care Events ───────────────────────────────────────────────────────────
  const logCareEvent = useCallback(async (data: Omit<CareEvent, 'id'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('pm_care_events')
      .insert({ ...data, user_id: user.id })
      .select().single();
    if (!error && inserted) {
      setCareEvents(prev => [inserted as CareEvent, ...prev]);
      const updateField: Partial<UserPlant> = {};
      if (data.type === 'water')     updateField.last_watered    = data.performed_at;
      if (data.type === 'fertilize') updateField.last_fertilized = data.performed_at;
      if (data.type === 'repot')     updateField.last_repotted   = data.performed_at;
      if (Object.keys(updateField).length > 0) await updatePlant(data.plant_id, updateField);
    }
  }, [user, updatePlant]);

  // ── Reminders (computed) ──────────────────────────────────────────────────
  const getReminders = useCallback((): CareReminder[] => {
    const reminders: CareReminder[] = [];
    const enrichedPlants = getEnrichedPlants();
    const today = new Date();

    enrichedPlants.forEach(plant => {
      if (!plant.species) return;
      const waterFreq     = plant.water_frequency_override    ?? plant.species.water_frequency_days;
      const fertilizeFreq = plant.fertilize_frequency_override ?? plant.species.fertilize_frequency_days;

      const lastWatered  = plant.last_watered    ? parseISO(plant.last_watered)    : parseISO(plant.created_at);
      const nextWater    = addDays(lastWatered, waterFreq);
      const waterOverdue = isBefore(nextWater, today) || isToday(nextWater);
      reminders.push({
        id: `water-${plant.id}`,
        plant_id: plant.id,
        type: 'water',
        due_date: format(nextWater, 'yyyy-MM-dd'),
        completed: !waterOverdue,
        plant,
      });

      const currentMonth = today.getMonth() + 1;
      if (plant.species.fertilize_months.includes(currentMonth)) {
        const lastFertilized  = plant.last_fertilized ? parseISO(plant.last_fertilized) : parseISO(plant.created_at);
        const nextFertilize   = addDays(lastFertilized, fertilizeFreq);
        const fertilizeOverdue = isBefore(nextFertilize, today) || isToday(nextFertilize);
        reminders.push({
          id: `fertilize-${plant.id}`,
          plant_id: plant.id,
          type: 'fertilize',
          due_date: format(nextFertilize, 'yyyy-MM-dd'),
          completed: !fertilizeOverdue,
          plant,
        });
      }
    });

    return reminders.sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [getEnrichedPlants]);

  const getOverdueReminders = useCallback((): CareReminder[] =>
    getReminders().filter(r => (isBefore(parseISO(r.due_date), new Date()) || isToday(parseISO(r.due_date))) && !r.completed),
    [getReminders]);

  const getTodayReminders = useCallback((): CareReminder[] =>
    getReminders().filter(r => isToday(parseISO(r.due_date))),
    [getReminders]);

  const getUpcomingReminders = useCallback((days = 7): CareReminder[] => {
    const today = new Date();
    const end   = addDays(today, days);
    return getReminders().filter(r => {
      const d = parseISO(r.due_date);
      return isAfter(d, today) && isBefore(d, end);
    });
  }, [getReminders]);

  // ── Vacation Plans ────────────────────────────────────────────────────────
  const addVacationPlan = useCallback(async (
    plan: Omit<VacationPlan, 'id' | 'user_id' | 'created_at' | 'helpers' | 'tasks'>
  ) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pm_vacation_plans')
      .insert({ ...plan, user_id: user.id })
      .select().single();
    if (!error && data)
      setVacationPlans(prev => [...prev, { ...data, helpers: [], tasks: [] } as VacationPlan]);
  }, [user]);

  const updateVacationPlan = useCallback(async (id: string, updates: Partial<VacationPlan>) => {
    const { helpers, tasks, ...rest } = updates as VacationPlan;
    const { data, error } = await supabase
      .from('pm_vacation_plans').update(rest).eq('id', id).select().single();
    if (!error && data)
      setVacationPlans(prev => prev.map(vp =>
        vp.id === id ? { ...vp, ...data, helpers: helpers ?? vp.helpers, tasks: tasks ?? vp.tasks } : vp
      ));
  }, []);

  const deleteVacationPlan = useCallback(async (id: string) => {
    const { error } = await supabase.from('pm_vacation_plans').delete().eq('id', id);
    if (!error) setVacationPlans(prev => prev.filter(vp => vp.id !== id));
  }, []);

  // ── Shopping Items ────────────────────────────────────────────────────────
  const addShoppingItem = useCallback(async (item: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pm_shopping_items')
      .insert({ ...item, user_id: user.id })
      .select().single();
    if (!error && data) setShoppingItems(prev => [...prev, data as ShoppingItem]);
  }, [user]);

  const updateShoppingItem = useCallback(async (id: string, updates: Partial<ShoppingItem>) => {
    const { data, error } = await supabase
      .from('pm_shopping_items').update(updates).eq('id', id).select().single();
    if (!error && data)
      setShoppingItems(prev => prev.map(i => i.id === id ? data as ShoppingItem : i));
  }, []);

  const deleteShoppingItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('pm_shopping_items').delete().eq('id', id);
    if (!error) setShoppingItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return {
    // State
    loading,
    // Data
    apartments,
    rooms,
    plants,
    careEvents,
    vacationPlans,
    shoppingItems,
    species: PLANT_SPECIES,
    // Apartments
    addApartment,
    updateApartment,
    deleteApartment,
    // Rooms
    addRoom,
    updateRoom,
    deleteRoom,
    getRoomsForApartment,
    // Plants
    addPlant,
    updatePlant,
    deletePlant,
    getEnrichedPlants,
    // Care
    logCareEvent,
    getReminders,
    getOverdueReminders,
    getTodayReminders,
    getUpcomingReminders,
    // Vacation
    addVacationPlan,
    updateVacationPlan,
    deleteVacationPlan,
    // Shopping
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
  };
}
