-- Drop the overly permissive SELECT policy
DROP POLICY "Authenticated users can view all video requests" ON public.video_requests;

-- Create a secure policy where users can only see their own requests
CREATE POLICY "Users can view own video requests"
ON public.video_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);