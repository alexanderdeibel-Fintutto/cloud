export interface AppRegistryItem {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  color: string;
  url: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  price_monthly: number | null;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CrossSellTrigger {
  id: string;
  source_app_id: string;
  target_app_id: string;
  trigger_type: string;
  trigger_condition: Record<string, unknown>;
  message_template: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}
