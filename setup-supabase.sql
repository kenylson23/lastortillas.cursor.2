-- Script de Configuração do Supabase - Las Tortillas Mx
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela contacts (se não existir)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança

-- Menu Items
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

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

-- Tables
CREATE POLICY "Allow public read access" ON tables FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON tables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON tables FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON tables FOR DELETE USING (auth.role() = 'authenticated');

-- Users
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow authenticated update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow authenticated delete" ON users FOR DELETE USING (auth.uid() = id);

-- Sessions
CREATE POLICY "Allow authenticated access" ON sessions FOR ALL USING (auth.role() = 'authenticated');

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_tables_location_id ON tables(location_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- 5. Inserir dados de exemplo no menu (se não existirem)
INSERT INTO menu_items (name, description, price, category, available) 
SELECT * FROM (VALUES
  ('Tacos de Carne', 'Tacos tradicionais com carne assada e molho especial', 12.50, 'Tacos', true),
  ('Tacos de Frango', 'Tacos com frango grelhado e vegetais frescos', 11.00, 'Tacos', true),
  ('Quesadilla de Frango', 'Quesadilla recheada com frango grelhado e queijo', 15.00, 'Quesadillas', true),
  ('Quesadilla de Carne', 'Quesadilla com carne assada e queijo derretido', 16.00, 'Quesadillas', true),
  ('Guacamole', 'Guacamole fresco com chips de milho', 8.00, 'Entradas', true),
  ('Nachos', 'Nachos com queijo, guacamole e sour cream', 10.00, 'Entradas', true),
  ('Margarita', 'Margarita tradicional com tequila e limão', 10.00, 'Bebidas', true),
  ('Cerveja Mexicana', 'Cerveja importada do México', 8.00, 'Bebidas', true),
  ('Refrigerante', 'Refrigerante de sua escolha', 3.00, 'Bebidas', true),
  ('Água', 'Água mineral', 2.00, 'Bebidas', true)
) AS v(name, description, price, category, available)
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = v.name);

-- 6. Configurar mesas (se não existirem)
INSERT INTO tables (location_id, table_number, seats, status, qr_code) 
SELECT * FROM (VALUES
  ('ilha', 1, 4, 'available', 'table-ilha-1'),
  ('ilha', 2, 4, 'available', 'table-ilha-2'),
  ('ilha', 3, 6, 'available', 'table-ilha-3'),
  ('ilha', 4, 6, 'available', 'table-ilha-4'),
  ('talatona', 1, 4, 'available', 'table-talatona-1'),
  ('talatona', 2, 4, 'available', 'table-talatona-2'),
  ('talatona', 3, 6, 'available', 'table-talatona-3'),
  ('movel', 1, 2, 'available', 'table-movel-1'),
  ('movel', 2, 2, 'available', 'table-movel-2'),
  ('movel', 3, 4, 'available', 'table-movel-3')
) AS v(location_id, table_number, seats, status, qr_code)
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE location_id = v.location_id AND table_number = v.table_number);

-- 7. Verificar configuração
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 8. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 