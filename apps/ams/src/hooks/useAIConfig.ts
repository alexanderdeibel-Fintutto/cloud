import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AIModel {
  id: string;
  model_key: string | null;
  display_name: string | null;
  provider: string | null;
  is_active: boolean | null;
  input_cost_per_1k: number | null;
  output_cost_per_1k: number | null;
  max_tokens: number | null;
  created_at: string | null;
}

export interface AIPersona {
  id: string;
  persona_key: string | null;
  name: string | null;
  description: string | null;
  tone: string | null;
  formality: string | null;
  user_type: string | null;
  subscription_tier: string | null;
  primary_goals: Record<string, unknown> | null;
  pain_points: Record<string, unknown> | null;
  relevant_apps: string[] | null;
  upgrade_sensitivity: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface AISystemPrompt {
  id?: string;
  prompt_key: string | null;
  name: string | null;
  description: string | null;
  system_prompt: string | null;
  category: string | null;
  default_model_id: string | null;
  max_tokens: number | null;
}

export interface AIRateLimit {
  id: string;
  app_id: string | null;
  tier: string | null;
  daily_limit: number | null;
  monthly_limit: number | null;
  requests_per_minute: number | null;
  created_at: string | null;
}

export interface AIFeatureGate {
  id: string;
  app_id: string | null;
  feature_key: string | null;
  min_tier: string | null;
  is_enabled: boolean | null;
  config: Record<string, unknown> | null;
  created_at: string | null;
}

export function useAIModels() {
  return useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_models_config')
        .select('*')
        .order('display_name');
      if (error) throw error;
      return data as AIModel[];
    },
  });
}

export function useAIPersonas() {
  return useQuery({
    queryKey: ['ai-personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_personas')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as AIPersona[];
    },
  });
}

export function useAISystemPrompts() {
  return useQuery({
    queryKey: ['ai-system-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_system_prompts')
        .select('*')
        .order('category');
      if (error) throw error;
      return data as AISystemPrompt[];
    },
  });
}

export function useAIRateLimits() {
  return useQuery({
    queryKey: ['ai-rate-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_rate_limits')
        .select('*');
      if (error) throw error;
      return data as AIRateLimit[];
    },
  });
}

export function useAIFeatureGates() {
  return useQuery({
    queryKey: ['ai-feature-gates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_feature_gates')
        .select('*');
      if (error) throw error;
      return data as AIFeatureGate[];
    },
  });
}

export function useAICostsSummary() {
  return useQuery({
    queryKey: ['ai-costs-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ai_costs_summary')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
}

export function useAIErrors() {
  return useQuery({
    queryKey: ['ai-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ai_errors')
        .select('*')
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateAIModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AIModel> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_models_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });
}

export function useUpdateAIPersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AIPersona> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_personas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-personas'] });
    },
  });
}
