import { useState, useCallback } from 'react';
import { Apartment, Room, UserPlant, CareEvent, CareReminder, VacationPlan, ShoppingItem } from '@/types';
import { PLANT_SPECIES } from '@/data/plants';
import { addDays, isAfter, isBefore, isToday, parseISO, format } from 'date-fns';

// Local storage keys
const STORAGE_KEYS = {
  apartments: 'pm_apartments',
  rooms: 'pm_rooms',
  plants: 'pm_plants',
  careEvents: 'pm_care_events',
  vacationPlans: 'pm_vacation_plans',
  shoppingItems: 'pm_shopping_items',
};

function loadFromStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function usePlantStore() {
  const [apartments, setApartments] = useState<Apartment[]>(() =>
    loadFromStorage(STORAGE_KEYS.apartments, [])
  );
  const [rooms, setRooms] = useState<Room[]>(() =>
    loadFromStorage(STORAGE_KEYS.rooms, [])
  );
  const [plants, setPlants] = useState<UserPlant[]>(() =>
    loadFromStorage(STORAGE_KEYS.plants, [])
  );
  const [careEvents, setCareEvents] = useState<CareEvent[]>(() =>
    loadFromStorage(STORAGE_KEYS.careEvents, [])
  );
  const [vacationPlans, setVacationPlans] = useState<VacationPlan[]>(() =>
    loadFromStorage(STORAGE_KEYS.vacationPlans, [])
  );
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.shoppingItems, [])
  );

  // --- Apartments ---
  const addApartment = useCallback((data: Omit<Apartment, 'id' | 'user_id' | 'created_at'>) => {
    const apartment: Apartment = {
      ...data,
      id: generateId(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    };
    setApartments(prev => {
      const next = [...prev, apartment];
      saveToStorage(STORAGE_KEYS.apartments, next);
      return next;
    });
    return apartment;
  }, []);

  const updateApartment = useCallback((id: string, data: Partial<Apartment>) => {
    setApartments(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...data } : a);
      saveToStorage(STORAGE_KEYS.apartments, next);
      return next;
    });
  }, []);

  const deleteApartment = useCallback((id: string) => {
    setApartments(prev => {
      const next = prev.filter(a => a.id !== id);
      saveToStorage(STORAGE_KEYS.apartments, next);
      return next;
    });
    // Also remove rooms and plants in this apartment
    setRooms(prev => {
      const roomIds = prev.filter(r => r.apartment_id === id).map(r => r.id);
      const next = prev.filter(r => r.apartment_id !== id);
      saveToStorage(STORAGE_KEYS.rooms, next);
      // Remove plants in these rooms
      setPlants(p => {
        const nextPlants = p.filter(plant => !roomIds.includes(plant.room_id));
        saveToStorage(STORAGE_KEYS.plants, nextPlants);
        return nextPlants;
      });
      return next;
    });
  }, []);

  // --- Rooms ---
  const addRoom = useCallback((data: Omit<Room, 'id'>) => {
    const room: Room = { ...data, id: generateId() };
    setRooms(prev => {
      const next = [...prev, room];
      saveToStorage(STORAGE_KEYS.rooms, next);
      return next;
    });
    return room;
  }, []);

  const updateRoom = useCallback((id: string, data: Partial<Room>) => {
    setRooms(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...data } : r);
      saveToStorage(STORAGE_KEYS.rooms, next);
      return next;
    });
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setRooms(prev => {
      const next = prev.filter(r => r.id !== id);
      saveToStorage(STORAGE_KEYS.rooms, next);
      return next;
    });
    setPlants(prev => {
      const next = prev.filter(p => p.room_id !== id);
      saveToStorage(STORAGE_KEYS.plants, next);
      return next;
    });
  }, []);

  const getRoomsForApartment = useCallback((apartmentId: string) => {
    return rooms.filter(r => r.apartment_id === apartmentId);
  }, [rooms]);

  // --- Plants ---
  const addPlant = useCallback((data: Omit<UserPlant, 'id' | 'user_id' | 'created_at'>) => {
    const plant: UserPlant = {
      ...data,
      id: generateId(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    };
    setPlants(prev => {
      const next = [...prev, plant];
      saveToStorage(STORAGE_KEYS.plants, next);
      return next;
    });
    return plant;
  }, []);

  const updatePlant = useCallback((id: string, data: Partial<UserPlant>) => {
    setPlants(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...data } : p);
      saveToStorage(STORAGE_KEYS.plants, next);
      return next;
    });
  }, []);

  const deletePlant = useCallback((id: string) => {
    setPlants(prev => {
      const next = prev.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEYS.plants, next);
      return next;
    });
  }, []);

  // Enrich plants with species and room data
  const getEnrichedPlants = useCallback((): UserPlant[] => {
    return plants.map(plant => ({
      ...plant,
      species: PLANT_SPECIES.find(s => s.id === plant.species_id),
      room: (() => {
        const room = rooms.find(r => r.id === plant.room_id);
        if (!room) return undefined;
        const apartment = apartments.find(a => a.id === room.apartment_id);
        return { ...room, apartment };
      })(),
    }));
  }, [plants, rooms, apartments]);

  // --- Care Events ---
  const logCareEvent = useCallback((data: Omit<CareEvent, 'id'>) => {
    const event: CareEvent = { ...data, id: generateId() };
    setCareEvents(prev => {
      const next = [...prev, event];
      saveToStorage(STORAGE_KEYS.careEvents, next);
      return next;
    });

    // Update last_watered/last_fertilized on the plant
    if (data.type === 'water' || data.type === 'fertilize' || data.type === 'repot') {
      setPlants(prev => {
        const next = prev.map(p => {
          if (p.id !== data.plant_id) return p;
          const updates: Partial<UserPlant> = {};
          if (data.type === 'water') updates.last_watered = data.performed_at;
          if (data.type === 'fertilize') updates.last_fertilized = data.performed_at;
          if (data.type === 'repot') updates.last_repotted = data.performed_at;
          return { ...p, ...updates };
        });
        saveToStorage(STORAGE_KEYS.plants, next);
        return next;
      });
    }

    return event;
  }, []);

  // --- Reminders ---
  const getReminders = useCallback((): CareReminder[] => {
    const reminders: CareReminder[] = [];
    const enrichedPlants = getEnrichedPlants();
    const today = new Date();

    enrichedPlants.forEach(plant => {
      if (!plant.species) return;

      const waterFreq = plant.water_frequency_override || plant.species.water_frequency_days;
      const fertilizeFreq = plant.fertilize_frequency_override || plant.species.fertilize_frequency_days;

      // Water reminder
      const lastWatered = plant.last_watered ? parseISO(plant.last_watered) : parseISO(plant.created_at);
      const nextWater = addDays(lastWatered, waterFreq);
      const waterOverdue = isBefore(nextWater, today) || isToday(nextWater);
      reminders.push({
        id: `water-${plant.id}`,
        plant_id: plant.id,
        type: 'water',
        due_date: format(nextWater, 'yyyy-MM-dd'),
        completed: !waterOverdue,
        plant,
      });

      // Fertilize reminder (only in active months)
      const currentMonth = today.getMonth() + 1;
      if (plant.species.fertilize_months.includes(currentMonth)) {
        const lastFertilized = plant.last_fertilized ? parseISO(plant.last_fertilized) : parseISO(plant.created_at);
        const nextFertilize = addDays(lastFertilized, fertilizeFreq);
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

  const getOverdueReminders = useCallback((): CareReminder[] => {
    return getReminders().filter(r => {
      const dueDate = parseISO(r.due_date);
      return (isBefore(dueDate, new Date()) || isToday(dueDate)) && !r.completed;
    });
  }, [getReminders]);

  const getTodayReminders = useCallback((): CareReminder[] => {
    return getReminders().filter(r => isToday(parseISO(r.due_date)));
  }, [getReminders]);

  const getUpcomingReminders = useCallback((days: number = 7): CareReminder[] => {
    const today = new Date();
    const end = addDays(today, days);
    return getReminders().filter(r => {
      const dueDate = parseISO(r.due_date);
      return isAfter(dueDate, today) && isBefore(dueDate, end);
    });
  }, [getReminders]);

  // --- Vacation Plans ---
  const addVacationPlan = useCallback((data: Omit<VacationPlan, 'id' | 'user_id' | 'created_at' | 'helpers' | 'tasks'>) => {
    const plan: VacationPlan = {
      ...data,
      id: generateId(),
      user_id: 'local',
      created_at: new Date().toISOString(),
      helpers: [],
      tasks: [],
    };
    setVacationPlans(prev => {
      const next = [...prev, plan];
      saveToStorage(STORAGE_KEYS.vacationPlans, next);
      return next;
    });
    return plan;
  }, []);

  const updateVacationPlan = useCallback((id: string, data: Partial<VacationPlan>) => {
    setVacationPlans(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...data } : p);
      saveToStorage(STORAGE_KEYS.vacationPlans, next);
      return next;
    });
  }, []);

  const deleteVacationPlan = useCallback((id: string) => {
    setVacationPlans(prev => {
      const next = prev.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEYS.vacationPlans, next);
      return next;
    });
  }, []);

  // --- Shopping ---
  const addShoppingItem = useCallback((data: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) => {
    const item: ShoppingItem = {
      ...data,
      id: generateId(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    };
    setShoppingItems(prev => {
      const next = [...prev, item];
      saveToStorage(STORAGE_KEYS.shoppingItems, next);
      return next;
    });
    return item;
  }, []);

  const updateShoppingItem = useCallback((id: string, data: Partial<ShoppingItem>) => {
    setShoppingItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...data } : i);
      saveToStorage(STORAGE_KEYS.shoppingItems, next);
      return next;
    });
  }, []);

  const deleteShoppingItem = useCallback((id: string) => {
    setShoppingItems(prev => {
      const next = prev.filter(i => i.id !== id);
      saveToStorage(STORAGE_KEYS.shoppingItems, next);
      return next;
    });
  }, []);

  return {
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
