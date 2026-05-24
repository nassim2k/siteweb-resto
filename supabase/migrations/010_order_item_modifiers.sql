-- Stockage des choix d'attributs (modifiers) pour chaque article de commande
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS modifiers JSONB DEFAULT '[]'::jsonb;
