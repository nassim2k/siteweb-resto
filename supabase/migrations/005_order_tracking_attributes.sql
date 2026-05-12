-- === AMÉLIORATIONS COMMANDE + ATTRIBUTS TEXTE + SUIVI ===

-- Attributs : ajout du type (select / text)
ALTER TABLE attribute_definitions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'select';

-- Product attributes : ajout d'une valeur pour les attributs texte
ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS value TEXT;

-- Commandes : type de commande (sur place / livraison)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'livraison';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Nouveaux status de suivi
-- pending → confirmed → preparing → ready → in_transit → delivered

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
