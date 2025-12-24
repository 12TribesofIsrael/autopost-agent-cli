-- Allow anyone to submit beta access requests (video_requests from landing page)
CREATE POLICY "Anyone can submit beta requests"
ON public.video_requests
FOR INSERT
WITH CHECK (true);