-- ============================================================
-- Migration: Core Entities Views & Convenience Queries
-- Erstellt: 2026-04-18
-- Zweck: Abwärtskompatible Views, die bestehende App-Abfragen
--        mit den neuen Core-Entity-Daten anreichern.
-- ============================================================
-- Diese Views erlauben es, dass bestehende Frontend-Abfragen
-- weiterhin funktionieren, während sie gleichzeitig die
-- Core-Entity-Daten (wenn vorhanden) bevorzugen.
-- ============================================================

-- ── 1. v_tenants_full ────────────────────────────────────────
-- Vermietify: Mieter mit Core-Contact-Daten angereichert
-- Wenn core_contact_id gesetzt ist, werden dessen Daten bevorzugt.
-- Sonst fallen wir auf die lokalen Felder zurück (Rückwärtskompatibilität).
CREATE OR REPLACE VIEW public.v_tenants_full
  WITH (security_invoker = true) AS
SELECT
  t.id,
  t.organization_id,
  t.core_contact_id,
  -- Name: Core-Contact bevorzugen
  COALESCE(cc.first_name, t.first_name)                    AS first_name,
  COALESCE(cc.last_name,  t.last_name)                     AS last_name,
  -- Kontakt: Core-Contact bevorzugen
  COALESCE(cc.email,  t.email)                             AS email,
  COALESCE(cc.phone,  t.phone)                             AS phone,
  -- Adresse: Core-Contact-Primäradresse bevorzugen
  COALESCE(ca.street,      t.address)                      AS address,
  COALESCE(ca.city,        t.city)                         AS city,
  COALESCE(ca.postal_code, t.postal_code)                  AS postal_code,
  -- Nur in Core-Contact verfügbar
  cc.mobile,
  cc.iban,
  cc.bank_name,
  cc.tax_id,
  cc.tags,
  -- Originale Tenant-Felder
  t.birth_date,
  t.household_size,
  t.previous_landlord,
  t.notes,
  t.created_at,
  t.updated_at
FROM public.tenants t
LEFT JOIN public.core_contacts cc ON cc.id = t.core_contact_id
LEFT JOIN public.core_contact_addresses cca
  ON cca.contact_id = t.core_contact_id AND cca.is_primary = true
LEFT JOIN public.core_addresses ca ON ca.id = cca.address_id;


-- ── 2. v_clients_full ────────────────────────────────────────
-- Financial Compass: Kunden mit Core-Contact-Daten angereichert
CREATE OR REPLACE VIEW public.v_clients_full
  WITH (security_invoker = true) AS
SELECT
  bc.id,
  bc.business_id,
  bc.core_contact_id,
  -- Name/Firma: Core-Contact bevorzugen
  COALESCE(cc.company_name, bc.company, bc.name)           AS company,
  COALESCE(
    CASE WHEN cc.contact_type = 'person'
      THEN trim(coalesce(cc.first_name,'') || ' ' || coalesce(cc.last_name,''))
    END,
    bc.name
  )                                                         AS name,
  -- Kontakt: Core-Contact bevorzugen
  COALESCE(cc.email,  bc.email)                            AS email,
  COALESCE(cc.phone,  bc.phone)                            AS phone,
  -- Adresse: Core-Contact-Primäradresse bevorzugen
  COALESCE(
    jsonb_build_object(
      'street',      ca.street,
      'house_number',ca.house_number,
      'postal_code', ca.postal_code,
      'city',        ca.city,
      'country',     ca.country
    ),
    bc.address
  )                                                         AS address,
  -- Steuer: Core-Contact bevorzugen
  COALESCE(cc.tax_id, bc.tax_id)                           AS tax_id,
  -- Nur in Core-Contact verfügbar
  cc.vat_id,
  cc.iban,
  cc.bank_name,
  cc.mobile,
  cc.tags,
  -- Originale biz_clients-Felder
  bc.notes,
  bc.created_at
FROM public.biz_clients bc
LEFT JOIN public.core_contacts cc ON cc.id = bc.core_contact_id
LEFT JOIN public.core_contact_addresses cca
  ON cca.contact_id = bc.core_contact_id AND cca.is_primary = true
