-- Allow admins to delete any video request
CREATE POLICY "Admins can delete video requests"
ON public.video_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));