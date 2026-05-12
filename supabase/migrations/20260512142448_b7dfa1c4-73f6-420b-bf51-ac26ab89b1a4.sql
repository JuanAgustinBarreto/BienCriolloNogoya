
CREATE TABLE public.ventas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor TEXT NOT NULL,
  variedad TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  negocio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gastos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  responsable TEXT NOT NULL,
  monto NUMERIC NOT NULL DEFAULT 0,
  donde_compro TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read ventas" ON public.ventas FOR SELECT USING (true);
CREATE POLICY "public insert ventas" ON public.ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "public update ventas" ON public.ventas FOR UPDATE USING (true);
CREATE POLICY "public delete ventas" ON public.ventas FOR DELETE USING (true);

CREATE POLICY "public read gastos" ON public.gastos FOR SELECT USING (true);
CREATE POLICY "public insert gastos" ON public.gastos FOR INSERT WITH CHECK (true);
CREATE POLICY "public update gastos" ON public.gastos FOR UPDATE USING (true);
CREATE POLICY "public delete gastos" ON public.gastos FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.ventas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos;
