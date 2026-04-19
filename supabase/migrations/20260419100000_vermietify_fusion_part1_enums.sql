-- ============================================================
-- VERMIETIFY FUSION: Part 1 – ENUMs
-- Alle neuen ENUM-Typen aus vermietify_final
-- Datum: 2026-04-19
-- ============================================================

-- Sicher hinzufügen (nur wenn noch nicht vorhanden)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'building_type') THEN
    CREATE TYPE public.building_type AS ENUM ('apartment', 'house', 'commercial', 'mixed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meter_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE TYPE public.meter_type AS ENUM ('electricity', 'gas', 'water', 'heating');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meter_status') THEN
    CREATE TYPE public.meter_status AS ENUM ('current', 'reading_due', 'overdue');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_status') THEN
    CREATE TYPE public.unit_status AS ENUM ('rented', 'vacant', 'renovating');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE public.document_type AS ENUM ('contract', 'protocol', 'invoice', 'insurance', 'tax', 'correspondence', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
    CREATE TYPE public.task_category AS ENUM ('water_damage', 'heating', 'electrical', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_source') THEN
    CREATE TYPE public.task_source AS ENUM ('tenant', 'landlord', 'caretaker');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'letter_status') THEN
    CREATE TYPE public.letter_status AS ENUM ('draft', 'submitted', 'printing', 'sent', 'delivered', 'error', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE public.transaction_type AS ENUM ('rent', 'deposit', 'utility', 'repair', 'insurance', 'tax', 'other_income', 'other_expense');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'member');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_status') THEN
    CREATE TYPE public.handover_status AS ENUM ('planned', 'in_progress', 'completed', 'signed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_type') THEN
    CREATE TYPE public.handover_type AS ENUM ('move_in', 'move_out');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'defect_severity') THEN
    CREATE TYPE public.defect_severity AS ENUM ('light', 'medium', 'severe');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'key_type') THEN
    CREATE TYPE public.key_type AS ENUM ('front_door', 'apartment', 'basement', 'mailbox', 'garage', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'signer_type') THEN
    CREATE TYPE public.signer_type AS ENUM ('landlord', 'tenant', 'witness', 'caretaker');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'esignature_status') THEN
    CREATE TYPE public.esignature_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rent_adjustment_type') THEN
    CREATE TYPE public.rent_adjustment_type AS ENUM ('index', 'staffel', 'vergleichsmiete');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rent_adjustment_status') THEN
    CREATE TYPE public.rent_adjustment_status AS ENUM ('pending', 'announced', 'active', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'elster_form_type') THEN
    CREATE TYPE public.elster_form_type AS ENUM ('anlage_v', 'anlage_kap', 'anlage_so', 'ust_va', 'ust_jahreserklaerung');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'elster_status') THEN
    CREATE TYPE public.elster_status AS ENUM ('draft', 'validating', 'submitted', 'accepted', 'rejected', 'notice_received');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE public.listing_status AS ENUM ('draft', 'active', 'paused', 'rented');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
    CREATE TYPE public.inquiry_status AS ENUM ('new', 'contacted', 'viewing', 'cancelled', 'rented');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'portal_type') THEN
    CREATE TYPE public.portal_type AS ENUM ('immoscout', 'immowelt', 'ebay', 'website');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'portal_status') THEN
    CREATE TYPE public.portal_status AS ENUM ('pending', 'published', 'error', 'removed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_trigger_type') THEN
    CREATE TYPE public.workflow_trigger_type AS ENUM ('lease_expiry', 'rent_due', 'meter_reading_due', 'task_created', 'document_uploaded', 'manual');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_action_type') THEN
    CREATE TYPE public.workflow_action_type AS ENUM ('send_email', 'send_whatsapp', 'create_task', 'create_invoice', 'send_letter', 'notify_user');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_execution_status') THEN
    CREATE TYPE public.workflow_execution_status AS ENUM ('running', 'completed', 'failed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM ('info', 'warning', 'error', 'success', 'reminder');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_channel') THEN
    CREATE TYPE public.reminder_channel AS ENUM ('app', 'email', 'push');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_category') THEN
    CREATE TYPE public.calendar_category AS ENUM ('rent', 'maintenance', 'inspection', 'lease', 'tax', 'insurance', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'related_entity_type') THEN
    CREATE TYPE public.related_entity_type AS ENUM ('building', 'unit', 'tenant', 'lease', 'task', 'document', 'meter');
  END IF;
END $$;
