// Fintutto Hausmeister Types

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed';
export type AppRole = 'admin' | 'moderator' | 'user';
export type EventType = 'maintenance' | 'inspection' | 'other';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface Building {
  id: string;
  company_id: string;
  name: string;
  address: string;
  year_built?: number;
  total_area?: number;
  units_count: number;
  created_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  floor?: number;
  area?: number;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  status: 'occupied' | 'vacant' | 'maintenance';
}

export interface Task {
  id: string;
  company_id: string;
  building_id?: string;
  unit_id?: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  created_by: string;
  assigned_to?: string;
  reported_by_name?: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  // Relations
  building?: Building;
  unit?: Unit;
}

export interface TaskPhoto {
  id: string;
  task_id: string;
  url: string;
  type: 'reporter' | 'documentation';
  uploaded_at: string;
  uploaded_by: string;
}

export interface TaskNote {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
}

export interface CalendarEvent {
  id: string;
  company_id: string;
  building_id?: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  created_by: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  company_id: string;
  participant_ids: string[];
  title?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_by: string[];
  created_at: string;
  sender?: User;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface UserCompanyAssignment {
  id: string;
  user_id: string;
  company_id: string;
  assigned_at: string;
}

// UI Helper Types
export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FilterTab {
  value: string;
  label: string;
  count?: number;
}
