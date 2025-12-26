-- Create table for secure platform credentials (only admins can view)
CREATE TABLE public.platform_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  two_factor_backup TEXT,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.platform_credentials ENABLE ROW LEVEL SECURITY;

-- Users can submit their own credentials
CREATE POLICY "Users can insert own credentials"
ON public.platform_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "Users can update own credentials"
ON public.platform_credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own credentials (but not the actual password - we'll handle this in the app)
CREATE POLICY "Users can view own credentials"
ON public.platform_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete own credentials"
ON public.platform_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all credentials (for setting up accounts)
CREATE POLICY "Admins can view all credentials"
ON public.platform_credentials
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update credentials status
CREATE POLICY "Admins can update credentials"
ON public.platform_credentials
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_platform_credentials_updated_at
BEFORE UPDATE ON public.platform_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint for social_connections to enable upsert
ALTER TABLE public.social_connections 
ADD CONSTRAINT social_connections_user_platform_unique UNIQUE (user_id, platform);