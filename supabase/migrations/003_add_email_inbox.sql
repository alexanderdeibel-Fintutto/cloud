-- Migration: Add email inbox tables for inbound email processing
-- Feature: Users get a unique email address to receive invoices/PDFs for automatic booking

-- Status enum for inbound emails
CREATE TYPE email_processing_status AS ENUM ('pending', 'processed', 'unclear', 'rejected');

-- Email inboxes: each user gets a unique generated email address
CREATE TABLE IF NOT EXISTS public.email_inboxes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    generated_address TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verified sender addresses: users whitelist their own email addresses
CREATE TABLE IF NOT EXISTS public.verified_senders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- Inbound emails: received emails with metadata
CREATE TABLE IF NOT EXISTS public.inbound_emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inbox_id UUID REFERENCES public.email_inboxes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    body_text TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    status email_processing_status DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    booking_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email attachments: PDF and other files attached to inbound emails
CREATE TABLE IF NOT EXISTS public.email_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_id UUID REFERENCES public.inbound_emails(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking questions: unclear items from inbound emails requiring manual action
CREATE TABLE IF NOT EXISTS public.booking_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    email_id UUID REFERENCES public.inbound_emails(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    suggested_category TEXT,
    suggested_amount DECIMAL(10,2),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.email_inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: email_inboxes
CREATE POLICY "Users can view own inbox" ON public.email_inboxes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inbox" ON public.email_inboxes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbox" ON public.email_inboxes
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: verified_senders
CREATE POLICY "Users can view own senders" ON public.verified_senders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add own senders" ON public.verified_senders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own senders" ON public.verified_senders
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own senders" ON public.verified_senders
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: inbound_emails
CREATE POLICY "Users can view own emails" ON public.inbound_emails
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own emails" ON public.inbound_emails
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: email_attachments (via join to inbound_emails)
CREATE POLICY "Users can view own attachments" ON public.email_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.inbound_emails
            WHERE inbound_emails.id = email_attachments.email_id
            AND inbound_emails.user_id = auth.uid()
        )
    );

-- RLS Policies: booking_questions
CREATE POLICY "Users can view own questions" ON public.booking_questions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.booking_questions
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_inboxes_user_id ON public.email_inboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_inboxes_address ON public.email_inboxes(generated_address);
CREATE INDEX IF NOT EXISTS idx_verified_senders_user_id ON public.verified_senders(user_id);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_inbox_id ON public.inbound_emails(inbox_id);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_user_id ON public.inbound_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_status ON public.inbound_emails(status);
CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON public.email_attachments(email_id);
CREATE INDEX IF NOT EXISTS idx_booking_questions_user_id ON public.booking_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_questions_resolved ON public.booking_questions(is_resolved);

-- Trigger for updated_at on email_inboxes
CREATE TRIGGER update_email_inboxes_updated_at
    BEFORE UPDATE ON public.email_inboxes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
