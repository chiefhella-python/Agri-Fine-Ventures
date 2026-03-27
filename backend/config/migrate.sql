-- ============================================
-- SUPABASE MIGRATION - Recreate all tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop existing tables (in correct order due to FK constraints)
DROP TABLE IF EXISTS public.sensors CASCADE;
DROP TABLE IF EXISTS public.supervisor_greenhouses CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.greenhouses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create users table
CREATE TABLE public.users (
  uid VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL DEFAULT 'Unnamed',
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  avatar VARCHAR(50) DEFAULT '👤',
  image_url TEXT DEFAULT '',
  assigned_gh TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('user', 'supervisor', 'agronomist', 'admin'))
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- 3. Create greenhouses table
CREATE TABLE public.greenhouses (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  crop VARCHAR(255) DEFAULT '',
  variety VARCHAR(255) DEFAULT '',
  crop_emoji VARCHAR(50) DEFAULT '🏡',
  plants INTEGER DEFAULT 0,
  area VARCHAR(50) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  planted_date TIMESTAMP,
  expected_harvest TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  environment JSONB DEFAULT '{"temp": "", "humidity": "", "ph": "", "ec": ""}',
  notes TEXT DEFAULT '',
  tasks JSONB DEFAULT '[]',
  sensors JSONB DEFAULT '[]',
  grade_prices JSONB DEFAULT '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create supervisor_greenhouses junction table
CREATE TABLE public.supervisor_greenhouses (
  id SERIAL PRIMARY KEY,
  supervisor_id VARCHAR(255) NOT NULL,
  greenhouse_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(supervisor_id, greenhouse_id)
);

CREATE INDEX idx_supervisor_greenhouses_supervisor ON public.supervisor_greenhouses(supervisor_id);

-- 5. Create workers table
CREATE TABLE public.workers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  salary DECIMAL(10,2) DEFAULT 0,
  salary_paid DECIMAL(10,2) DEFAULT 0,
  transaction_code VARCHAR(100) DEFAULT '',
  role VARCHAR(50) DEFAULT 'worker',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workers_name ON public.workers(name);

-- 6. Insert default admin user (password: 1234 - bcrypt hash)
-- Hash generated with bcrypt rounds=10 for '1234'
INSERT INTO public.users (uid, email, password, display_name, role, avatar, image_url)
VALUES (
  'admin',
  'agrifineventures@gmail.com',
  '$2b$10$Fjj4UZeDubpKE7wytVnoSeCKAfzG9DVh3qyJFiW3C0XxWp2.qHee2',
  'Admin',
  'admin',
  '👑',
  ''
);

-- 7. Insert 5 default greenhouses
INSERT INTO public.greenhouses (id, name, crop_emoji, plants, status, environment, tasks, sensors, grade_prices)
VALUES
  ('gh_1', 'Greenhouse 1', '🏡', 0, 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}'),
  ('gh_2', 'Greenhouse 2', '🏡', 0, 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}'),
  ('gh_3', 'Greenhouse 3', '🏡', 0, 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}'),
  ('gh_4', 'Greenhouse 4', '🏡', 0, 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}'),
  ('gh_5', 'Greenhouse 5', '🏡', 0, 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
