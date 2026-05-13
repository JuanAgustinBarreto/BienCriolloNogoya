
CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  nombre text NOT NULL,
  role text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read usuarios" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "public insert usuarios" ON public.usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "public update usuarios" ON public.usuarios FOR UPDATE USING (true);
CREATE POLICY "public delete usuarios" ON public.usuarios FOR DELETE USING (true);

INSERT INTO public.usuarios (username, password, nombre, role) VALUES
  ('diego', 'diego123', 'Diego', 'admin'),
  ('ariel', 'ariel123', 'Ariel', 'admin'),
  ('usuario', '1234', 'Usuario General', 'general')
ON CONFLICT (username) DO NOTHING;
