-- Drop the foreign key constraint to allow anonymous uploads
ALTER TABLE public.video_requests 
DROP CONSTRAINT IF EXISTS video_requests_user_id_fkey;

-- Make user_id nullable for anonymous uploads
ALTER TABLE public.video_requests 
ALTER COLUMN user_id DROP NOT NULL;