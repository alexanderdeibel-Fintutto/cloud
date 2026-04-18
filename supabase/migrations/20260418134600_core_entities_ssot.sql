-- ============================================================
-- Migration: Core Entities – Single Source of Truth (SSOT)
-- Erstellt: 2026-04-18
-- Zweck: Zentrale Kontakt- und Adressverwaltung für alle Apps
--        (Vermietify, Financial Compass, Ablesung, SecondBrain)
-- ============================================================
-- Jeder Kontakt (Person oder Firma) und jede Adresse wird nur
-- EINMAL gespeichert. Alle Apps referenzieren diese Kernentitäten
-- über Fremdschlüssel und fügen nur app-spezifische Metadaten hinzu.
-- ============================================================

-- ── 1. core_contacts ─────────────────────────────────────────
-- Zentrale Kontaktverwaltung: Personen und Firmen
CREATE TABLE IF NOT EXISTS public.core_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_type    TEXT NOT NULL DEFAULT 'person'
                  CHECK (contact_type IN ('person', 'company')),
  -- Person
  first_name      TEXT,
  last_name       TEXT,
  -- Firma
  company_name    TEXT,
  -- Gemeinsame Felder
  email           TEXT,
  phone           TEXT,
  mobile          TEXT,
  tax_id          TEXT,    -- Steuernummer
  vat_id          TEXT,    -- USt-IdNr.
  iban            TEXT,    -- Bankverbindung
  bank_name       TEXT,
  notes           TEXT,
  tags            TEXT[]   DEFAULT '{}',
  -- Metadaten
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Constraint: Person braucht Vor- oder Nachname, Firma braucht Firmenname
  CONSTRAINT chk_contact_name CHECK (
    (contact_type = 'person' AND (first_name IS NOT NULL OR last_name IS NOT NULL))
    OR
    (contact_type = 'company' AND company_name IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_core_contacts_owner   ON public.core_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_core_contacts_org     ON public.core_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_core_contacts_email   ON public.core_contacts(email);
CREATE INDEX IF NOT EXISTS idx_core_contacts_type    ON public.core_contacts(contact_type);

ALTER TABLE public.core_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "core_contacts: owner full access" ON public.core_contacts;
CREATE POLICY "core_contacts: owner full access"
  ON public.core_contacts FOR ALL
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "core_contacts: org members read" ON public.core_contacts;
CREATE POLICY "core_contacts: org members read"
  ON public.core_contacts FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anonymous access to core_contacts" ON public.core_contacts;
CREATE POLICY "Deny anonymous access to core_contacts"
  ON public.core_contacts FOR ALL TO anon USING (false);

-- updated_at Trigger
CREATE OR REPLACE FUNCTION public.update_core_contacts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_core_contacts_updated_at ON public.core_contacts;
CREATE TRIGGER trg_core_contacts_updated_at
  BEFORE UPDATE ON public.core_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_core_contacts_updated_at();


-- ── 2. core_addresses ────────────────────────────────────────
-- Zentrale Adressverwaltung (normalisiert, Google-Maps-kompatibel)
CREATE TABLE IF NOT EXISTS public.core_addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Strukturierte Adressfelder (Google Places API kompatibel)
  street          TEXT NOT NULL,
  house_number    TEXT,
  postal_code     TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT,
  country         TEXT NOT NULL DEFAULT 'Deutschland',
  -- Geocoding (optional, für Karten)
  latitude        NUMERIC(10, 7),
  longitude       NUMERIC(10, 7),
  -- Google Places ID für spätere Anreicherung
  google_place_id TEXT,
  -- Formatierte Adresse (von Google zurückgegeben)
  formatted       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_core_addresses_owner       ON public.core_addresses(owner_id);
CREATE INDEX IF NOT EXISTS idx_core_addresses_postal_city ON public.core_addresses(postal_code, city);

ALTER TABLE public.core_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "core_addresses: owner full access" ON public.core_addresses;
CREATE POLICY "core_addresses: owner full access"
  ON public.core_addresses FOR ALL
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Deny anonymous access to core_addresses" ON public.core_addresses;
CREATE POLICY "Deny anonymous access to core_addresses"
  ON public.core_addresses FOR ALL TO anon USING (false);

-- updated_at Trigger
CREATE OR REPLACE FUNCTION public.update_core_addresses_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_core_addresses_updated_at ON public.core_addresses;
CREATE TRIGGER trg_core_addresses_updated_at
  BEFORE UPDATE ON public.core_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_core_addresses_updated_at();


-- ── 3. core_contact_addresses ────────────────────────────────
-- n:m Verknüpfung: Ein Kontakt kann mehrere Adressen haben
-- (Wohnadresse, Rechnungsadresse, Lieferadresse)
CREATE TABLE IF NOT EXISTS public.core_contact_addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   UUID NOT NULL REFERENCES public.core_contacts(id) ON DELETE CASCADE,
  address_id   UUID NOT NULL REFERENCES public.core_addresses(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'primary'
               CHECK (address_type IN ('primary', 'billing', 'shipping', 'previous')),
  is_primary   BOOLEAN NOT NULL DEFAULT false,
  valid_from   DATE,
  valid_until  DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, address_id, address_type)
);

CREATE INDEX IF NOT EXISTS idx_core_contact_addresses_contact ON public.core_contact_addresses(contact_id);
CREATE INDEX IF NOT EXISTS idx_core_contact_addresses_address ON public.core_contact_addresses(address_id);

ALTER TABLE public.core_contact_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "core_contact_addresses: owner access via contact" ON public.core_contact_addresses;
CREATE POLICY "core_contact_addresses: owner access via contact"
  ON public.core_contact_addresses FOR ALL
  USING (
    contact_id IN (
      SELECT id FROM public.core_contacts WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deny anonymous access to core_contact_addresses" ON public.core_contact_addresses;
CREATE POLICY "Deny anonymous access to core_contact_addresses"
  ON public.core_contact_addresses FOR ALL TO anon USING (false);


-- ── 4. Fremdschlüssel: tenants → core_contacts ───────────────
-- Vermietify: Mieter referenzieren einen core_contact
-- (nullable für Rückwärtskompatibilität – bestehende Mieter bleiben erhalten)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS core_contact_id UUID
    REFERENCES public.core_contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_core_contact ON public.tenants(core_contact_id);


-- ── 5. Fremdschlüssel: biz_clients → core_contacts ───────────
-- Financial Compass: Kunden referenzieren einen core_contact
ALTER TABLE public.biz_clients
  ADD COLUMN IF NOT EXISTS core_contact_id UUID
    REFERENCES public.core_contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_biz_clients_core_contact ON public.biz_clients(core_contact_id);


-- ── 6. Fremdschlüssel: buildings → core_addresses ────────────
-- Vermietify: Gebäude referenzieren eine core_address
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS core_address_id UUID
    REFERENCES public.core_addresses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_buildings_core_address ON public.buildings(core_address_id);


-- ── 7. Fremdschlüssel: biz_businesses → core_contacts ────────
-- Financial Compass: Eigene Firma referenziert einen core_contact (Firmenprofil)
ALTER TABLE public.biz_businesses
  ADD COLUMN IF NOT EXISTS core_contact_id UUID
    REFERENCES public.core_contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_biz_businesses_core_contact ON public.biz_businesses(core_contact_id);


-- ── 8. SecondBrain: entity_type 'core_contact' + 'core_address' erlauben ──
-- Die sb_document_entity_links Tabelle hat einen CHECK auf entity_type.
-- Wir erweitern ihn um die neuen Core-Entitäten.
-- (Idempotent: Constraint wird neu gesetzt)
ALTER TABLE public.sb_document_entity_links
  DROP CONSTRAINT IF EXISTS sb_document_entity_links_entity_type_check;

ALTER TABLE public.sb_document_entity_links
  ADD CONSTRAINT sb_document_entity_links_entity_type_check
  CHECK (entity_type IN (
    'building', 'unit', 'tenant', 'meter', 'lease',
    'expense', 'invoice', 'client', 'business',
    'core_contact', 'core_address'
  ));


-- ── 9. RPC: Kontakt mit allen Verknüpfungen abrufen ──────────
CREATE OR REPLACE FUNCTION public.get_contact_full(p_contact_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact   JSONB;
  v_addresses JSONB;
  v_docs      JSONB;
BEGIN
  -- Sicherheitsprüfung
  IF NOT EXISTS (
    SELECT 1 FROM public.core_contacts
    WHERE id = p_contact_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT to_jsonb(c) INTO v_contact
  FROM public.core_contacts c
  WHERE c.id = p_contact_id;

  SELECT jsonb_agg(to_jsonb(a) || jsonb_build_object('address_type', ca.address_type, 'is_primary', ca.is_primary))
  INTO v_addresses
  FROM public.core_contact_addresses ca
  JOIN public.core_addresses a ON a.id = ca.address_id
  WHERE ca.contact_id = p_contact_id;

  SELECT jsonb_agg(to_jsonb(d))
  INTO v_docs
  FROM public.sb_document_entity_links l
  JOIN public.sb_documents d ON d.id = l.document_id
  WHERE l.entity_type = 'core_contact' AND l.entity_id = p_contact_id;

  RETURN v_contact
    || jsonb_build_object('addresses', COALESCE(v_addresses, '[]'::jsonb))
    || jsonb_build_object('documents', COALESCE(v_docs, '[]'::jsonb));
END;
$$;


-- ── 10. RPC: Kontakt suchen (für ContactSelector UI) ─────────
CREATE OR REPLACE FUNCTION public.search_contacts(
  p_query TEXT,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id           UUID,
  contact_type TEXT,
  display_name TEXT,
  email        TEXT,
  phone        TEXT,
  company_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.contact_type,
    CASE
      WHEN c.contact_type = 'company' THEN c.company_name
      ELSE trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, ''))
    END AS display_name,
    c.email,
    c.phone,
    c.company_name
  FROM public.core_contacts c
  WHERE c.owner_id = auth.uid()
    AND (
      p_query IS NULL OR p_query = ''
      OR c.first_name ILIKE '%' || p_query || '%'
      OR c.last_name  ILIKE '%' || p_query || '%'
      OR c.company_name ILIKE '%' || p_query || '%'
      OR c.email ILIKE '%' || p_query || '%'
    )
  ORDER BY display_name
  LIMIT p_limit;
END;
$$;
