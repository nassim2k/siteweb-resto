-- Ajout du numéro de téléphone aux commandes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
