-- Allow admins to view all workflows
CREATE POLICY "Admins can view all workflows" 
ON public.workflows 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));