LEFT JOIN public.core_addresses ca ON ca.id = cca.address_id;


-- ── 3. v_contacts_unified ────────────────────────────────────
-- Cross-App: Alle Kontakte mit ihren Rollen in allen Apps
-- Zeigt, ob ein Kontakt Mieter, Kunde oder beides ist.
CREATE OR REPLACE VIEW public.v_contacts_unified
  WITH (security_invoker = true) AS
SELECT
  cc.id,
  cc.owner_id,
  cc.organization_id,
  cc.contact_type,
  CASE
    WHEN cc.contact_type = 'company' THEN cc.company_name
    ELSE trim(coalesce(cc.first_name,'') || ' ' || coalesce(cc.last_name,''))
  END                                                       AS display_name,
  cc.first_name,
  cc.last_name,
  cc.company_name,
  cc.email,
  cc.phone,
  cc.mobile,
  cc.iban,
  cc.bank_name,
  cc.tax_id,
  cc.vat_id,
  cc.tags,
  cc.notes,
  -- Rollen in anderen Apps
  EXISTS(SELECT 1 FROM public.tenants t WHERE t.core_contact_id = cc.id)       AS is_tenant,
  EXISTS(SELECT 1 FROM public.biz_clients bc WHERE bc.core_contact_id = cc.id) AS is_biz_client,
  EXISTS(SELECT 1 FROM public.biz_businesses bb WHERE bb.core_contact_id = cc.id) AS is_business,
  -- Anzahl verknüpfter Dokumente
  (SELECT COUNT(*) FROM public.sb_document_entity_links l
   WHERE l.entity_type = 'core_contact' AND l.entity_id = cc.id)               AS document_count,
  -- Primäradresse
  ca.street,
  ca.house_number,
  ca.postal_code,
  ca.city,
  ca.country,
  ca.formatted                                              AS address_formatted,
  cc.created_at,
  cc.updated_at
FROM public.core_contacts cc
LEFT JOIN public.core_contact_addresses cca
  ON cca.contact_id = cc.id AND cca.is_primary = true
LEFT JOIN public.core_addresses ca ON ca.id = cca.address_id;


-- ── 4. v_buildings_full ──────────────────────────────────────
-- Vermietify: Gebäude mit Core-Address-Daten angereichert
CREATE OR REPLACE VIEW public.v_buildings_full
  WITH (security_invoker = true) AS
SELECT
  b.id,
  b.organization_id,
  b.core_address_id,
  b.name,
  -- Adresse: Core-Address bevorzugen
  COALESCE(ca.street || ' ' || COALESCE(ca.house_number,''), b.address)  AS address,
  COALESCE(ca.street,      b.address)                                    AS street,
  ca.house_number,
  COALESCE(ca.postal_code, b.postal_code)                                AS postal_code,
  COALESCE(ca.city,        b.city)                                       AS city,
  COALESCE(ca.country,     'Deutschland')                                AS country,
  ca.latitude,
  ca.longitude,
  ca.google_place_id,
  ca.formatted                                                           AS address_formatted,
  -- Originale Gebäude-Felder
  b.building_type,
  b.total_area,
  b.year_built,
  b.notes,
  b.created_at,
  b.updated_at
FROM public.buildings b
LEFT JOIN public.core_addresses ca ON ca.id = b.core_address_id;


