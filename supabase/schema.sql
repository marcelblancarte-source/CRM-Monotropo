-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Equipos
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Roles del Sistema
CREATE TABLE sys_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'team_leader', 'sales_advisor'
    description TEXT
);

INSERT INTO sys_roles (name, description) VALUES
('super_admin', 'Director/Coordinador con acceso a todo'),
('team_leader', 'Líder con acceso a todo su equipo'),
('sales_advisor', 'Asesor con acceso solo a sus prospectos asignados');

-- 3. Tabla de Usuarios (Extensión de auth.users de Supabase)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES sys_roles(id),
    team_id UUID REFERENCES teams(id), -- Null para super_admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inventario (Propiedades/Unidades)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tower VARCHAR(100),
    unit_number VARCHAR(50) NOT NULL,
    floor VARCHAR(50),
    typology VARCHAR(100),
    sqm_construction DECIMAL(10,2),
    sqm_terrace DECIMAL(10,2),
    list_price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Disponible', -- Disponible, Apartado, Vendido, En proceso
    description TEXT,
    attachments JSONB, -- Array de URLs (plano, render, ficha tecnica)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Esquemas y Políticas de Pago
CREATE TABLE payment_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- Contado, Crédito, Directo, Mixto
    description TEXT,
    down_payment_pct DECIMAL(5,2),
    months INTEGER,
    term_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Prospectos
CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(100), -- Referido, RRSS, Portal, etc.
    first_contact_date DATE DEFAULT CURRENT_DATE,
    
    -- Asignación
    advisor_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    
    -- Estado
    temperature VARCHAR(50) DEFAULT 'Frío', -- Frío, Tibio, Medio, Caliente, Cierre Inminente
    
    -- Visita
    visited BOOLEAN DEFAULT FALSE,
    visit_date DATE,
    visit_observations TEXT,
    
    -- Cotización
    has_quote BOOLEAN DEFAULT FALSE,
    quote_date DATE,
    quoted_property_id UUID REFERENCES properties(id),
    list_price_at_quote DECIMAL(15,2),
    offered_price DECIMAL(15,2),
    payment_schema_id UUID REFERENCES payment_schemas(id),
    
    -- Preferencias
    pref_typology VARCHAR(100),
    pref_bedrooms INTEGER,
    pref_price_range VARCHAR(100),
    pref_payment_schema VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Historial de Observaciones de Prospectos (Inmutable)
CREATE TABLE prospect_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Actividades
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- Llamada, WhatsApp/Correo, Visita, Cita, Seguimiento
    activity_date DATE NOT NULL,
    activity_time TIME NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Realizada, No contestó, Reprogramada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Helper Function para obtener rol del usuario
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS VARCHAR AS $$
  SELECT r.name FROM users u 
  JOIN sys_roles r ON u.role_id = r.id 
  WHERE u.id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function para obtener equipo del usuario
CREATE OR REPLACE FUNCTION auth.user_team()
RETURNS UUID AS $$
  SELECT team_id FROM users 
  WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas Users
CREATE POLICY "Super admin ve todos los usuarios, resto su propio equipo"
ON users FOR SELECT USING (
  auth.user_role() = 'super_admin' OR 
  team_id = auth.user_team() OR 
  id = auth.uid()
);

-- Políticas Properties (Inventario puede ser visto por todos los autenticados)
CREATE POLICY "Todos los usuarios activos ven inventario"
ON properties FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas Payment Schemas
CREATE POLICY "Todos los usuarios activos ven esquemas"
ON payment_schemas FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas Prospectos
CREATE POLICY "Separación estricta de prospectos por equipo"
ON prospects FOR ALL USING (
  auth.user_role() = 'super_admin' OR 
  (auth.user_role() = 'team_leader' AND team_id = auth.user_team()) OR
  (auth.user_role() = 'sales_advisor' AND (advisor_id = auth.uid() OR (team_id = auth.user_team() AND advisor_id = auth.uid())))
);

-- Políticas Actividades
CREATE POLICY "Separación de actividades"
ON activities FOR ALL USING (
  auth.user_role() = 'super_admin' OR 
  (auth.user_role() = 'team_leader' AND EXISTS (SELECT 1 FROM prospects p WHERE p.id = prospect_id AND p.team_id = auth.user_team())) OR
  (auth.user_role() = 'sales_advisor' AND assigned_to = auth.uid())
);

-- Políticas Notas
CREATE POLICY "Separación de notas, lectura permitida según prospecto"
ON prospect_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM prospects p WHERE p.id = prospect_id)
);
CREATE POLICY "Insertar notas solo a prospectos permitidos"
ON prospect_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM prospects p WHERE p.id = prospect_id)
);
-- Sin políticas de UPDATE/DELETE para prospect_notes (Inmutabilidad)
