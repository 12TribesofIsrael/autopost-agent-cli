-- Create intake_submissions table
CREATE TABLE public.intake_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  business_type TEXT NOT NULL,
  posting_frequency TEXT,
  pain_point TEXT,
  extra_notes TEXT,
  platforms JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (public can submit intake forms)
CREATE POLICY "Anyone can submit intake forms" 
ON public.intake_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing (only service role can view - for admin purposes)
CREATE POLICY "Service role can view intake submissions" 
ON public.intake_submissions 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_intake_submissions_updated_at
BEFORE UPDATE ON public.intake_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();