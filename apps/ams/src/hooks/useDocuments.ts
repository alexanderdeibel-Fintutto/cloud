import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GeneratedDocument {
  id: string;
  document_name: string;
  document_type: string;
  tool_type: string;
  document_url: string;
  status: string | null;
  is_premium: boolean | null;
  has_watermark: boolean | null;
  download_count: number | null;
  source_app: string | null;
  shared_with_apps: string[] | null;
  user_id: string | null;
  org_id: string | null;
  created_at: string | null;
}

export interface DocumentTemplate {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  template_type: string | null;
  is_active: boolean | null;
  is_premium: boolean | null;
  synced_to_apps: string[] | null;
  created_at: string | null;
}

export function useGeneratedDocuments() {
  return useQuery({
    queryKey: ['generated-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as GeneratedDocument[];
    },
  });
}

export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });
}

export function useDocumentStats() {
  const { data: docs } = useGeneratedDocuments();
  const { data: templates } = useDocumentTemplates();

  return {
    totalDocs: docs?.length || 0,
    premiumDocs: docs?.filter(d => d.is_premium).length || 0,
    watermarked: docs?.filter(d => d.has_watermark).length || 0,
    totalDownloads: docs?.reduce((sum, d) => sum + (d.download_count || 0), 0) || 0,
    totalTemplates: templates?.length || 0,
    activeTemplates: templates?.filter(t => t.is_active).length || 0,
    byType: docs?.reduce((acc, d) => {
      acc[d.document_type] = (acc[d.document_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    byTool: docs?.reduce((acc, d) => {
      acc[d.tool_type] = (acc[d.tool_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
