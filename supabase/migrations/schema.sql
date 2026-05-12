-- === SCHÉMA COMPLET DE LA BASE DE DONNÉES ===

-- PROFILS UTILISATEURS
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, false);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- THÈME DU SITE
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color TEXT DEFAULT '#1e3a5f',
  secondary_color TEXT DEFAULT '#f0c040',
  accent_color TEXT DEFAULT '#e74c3c',
  background_image TEXT,
  logo_url TEXT,
  site_name TEXT DEFAULT 'Mon Restaurant',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Insérer un thème par défaut
INSERT INTO themes (id) VALUES (gen_random_uuid());

-- SALLES
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- TABLES
CREATE TABLE tables_resto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shape TEXT DEFAULT 'circle',
  capacity INT DEFAULT 4,
  pos_x FLOAT DEFAULT 0,
  pos_y FLOAT DEFAULT 0,
  width FLOAT DEFAULT 60,
  height FLOAT DEFAULT 60,
  status TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tables_resto ENABLE ROW LEVEL SECURITY;

-- FAMILLES DE PRODUITS
CREATE TABLE product_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_families ENABLE ROW LEVEL SECURITY;

-- PRODUITS / ARTICLES
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES product_families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RÉSERVATIONS
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables_resto(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guest_count INT DEFAULT 1,
  status TEXT DEFAULT 'pending',
  confirmation_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- COMMANDES
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables_resto(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  confirmation_code TEXT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ARTICLES D'UNE COMMANDE
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profils : lecture pour tous, écriture pour l'admin
CREATE POLICY "Profils visibles par tous" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admin peut modifier les profils" ON profiles FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Thèmes : lecture publique, écriture admin seulement
CREATE POLICY "Thème visible par tous" ON themes FOR SELECT USING (true);
CREATE POLICY "Admin peut modifier le thème" ON themes FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Salles : lecture publique, écriture admin
CREATE POLICY "Salles visibles par tous" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admin gère les salles" ON rooms FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Tables : lecture publique, écriture admin
CREATE POLICY "Tables visibles par tous" ON tables_resto FOR SELECT USING (true);
CREATE POLICY "Admin gère les tables" ON tables_resto FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Familles : lecture publique, écriture admin
CREATE POLICY "Familles visibles par tous" ON product_families FOR SELECT USING (true);
CREATE POLICY "Admin gère les familles" ON product_families FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Produits : lecture publique, écriture admin
CREATE POLICY "Produits visibles par tous" ON products FOR SELECT USING (true);
CREATE POLICY "Admin gère les produits" ON products FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Réservations : insertion publique, lecture/modification admin
CREATE POLICY "Réservations insérables par tous" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Réservations visibles par admin" ON reservations FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
CREATE POLICY "Admin modifie les réservations" ON reservations FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Commandes : insertion publique, lecture/modification admin
CREATE POLICY "Commandes insérables par tous" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Commandes visibles par admin" ON orders FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
CREATE POLICY "Admin modifie les commandes" ON orders FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Articles commande : insertion publique, lecture admin
CREATE POLICY "Order items insérables par tous" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items visibles par admin" ON order_items FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- REALTIME : Activer les tables pour les souscriptions temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE tables_resto;
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
