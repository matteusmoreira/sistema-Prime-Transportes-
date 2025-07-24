-- Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE 
SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Motorista')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Adicionar políticas para tabelas restantes
CREATE POLICY "Admins can manage motorista documentos" ON public.motorista_documentos
  FOR ALL USING (public.get_current_user_role() IN ('Administrador', 'Administração'));

CREATE POLICY "Motoristas can view their own documentos" ON public.motorista_documentos
  FOR SELECT USING (
    motorista_id IN (SELECT id FROM public.motoristas WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage corrida documentos" ON public.corrida_documentos
  FOR ALL USING (public.get_current_user_role() IN ('Administrador', 'Administração', 'Financeiro'));

CREATE POLICY "Users can view corrida documentos" ON public.corrida_documentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Motoristas can manage alerta leituras" ON public.alerta_leituras
  FOR ALL USING (
    motorista_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );