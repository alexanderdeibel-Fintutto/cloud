
-- Email Inboxes: Eine generierte Eingangs-E-Mail-Adresse pro Firma
CREATE TABLE public.email_inboxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL UNIQUE,
  email_prefix TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Verified Senders: Verifizierte Absender-Adressen je Firma
CREATE TABLE public.verified_senders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, email)
);

-- Documents: Empfangene und verarbeitete Belege
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id),
  task_id UUID REFERENCES public.tasks(id),
  sender_email TEXT NOT NULL,
  subject TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  document_type TEXT DEFAULT 'unknown',
  extracted_data JSONB DEFAULT '{}'::jsonb,
  amount NUMERIC,
  vendor_name TEXT,
  invoice_date DATE,
  invoice_number TEXT,
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document Questions: Offene Fragen bei unklaren Belegen
CREATE TABLE public.document_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'assignment',
  suggested_answer TEXT,
  answer TEXT,
  answered_by UUID,
  answered_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_questions ENABLE ROW LEVEL SECURITY;

-- RLS: email_inboxes
CREATE POLICY "Users can view inboxes of their companies"
  ON public.email_inboxes FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create inboxes for their companies"
  ON public.email_inboxes FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update inboxes of their companies"
  ON public.email_inboxes FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

-- RLS: verified_senders
CREATE POLICY "Users can view senders of their companies"
  ON public.verified_senders FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can add senders to their companies"
  ON public.verified_senders FOR INSERT
  WITH CHECK (
    auth.uid() = added_by AND
    company_id IN (
      SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update senders of their companies"
  ON public.verified_senders FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete senders of their companies"
  ON public.verified_senders FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

-- RLS: documents
CREATE POLICY "Users can view documents of their companies"
  ON public.documents FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update documents of their companies"
  ON public.documents FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

-- RLS: document_questions
CREATE POLICY "Users can view questions of their companies"
  ON public.document_questions FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can answer questions of their companies"
  ON public.document_questions FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.user_company_assignments WHERE user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_email_inboxes_updated_at
  BEFORE UPDATE ON public.email_inboxes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for document PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can view their company documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Service role can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');
