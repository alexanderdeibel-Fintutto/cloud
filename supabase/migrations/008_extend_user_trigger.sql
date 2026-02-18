-- Migration 008: Extend User Trigger
-- Erstellt bei neuer Registrierung sowohl users- als auch profiles-Eintrag
-- und verknüpft ggf. bestehende Mieter-Einträge

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- users-Eintrag erstellen (Checker Credits)
    INSERT INTO public.users (id, email, name, tier, checks_used, checks_limit)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        'free',
        0,
        3
    );

    -- profiles-Eintrag erstellen (erweitertes Profil)
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'vermieter')
    );

    -- Wenn Email in tenants existiert: Mieter-Account verknüpfen
    UPDATE public.tenants
    SET user_id = NEW.id
    WHERE email = NEW.email
      AND user_id IS NULL
      AND is_active = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Manuelles Verknüpfen eines Mieter-Accounts
CREATE OR REPLACE FUNCTION public.link_tenant_account(p_tenant_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.tenants
    SET user_id = auth.uid()
    WHERE email = p_tenant_email
      AND user_id IS NULL
      AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
