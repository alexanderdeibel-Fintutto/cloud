-- Migration 007: Row Level Security Policies
-- Steuert, welche App/Rolle welche Daten sehen und bearbeiten kann

-- ============ PROFILES ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============ PROPERTIES ============
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Eigentümer: voller Zugriff auf eigene Properties
CREATE POLICY "properties_owner_all" ON public.properties
    FOR ALL USING (auth.uid() = user_id);

-- Mieter: Leserecht auf die Property ihrer Wohnung
CREATE POLICY "properties_tenant_select" ON public.properties
    FOR SELECT USING (
        id IN (
            SELECT p.id FROM public.properties p
            JOIN public.units u ON u.property_id = p.id
            JOIN public.tenants t ON t.unit_id = u.id
            WHERE t.user_id = auth.uid() AND t.is_active = true
        )
    );

-- Hausmeister: Leserecht auf Properties mit zugewiesenen Tasks
CREATE POLICY "properties_caretaker_select" ON public.properties
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT property_id FROM public.tasks
            WHERE assigned_to = auth.uid()
        )
    );

-- ============ UNITS ============
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_owner_all" ON public.units
    FOR ALL USING (
        property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
    );

CREATE POLICY "units_tenant_select" ON public.units
    FOR SELECT USING (
        id IN (SELECT unit_id FROM public.tenants WHERE user_id = auth.uid() AND is_active = true)
    );

-- ============ TENANTS ============
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_landlord_all" ON public.tenants
    FOR ALL USING (landlord_id = auth.uid());

CREATE POLICY "tenants_self_select" ON public.tenants
    FOR SELECT USING (user_id = auth.uid());

-- ============ RENTAL CONTRACTS ============
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_landlord_all" ON public.rental_contracts
    FOR ALL USING (
        unit_id IN (
            SELECT u.id FROM public.units u
            JOIN public.properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "contracts_tenant_select" ON public.rental_contracts
    FOR SELECT USING (
        tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
    );

-- ============ PAYMENTS ============
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_landlord_all" ON public.payments
    FOR ALL USING (
        contract_id IN (
            SELECT rc.id FROM public.rental_contracts rc
            JOIN public.units u ON u.id = rc.unit_id
            JOIN public.properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "payments_tenant_select" ON public.payments
    FOR SELECT USING (
        tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
    );

-- ============ METERS ============
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meters_owner_all" ON public.meters
    FOR ALL USING (
        unit_id IN (
            SELECT u.id FROM public.units u
            JOIN public.properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "meters_tenant_select" ON public.meters
    FOR SELECT USING (
        unit_id IN (
            SELECT unit_id FROM public.tenants
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============ METER READINGS ============
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readings_owner_all" ON public.meter_readings
    FOR ALL USING (
        meter_id IN (
            SELECT m.id FROM public.meters m
            JOIN public.units u ON u.id = m.unit_id
            JOIN public.properties p ON p.id = u.property_id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "readings_tenant_select" ON public.meter_readings
    FOR SELECT USING (
        meter_id IN (
            SELECT m.id FROM public.meters m
            WHERE m.unit_id IN (
                SELECT unit_id FROM public.tenants
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

CREATE POLICY "readings_tenant_insert" ON public.meter_readings
    FOR INSERT WITH CHECK (
        read_by = auth.uid() AND
        meter_id IN (
            SELECT m.id FROM public.meters m
            WHERE m.unit_id IN (
                SELECT unit_id FROM public.tenants
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

-- ============ MAINTENANCE REQUESTS ============
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_owner_all" ON public.maintenance_requests
    FOR ALL USING (
        property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
    );

CREATE POLICY "maintenance_reporter_select" ON public.maintenance_requests
    FOR SELECT USING (reported_by = auth.uid());

CREATE POLICY "maintenance_reporter_insert" ON public.maintenance_requests
    FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "maintenance_caretaker_select" ON public.maintenance_requests
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "maintenance_caretaker_update" ON public.maintenance_requests
    FOR UPDATE USING (assigned_to = auth.uid());

-- ============ TASKS ============
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_owner_all" ON public.tasks
    FOR ALL USING (
        property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
    );

CREATE POLICY "tasks_assignee_select" ON public.tasks
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "tasks_assignee_update" ON public.tasks
    FOR UPDATE USING (assigned_to = auth.uid());

-- ============ DOCUMENTS ============
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_owner_all" ON public.documents
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "documents_tenant_select" ON public.documents
    FOR SELECT USING (
        tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
        OR unit_id IN (
            SELECT unit_id FROM public.tenants
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============ TAX NOTICES ============
ALTER TABLE public.tax_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_notices_owner_all" ON public.tax_notices
    FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.tax_notice_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_checks_owner_select" ON public.tax_notice_checks
    FOR SELECT USING (
        tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
    );

CREATE POLICY "tax_checks_owner_insert" ON public.tax_notice_checks
    FOR INSERT WITH CHECK (
        tax_notice_id IN (SELECT id FROM public.tax_notices WHERE user_id = auth.uid())
    );
