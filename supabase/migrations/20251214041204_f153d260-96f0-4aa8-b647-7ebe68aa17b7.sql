-- Add column to store Google Drive file IDs
ALTER TABLE public.video_requests 
ADD COLUMN drive_file_ids text[] DEFAULT '{}'::text[];