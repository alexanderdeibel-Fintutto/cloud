export interface PlantSpecies {
  id: string;
  common_name: string;
  botanical_name: string;
  family: string;
  description: string;
  image_url: string;
  origin: string;
  difficulty: 'easy' | 'medium' | 'hard';
  light: 'low' | 'medium' | 'bright' | 'direct';
  water_frequency_days: number;
  water_amount: 'little' | 'moderate' | 'much';
  humidity: 'low' | 'medium' | 'high';
  temperature_min: number;
  temperature_max: number;
  fertilize_frequency_days: number;
  fertilize_months: number[]; // 1-12
  toxic_pets: boolean;
  toxic_children: boolean;
  max_height_cm: number;
  growth_speed: 'slow' | 'medium' | 'fast';
  repot_frequency_years: number;
  care_tips: string[];
  tags: string[];
}

export interface Apartment {
  id: string;
  user_id: string;
  name: string;
  address: string;
  created_at: string;
}

export interface Room {
  id: string;
  apartment_id: string;
  name: string;
  light_level: 'low' | 'medium' | 'bright' | 'direct';
  window_direction: 'north' | 'east' | 'south' | 'west' | 'none';
  notes: string;
}

export interface UserPlant {
  id: string;
  user_id: string;
  species_id: string;
  room_id: string;
  nickname: string;
  acquired_date: string;
  last_watered: string | null;
  last_fertilized: string | null;
  last_repotted: string | null;
  water_frequency_override: number | null;
  fertilize_frequency_override: number | null;
  notes: string;
  image_url: string | null;
  health_status: 'thriving' | 'good' | 'fair' | 'poor';
  created_at: string;
  // Joined data
  species?: PlantSpecies;
  room?: Room & { apartment?: Apartment };
}

export interface CareEvent {
  id: string;
  plant_id: string;
  type: 'water' | 'fertilize' | 'repot' | 'prune' | 'mist' | 'rotate';
  performed_at: string;
  notes: string;
}

export interface CareReminder {
  id: string;
  plant_id: string;
  type: 'water' | 'fertilize' | 'repot';
  due_date: string;
  completed: boolean;
  plant?: UserPlant;
}

export interface VacationPlan {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
  helpers: VacationHelper[];
  tasks: VacationTask[];
}

export interface VacationHelper {
  id: string;
  vacation_plan_id: string;
  name: string;
  email: string;
  invited_at: string;
  accepted: boolean | null;
  calendar_exported: boolean;
}

export interface VacationTask {
  id: string;
  vacation_plan_id: string;
  plant_id: string;
  helper_id: string | null;
  task_date: string;
  task_type: 'water' | 'fertilize' | 'mist';
  instructions: string;
  completed: boolean;
  plant?: UserPlant;
}

export interface ShoppingItem {
  id: string;
  user_id: string;
  name: string;
  category: 'soil' | 'fertilizer' | 'pot' | 'tool' | 'pesticide' | 'other';
  for_plant_id: string | null;
  quantity: number;
  purchased: boolean;
  affiliate_links: AffiliateLink[];
  created_at: string;
}

export interface AffiliateLink {
  shop: string;
  url: string;
  price: number | null;
  logo_url: string;
}

export interface PartnerShop {
  id: string;
  name: string;
  logo_url: string;
  base_url: string;
  affiliate_tag: string;
}
