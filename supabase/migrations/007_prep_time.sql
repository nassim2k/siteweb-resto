-- Ajout du temps de préparation aux commandes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS preparation_minutes INTEGER DEFAULT 0;
