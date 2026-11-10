CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_name text NOT NULL,
  days_per_week integer NOT NULL,
  investment_range text NOT NULL,
  status text NOT NULL DEFAULT 'pending_contact',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier visitante puede enviar un lead"
ON public.leads FOR INSERT TO anon
WITH CHECK (true);