-- Drop the existing flawed policy
DROP POLICY IF EXISTS "Anyone can view their own request via token" ON public.video_requests;

-- Create a proper policy that allows querying by intake_token for approved requests
-- This allows the intake page to validate tokens without authentication
CREATE POLICY "Anyone can view approved request via intake token"
ON public.video_requests
FOR SELECT
USING (
  intake_token IS NOT NULL 
  AND status = 'approved'
);