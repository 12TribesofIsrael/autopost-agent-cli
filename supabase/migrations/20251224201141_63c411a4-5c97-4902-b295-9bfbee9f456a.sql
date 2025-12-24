-- Add approval workflow columns to video_requests table
ALTER TABLE public.video_requests 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS intake_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS intake_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Create index for faster lookup by intake token
CREATE INDEX IF NOT EXISTS idx_video_requests_intake_token ON public.video_requests(intake_token);
CREATE INDEX IF NOT EXISTS idx_video_requests_status ON public.video_requests(status);

-- Add RLS policy for admins to view all beta requests
CREATE POLICY "Admins can view all beta requests"
ON public.video_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to update beta requests (approve/reject)
CREATE POLICY "Admins can update beta requests"
ON public.video_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow access to intake form via valid token (for unauthenticated users)
CREATE POLICY "Anyone can view their own request via token"
ON public.video_requests
FOR SELECT
USING (intake_token IS NOT NULL AND status = 'approved');