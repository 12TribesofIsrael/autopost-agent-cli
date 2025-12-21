-- Add time_posted column for tracking when video was actually posted
ALTER TABLE public.video_requests 
ADD COLUMN IF NOT EXISTS time_posted timestamp with time zone DEFAULT NULL;

-- Make drive-related columns optional and add sensible defaults for the new flow
ALTER TABLE public.video_requests 
ALTER COLUMN video_link SET DEFAULT '',
ALTER COLUMN frequency SET DEFAULT 'once';