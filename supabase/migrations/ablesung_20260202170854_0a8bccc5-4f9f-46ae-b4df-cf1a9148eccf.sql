-- =====================================================
-- Add missing DELETE/UPDATE RLS policies
-- =====================================================

-- 1. Documents: Allow users to UPDATE and DELETE their own documents
CREATE POLICY "Users can update own documents"
ON public.documents
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
ON public.documents
FOR DELETE
USING (user_id = auth.uid());

-- 2. Tasks: Allow task creators to DELETE their own tasks
CREATE POLICY "Task creators can delete own tasks"
ON public.tasks
FOR DELETE
USING (created_by = auth.uid());

-- 3. Messages: Allow senders to DELETE their own messages
CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
USING (sender_id = auth.uid());

-- 4. Meter Readings: Allow users to UPDATE their own unverified readings
CREATE POLICY "Users can update own unverified readings"
ON public.meter_readings
FOR UPDATE
USING (
  submitted_by = auth.uid() 
  AND is_verified = false
  AND user_can_access_meter(meter_id)
);