-- Add driveUploadStatus column with default value 'pending'
ALTER TABLE public.video_requests
ADD COLUMN drive_upload_status text NOT NULL DEFAULT 'pending';