ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.leads ALTER COLUMN investment_range SET DEFAULT 'no_aplicado';
COMMENT ON COLUMN public.leads.investment_range IS 'DEPRECATED: la pregunta actual es direccion; usar address.';
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at desc);