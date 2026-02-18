-- FIX: Messages cross-organization access vulnerability
-- Add organization-level validation to ensure messages stay within org boundaries

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages within org" ON public.messages;
DROP POLICY IF EXISTS "Recipients can update read status" ON public.messages;

-- View policy: Users can only view messages where both sender and recipient are in their org
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
    AND get_user_org_id(sender_id) = get_user_org_id(auth.uid())
    AND get_user_org_id(recipient_id) = get_user_org_id(auth.uid())
  );

-- Insert policy: Users can only send messages to recipients in the same org
CREATE POLICY "Users can send messages within org" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND get_user_org_id(recipient_id) = get_user_org_id(auth.uid())
  );

-- Update policy: Recipients can only update messages within same org
CREATE POLICY "Recipients can update read status" ON public.messages
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND recipient_id = auth.uid()
    AND get_user_org_id(sender_id) = get_user_org_id(auth.uid())
  );