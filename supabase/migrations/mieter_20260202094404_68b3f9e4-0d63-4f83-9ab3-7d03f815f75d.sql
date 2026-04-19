-- Add DELETE policies for storage buckets
-- Allow users to delete their own issue images
CREATE POLICY "Users can delete own issue images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'issue-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own meter images
CREATE POLICY "Users can delete own meter images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'meter-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix message recipient validation: restrict messages to same organization
-- First drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Create new policy that validates recipient is in same organization
CREATE POLICY "Users can send messages to org members" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  recipient_id IN (
    SELECT p.user_id FROM profiles p
    WHERE p.organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);