-- === ATTRIBUTS PRODUITS ===

-- Définitions des attributs (ex: "Taille", "Cuisson", "Supplément")
CREATE TABLE attribute_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE attribute_definitions ENABLE ROW LEVEL SECURITY;

-- Options possibles pour chaque attribut (ex: "Petite +0€", "Grande +2€")
CREATE TABLE attribute_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID REFERENCES attribute_definitions(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  sort_order INT DEFAULT 0
);

ALTER TABLE attribute_options ENABLE ROW LEVEL SECURITY;

-- Association produit ↔ attribut
CREATE TABLE product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID REFERENCES attribute_definitions(id) ON DELETE CASCADE
);

ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;

-- RLS : lecture publique, écriture admin
CREATE POLICY "Attributs visibles par tous" ON attribute_definitions FOR SELECT USING (true);
CREATE POLICY "Admin gère les attributs" ON attribute_definitions FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

CREATE POLICY "Options visibles par tous" ON attribute_options FOR SELECT USING (true);
CREATE POLICY "Admin gère les options" ON attribute_options FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

CREATE POLICY "Associations visibles par tous" ON product_attributes FOR SELECT USING (true);
CREATE POLICY "Admin gère les associations" ON product_attributes FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
