-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('Administrador', 'Administração', 'Financeiro', 'Motorista');

-- Criar enum para status de corridas
CREATE TYPE public.corrida_status AS ENUM (
  'Pendente', 
  'Confirmada', 
  'Em Andamento', 
  'Concluída', 
  'Cancelada', 
  'Aguardando OS', 
  'OS Preenchida', 
  'Aprovada', 
  'Rejeitada', 
  'Aguardando Conferência', 
  'Em Análise', 
  'No Show', 
  'Revisar'
);

-- Criar enum para tipos de alerta
CREATE TYPE public.alerta_tipo AS ENUM ('info', 'warning', 'error', 'success');

-- Criar enum para destinatários de alerta
CREATE TYPE public.alerta_destinatarios AS ENUM ('todos', 'motoristas', 'especifico');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'Motorista',
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de empresas
CREATE TABLE public.empresas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  contato TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de solicitantes
CREATE TABLE public.solicitantes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa_id INTEGER REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de motoristas
CREATE TABLE public.motoristas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cpf TEXT UNIQUE,
  rg TEXT,
  cnh TEXT,
  categoria_cnh TEXT,
  validade_cnh DATE,
  endereco TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de documentos dos motoristas
CREATE TABLE public.motorista_documentos (
  id SERIAL PRIMARY KEY,
  motorista_id INTEGER REFERENCES public.motoristas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de corridas
CREATE TABLE public.corridas (
  id SERIAL PRIMARY KEY,
  solicitante TEXT NOT NULL,
  empresa TEXT NOT NULL,
  empresa_id INTEGER REFERENCES public.empresas(id),
  passageiro TEXT NOT NULL,
  telefone_passageiro TEXT,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  data DATE NOT NULL,
  hora_saida TIME,
  hora_chegada TIME,
  observacoes TEXT,
  status corrida_status DEFAULT 'Pendente',
  motorista TEXT,
  motorista_id INTEGER REFERENCES public.motoristas(id),
  veiculo TEXT,
  km_inicial NUMERIC,
  km_final NUMERIC,
  km_total NUMERIC,
  combustivel_inicial NUMERIC,
  combustivel_final NUMERIC,
  pedagio NUMERIC DEFAULT 0,
  estacionamento NUMERIC DEFAULT 0,
  hospedagem NUMERIC DEFAULT 0,
  outros NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  valor NUMERIC DEFAULT 0,
  valor_motorista NUMERIC DEFAULT 0,
  motivo_rejeicao TEXT,
  hora_inicio TIME,
  tipo_abrangencia TEXT,
  data_servico DATE,
  distancia_percorrida NUMERIC,
  tempo_viagem TEXT,
  observacoes_os TEXT,
  reembolsos NUMERIC DEFAULT 0,
  valor_combustivel NUMERIC DEFAULT 0,
  local_abastecimento TEXT,
  centro_custo TEXT NOT NULL DEFAULT '',
  destino_extra TEXT,
  numero_os TEXT,
  passageiros TEXT,
  projeto TEXT,
  motivo TEXT,
  preenchido_por_motorista BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de documentos das corridas
CREATE TABLE public.corrida_documentos (
  id SERIAL PRIMARY KEY,
  corrida_id INTEGER REFERENCES public.corridas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de alertas
CREATE TABLE public.alertas (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo alerta_tipo DEFAULT 'info',
  destinatarios alerta_destinatarios DEFAULT 'todos',
  motorista_especifico TEXT,
  criado_por TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  urgente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leituras de alertas
CREATE TABLE public.alerta_leituras (
  id SERIAL PRIMARY KEY,
  alerta_id INTEGER REFERENCES public.alertas(id) ON DELETE CASCADE,
  motorista_email TEXT NOT NULL,
  data_leitura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notificacoes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  corrida_id INTEGER REFERENCES public.corridas(id),
  motorista_email TEXT,
  motorista_name TEXT,
  destinatarios TEXT[] NOT NULL DEFAULT '{}',
  lida BOOLEAN DEFAULT false,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorista_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrida_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerta_leituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Função para obter o role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'Administrador');

-- Políticas RLS para empresas
CREATE POLICY "All authenticated users can view empresas" ON public.empresas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and administration can manage empresas" ON public.empresas
  FOR ALL USING (public.get_current_user_role() IN ('Administrador', 'Administração'));

-- Políticas RLS para solicitantes
CREATE POLICY "All authenticated users can view solicitantes" ON public.solicitantes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and administration can manage solicitantes" ON public.solicitantes
  FOR ALL USING (public.get_current_user_role() IN ('Administrador', 'Administração'));

-- Políticas RLS para motoristas
CREATE POLICY "All authenticated users can view motoristas" ON public.motoristas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and administration can manage motoristas" ON public.motoristas
  FOR ALL USING (public.get_current_user_role() IN ('Administrador', 'Administração'));

CREATE POLICY "Motoristas can view their own data" ON public.motoristas
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Motoristas can update their own data" ON public.motoristas
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas RLS para corridas
CREATE POLICY "All authenticated users can view corridas" ON public.corridas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and administration can manage corridas" ON public.corridas
  FOR ALL USING (public.get_current_user_role() IN ('Administrador', 'Administração', 'Financeiro'));

CREATE POLICY "Motoristas can update their assigned corridas" ON public.corridas
  FOR UPDATE USING (
    motorista_id = (SELECT id FROM public.motoristas WHERE user_id = auth.uid())
  );

-- Políticas RLS para alertas
CREATE POLICY "All authenticated users can view alertas" ON public.alertas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage alertas" ON public.alertas
  FOR ALL USING (public.get_current_user_role() = 'Administrador');

-- Políticas RLS para notificações
CREATE POLICY "Users can view their notifications" ON public.notificacoes
  FOR SELECT USING (
    (SELECT email FROM public.profiles WHERE id = auth.uid()) = ANY(destinatarios)
  );

CREATE POLICY "Admins can manage all notifications" ON public.notificacoes
  FOR ALL USING (public.get_current_user_role() = 'Administrador');

-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('motorista-fotos', 'motorista-fotos', true),
  ('motorista-documentos', 'motorista-documentos', false),
  ('corrida-documentos', 'corrida-documentos', false);

-- Políticas de storage para fotos de motoristas (público)
CREATE POLICY "Fotos de motoristas são visíveis por todos" ON storage.objects
  FOR SELECT USING (bucket_id = 'motorista-fotos');

CREATE POLICY "Admins podem fazer upload de fotos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'motorista-fotos' AND 
    public.get_current_user_role() IN ('Administrador', 'Administração')
  );

-- Políticas de storage para documentos (privado)
CREATE POLICY "Usuários autenticados podem ver documentos" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('motorista-documentos', 'corrida-documentos') AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins podem fazer upload de documentos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('motorista-documentos', 'corrida-documentos') AND
    public.get_current_user_role() IN ('Administrador', 'Administração')
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solicitantes_updated_at
  BEFORE UPDATE ON public.solicitantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_motoristas_updated_at
  BEFORE UPDATE ON public.motoristas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_corridas_updated_at
  BEFORE UPDATE ON public.corridas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alertas_updated_at
  BEFORE UPDATE ON public.alertas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar realtime para notificações e corridas
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.corridas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas;