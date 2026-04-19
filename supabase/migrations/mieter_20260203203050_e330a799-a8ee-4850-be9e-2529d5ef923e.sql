-- Fix warn-level security issues: Add TO authenticated to block anonymous access

-- =====================
-- ISSUES TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view own issues" ON issues;
DROP POLICY IF EXISTS "Users can create issues" ON issues;
DROP POLICY IF EXISTS "Users can update own issues" ON issues;

CREATE POLICY "Users can view own issues"
ON issues FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create issues"
ON issues FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own issues"
ON issues FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow vermieter/admin to view org member issues
CREATE POLICY "Org admins can view member issues"
ON issues FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  AND user_id IN (
    SELECT p.user_id FROM profiles p
    WHERE p.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- =====================
-- METER_READINGS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view own meter readings" ON meter_readings;
DROP POLICY IF EXISTS "Users can create meter readings" ON meter_readings;
DROP POLICY IF EXISTS "Vermieter can verify meter readings" ON meter_readings;

CREATE POLICY "Users can view own meter readings"
ON meter_readings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create meter readings"
ON meter_readings FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()) AND ((is_verified IS NULL) OR (is_verified = false)));

CREATE POLICY "Vermieter can verify meter readings"
ON meter_readings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow vermieter/admin to view org member meter readings
CREATE POLICY "Org admins can view member meter readings"
ON meter_readings FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vermieter'::app_role))
  AND user_id IN (
    SELECT p.user_id FROM profiles p
    WHERE p.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- =====================
-- BUILDINGS TABLE
-- =====================
DROP POLICY IF EXISTS "Org members can view buildings" ON buildings;
DROP POLICY IF EXISTS "Vermieter can manage buildings" ON buildings;

CREATE POLICY "Org members can view buildings"
ON buildings FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Vermieter can manage buildings"
ON buildings FOR ALL
TO authenticated
USING (
  (organization_id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid()))
  AND (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- =====================
-- UNITS TABLE
-- =====================
DROP POLICY IF EXISTS "Org members can view building units" ON units;
DROP POLICY IF EXISTS "Users can view their unit" ON units;
DROP POLICY IF EXISTS "Vermieter can manage units" ON units;

CREATE POLICY "Org members can view building units"
ON units FOR SELECT
TO authenticated
USING (building_id IN (
  SELECT b.id FROM buildings b
  WHERE b.organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can view their unit"
ON units FOR SELECT
TO authenticated
USING (id = get_user_unit_id());

CREATE POLICY "Vermieter can manage units"
ON units FOR ALL
TO authenticated
USING (
  (building_id IN (
    SELECT b.id FROM buildings b
    WHERE b.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  ))
  AND (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- =====================
-- TASKS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON tasks;

CREATE POLICY "Users can view assigned tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  (created_by = auth.uid()) 
  OR (assigned_to = auth.uid()) 
  OR (EXISTS (
    SELECT 1 FROM units u
    JOIN buildings b ON (u.building_id = b.id)
    WHERE (u.id = tasks.unit_id) AND (b.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    ))
  ))
);

CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update assigned tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid()) 
  OR (assigned_to = auth.uid()) 
  OR (has_role(auth.uid(), 'vermieter'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);