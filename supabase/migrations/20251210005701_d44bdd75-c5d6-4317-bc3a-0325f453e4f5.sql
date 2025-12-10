-- Create video_requests table
CREATE TABLE public.video_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  video_link TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  frequency TEXT NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_requests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all video requests
CREATE POLICY "Authenticated users can view all video requests"
ON public.video_requests
FOR SELECT
TO authenticated
USING (true);

-- Users can only insert their own video requests
CREATE POLICY "Users can insert own video requests"
ON public.video_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own video requests
CREATE POLICY "Users can update own video requests"
ON public.video_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can only delete their own video requests
CREATE POLICY "Users can delete own video requests"
ON public.video_requests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_video_requests_updated_at
BEFORE UPDATE ON public.video_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();