-- ── 5. RPC: Kontakt aus Mieter erstellen/verknüpfen ──────────
-- Hilfsfunktion: Erstellt einen core_contact aus einem Mieter
-- und verknüpft ihn (idempotent – macht nichts wenn schon verknüpft)
CREATE OR REPLACE FUNCTION public.sync_tenant_to_core_contact(p_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant        RECORD;
  v_contact_id    UUID;
  v_address_id    UUID;
BEGIN
  -- Tenant laden
  SELECT * INTO v_tenant FROM public.tenants WHERE id = p_tenant_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tenant not found'; END IF;

  -- Wenn bereits verknüpft, ID zurückgeben
  IF v_tenant.core_contact_id IS NOT NULL THEN
    RETURN v_tenant.core_contact_id;
  END IF;

  -- Prüfen ob Kontakt mit gleicher E-Mail bereits existiert
  IF v_tenant.email IS NOT NULL THEN
    SELECT id INTO v_contact_id
    FROM public.core_contacts
    WHERE owner_id = auth.uid()
      AND email = v_tenant.email
    LIMIT 1;
  END IF;

  -- Neuen Kontakt erstellen falls nicht gefunden
  IF v_contact_id IS NULL THEN
    INSERT INTO public.core_contacts (
      owner_id, organization_id, contact_type,
      first_name, last_name, email, phone, notes
    ) VALUES (
      auth.uid(),
      v_tenant.organization_id,
      'person',
      v_tenant.first_name,
      v_tenant.last_name,
      v_tenant.email,
      v_tenant.phone,
      v_tenant.notes
    )
    RETURNING id INTO v_contact_id;

    -- Adresse migrieren falls vorhanden
    IF v_tenant.address IS NOT NULL AND v_tenant.city IS NOT NULL THEN
      INSERT INTO public.core_addresses (
        owner_id, street, postal_code, city
      ) VALUES (
        auth.uid(),
        v_tenant.address,
        COALESCE(v_tenant.postal_code, ''),
        v_tenant.city
      )
      RETURNING id INTO v_address_id;

      INSERT INTO public.core_contact_addresses (
        contact_id, address_id, address_type, is_primary
      ) VALUES (
        v_contact_id, v_address_id, 'primary', true
      );
    END IF;
  END IF;

  -- Tenant verknüpfen
  UPDATE public.tenants
  SET core_contact_id = v_contact_id
  WHERE id = p_tenant_id;

  RETURN v_contact_id;
END;
$$;


-- ── 6. RPC: Kunde aus biz_client erstellen/verknüpfen ────────
CREATE OR REPLACE FUNCTION public.sync_biz_client_to_core_contact(p_client_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client        RECORD;
  v_contact_id    UUID;
  v_address_id    UUID;
  v_addr          JSONB;
BEGIN
  SELECT * INTO v_client FROM public.biz_clients WHERE id = p_client_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Client not found'; END IF;

  IF v_client.core_contact_id IS NOT NULL THEN
    RETURN v_client.core_contact_id;
  END IF;

  -- Prüfen ob Kontakt mit gleicher E-Mail bereits existiert
  IF v_client.email IS NOT NULL THEN
    SELECT id INTO v_contact_id
    FROM public.core_contacts
    WHERE owner_id = auth.uid()
      AND email = v_client.email
    LIMIT 1;
  END IF;

  IF v_contact_id IS NULL THEN
    INSERT INTO public.core_contacts (
      owner_id, contact_type,
      first_name, last_name, company_name,
      email, phone, tax_id, notes
    ) VALUES (
      auth.uid(),
      CASE WHEN v_client.company IS NOT NULL THEN 'company' ELSE 'person' END,
      split_part(v_client.name, ' ', 1),
      CASE WHEN position(' ' IN v_client.name) > 0
        THEN substring(v_client.name FROM position(' ' IN v_client.name) + 1)
        ELSE NULL END,
      v_client.company,
      v_client.email,
      v_client.phone,
      v_client.tax_id,
      v_client.notes
    )
    RETURNING id INTO v_contact_id;

    -- Adresse aus JSONB migrieren
    v_addr := v_client.address;
    IF v_addr IS NOT NULL AND v_addr->>'city' IS NOT NULL THEN
      INSERT INTO public.core_addresses (
        owner_id, street, postal_code, city, country
      ) VALUES (
        auth.uid(),
        COALESCE(v_addr->>'street', ''),
        COALESCE(v_addr->>'postal_code', ''),
        v_addr->>'city',
        COALESCE(v_addr->>'country', 'Deutschland')
      )
      RETURNING id INTO v_address_id;

      INSERT INTO public.core_contact_addresses (
        contact_id, address_id, address_type, is_primary
      ) VALUES (
        v_contact_id, v_address_id, 'billing', true
      );
    END IF;
  END IF;

  UPDATE public.biz_clients
  SET core_contact_id = v_contact_id
  WHERE id = p_client_id;

  RETURN v_contact_id;
END;
$$;
