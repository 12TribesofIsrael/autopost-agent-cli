-- Allow inserts from service role (edge function) without requiring user_id
CREATE POLICY "Service role can insert video requests"
ON public.video_requests
FOR INSERT
TO service_role
WITH CHECK (true);
