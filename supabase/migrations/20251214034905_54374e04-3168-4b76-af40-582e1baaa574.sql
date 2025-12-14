-- Add file_name column to video_requests table
ALTER TABLE public.video_requests 
ADD COLUMN file_name text;