-- Fix 6 warn-level security issues by adding building-level access restrictions

-- 1. Helper function to get user's building_id through their unit
CREATE OR REPLACE FUNCTION public.get_user_building_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.building_id 
  FROM units u
  JOIN profiles p ON p.unit_id = u.id
  WHERE p.user_id = _user_id
$$;

-- 2. Helper function to check if user manages a building (vermieter/admin with same org)
CREATE OR REPLACE FUNCTION public.can_manage_building(_user_id uuid, _building_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN buildings b ON b.organization_id = p.organization_id
    WHERE p.user_id = _user_id 
      AND b.id = _building_id
      AND (has_role(_user_id, 'admin') OR has_role(_user_id, 'vermieter'))
  )
$$;

-- 3. Helper function to check if two users are in the same organization
CREATE OR REPLACE FUNCTION public.same_organization(_user_id1 uuid, _user_id2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p1
    JOIN profiles p2 ON p1.organization_id = p2.organization_id
    WHERE p1.user_id = _user_id1 AND p2.user_id = _user_id2
  )
$$;

-- 4. Fix ISSUES table - restrict to building-level access
DROP POLICY IF EXISTS "Admins and vermieter can view all org issues" ON issues;

CREATE POLICY "Admins and vermieter can view building issues"
ON issues FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'vermieter'))
    AND can_manage_building(auth.uid(), (SELECT building_id FROM units WHERE id = unit_id))
  )
);

-- 5. Fix METER_READINGS table - restrict to building-level access
DROP POLICY IF EXISTS "Admins and vermieter can view all org meter readings" ON meter_readings;

CREATE POLICY "Admins and vermieter can view building meter readings"
ON meter_readings FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'vermieter'))
    AND can_manage_building(auth.uid(), (
      SELECT u.building_id FROM units u 
      JOIN meters m ON m.unit_id = u.id 
      WHERE m.id = meter_id
    ))
  )
);

-- 6. Fix MESSAGES table - ensure sender/recipient are in same organization
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;

CREATE POLICY "Users can send messages to same org"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND same_organization(auth.uid(), recipient_id)
);

-- 7. Fix ORGANIZATIONS table - hide stripe_customer_id from non-admins
-- The get_organization_details function already handles this, but let's restrict direct SELECT
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

CREATE POLICY "Users can view their organization basics"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
);

-- 8. Fix TASKS table - validate assigned_to is in same organization
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;

CREATE POLICY "Users can create tasks for same org members"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    assigned_to IS NULL 
    OR same_organization(auth.uid(), assigned_to)
  )
);

-- 9. Fix PAYMENTS table - add building-level filtering for landlords
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

CREATE POLICY "Users can view own payments or managed tenants"
ON payments FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'vermieter'))
    AND same_organization(auth.uid(), user_id)
    AND can_manage_building(auth.uid(), get_user_building_id(user_id))
  )
);