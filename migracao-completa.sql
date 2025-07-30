-- MIGRAÇÃO COMPLETA - Las Tortillas Mx
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Tabela de sessões (para autenticação)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- 2. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de itens do menu
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15,
  customizations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de mesas
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  location_id TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  qr_code TEXT UNIQUE,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  order_type TEXT NOT NULL,
  location_id TEXT NOT NULL,
  table_id INTEGER REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'received',
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  estimated_delivery_time TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) NOT NULL,
  menu_item_id INTEGER REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  customizations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 8. Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_tables_location_id ON tables(location_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança

-- Sessions
CREATE POLICY "Allow authenticated access" ON sessions FOR ALL USING (auth.role() = 'authenticated');

-- Users
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Allow authenticated update" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Allow authenticated delete" ON users FOR DELETE USING (auth.uid()::text = id);

-- Menu Items
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- Tables
CREATE POLICY "Allow public read access" ON tables FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON tables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON tables FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON tables FOR DELETE USING (auth.role() = 'authenticated');

-- Orders
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Order Items
CREATE POLICY "Allow public read access" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON order_items FOR DELETE USING (auth.role() = 'authenticated');

-- Reservations
CREATE POLICY "Allow public read access" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON reservations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON reservations FOR DELETE USING (auth.role() = 'authenticated');

-- Contacts
CREATE POLICY "Allow public read access" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON contacts FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir dados de exemplo no menu
INSERT INTO menu_items (name, description, price, category, available) VALUES
('Tacos de Carne', 'Tacos tradicionais com carne assada e molho especial', 12.50, 'Tacos', true),
('Tacos de Frango', 'Tacos com frango grelhado e vegetais frescos', 11.00, 'Tacos', true),
('Quesadilla de Frango', 'Quesadilla recheada com frango grelhado e queijo', 15.00, 'Quesadillas', true),
('Quesadilla de Carne', 'Quesadilla com carne assada e queijo derretido', 16.00, 'Quesadillas', true),
('Guacamole', 'Guacamole fresco com chips de milho', 8.00, 'Entradas', true),
('Nachos', 'Nachos com queijo, guacamole e sour cream', 10.00, 'Entradas', true),
('Margarita', 'Margarita tradicional com tequila e limão', 10.00, 'Bebidas', true),
('Cerveja Mexicana', 'Cerveja importada do México', 8.00, 'Bebidas', true),
('Refrigerante', 'Refrigerante de sua escolha', 3.00, 'Bebidas', true),
('Água', 'Água mineral', 2.00, 'Bebidas', true);

-- Configurar mesas
INSERT INTO tables (location_id, table_number, seats, status, qr_code) VALUES
('ilha', 1, 4, 'available', 'table-ilha-1'),
('ilha', 2, 4, 'available', 'table-ilha-2'),
('ilha', 3, 6, 'available', 'table-ilha-3'),
('ilha', 4, 6, 'available', 'table-ilha-4'),
('talatona', 1, 4, 'available', 'table-talatona-1'),
('talatona', 2, 4, 'available', 'table-talatona-2'),
('talatona', 3, 6, 'available', 'table-talatona-3'),
('movel', 1, 2, 'available', 'table-movel-1'),
('movel', 2, 2, 'available', 'table-movel-2'),
('movel', 3, 4, 'available', 'table-movel-3');

-- Verificar tabelas criadas
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 