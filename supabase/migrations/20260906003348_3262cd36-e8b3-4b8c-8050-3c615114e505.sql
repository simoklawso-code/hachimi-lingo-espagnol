CREATE TABLE public.push_subscriptions (
  device_id TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  study_utc_time TEXT,
  last_study_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT, UPDATE ON public.push_subscriptions TO anon;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devices register themselves" ON public.push_subscriptions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "devices update themselves" ON public.push_subscriptions FOR UPDATE TO anon USING (true) WITH CHECK (true);