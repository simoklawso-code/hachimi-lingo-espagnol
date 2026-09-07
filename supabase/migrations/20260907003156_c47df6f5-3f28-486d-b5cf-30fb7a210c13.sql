CREATE POLICY "no client access to app_config"
ON public.app_config
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);