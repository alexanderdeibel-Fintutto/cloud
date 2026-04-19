-- Add INSERT policy for payments table
CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());