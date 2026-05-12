-- === CORRECTION RLS : ÉLIMINER LA RÉCURSION ===
-- Le pattern "auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)"
-- dans les politiques FOR ALL cause une récursion infinie → erreur 500

-- 1. Fonction utilitaire pour vérifier si l'utilisateur est admin
-- (SECURITY DEFINER bypass RLS, donc pas de récursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
$$;

-- 2. Recréer toutes les politiques qui utilisaient le pattern récursif

-- Profils
DROP POLICY IF EXISTS "Admin peut modifier les profils" ON profiles;
CREATE POLICY "Admin peut modifier les profils" ON profiles
  FOR ALL USING (public.is_admin());

-- Thèmes
DROP POLICY IF EXISTS "Admin peut modifier le thème" ON themes;
CREATE POLICY "Admin peut modifier le thème" ON themes
  FOR ALL USING (public.is_admin());

-- Salles
DROP POLICY IF EXISTS "Admin gère les salles" ON rooms;
CREATE POLICY "Admin gère les salles" ON rooms
  FOR ALL USING (public.is_admin());

-- Tables
DROP POLICY IF EXISTS "Admin gère les tables" ON tables_resto;
CREATE POLICY "Admin gère les tables" ON tables_resto
  FOR ALL USING (public.is_admin());

-- Familles
DROP POLICY IF EXISTS "Admin gère les familles" ON product_families;
CREATE POLICY "Admin gère les familles" ON product_families
  FOR ALL USING (public.is_admin());

-- Produits
DROP POLICY IF EXISTS "Admin gère les produits" ON products;
CREATE POLICY "Admin gère les produits" ON products
  FOR ALL USING (public.is_admin());

-- Réservations
DROP POLICY IF EXISTS "Réservations visibles par admin" ON reservations;
DROP POLICY IF EXISTS "Admin modifie les réservations" ON reservations;
CREATE POLICY "Réservations visibles par admin" ON reservations
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin modifie les réservations" ON reservations
  FOR UPDATE USING (public.is_admin());

-- Commandes
DROP POLICY IF EXISTS "Commandes visibles par admin" ON orders;
DROP POLICY IF EXISTS "Admin modifie les commandes" ON orders;
CREATE POLICY "Commandes visibles par admin" ON orders
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin modifie les commandes" ON orders
  FOR UPDATE USING (public.is_admin());

-- Order items
DROP POLICY IF EXISTS "Order items visibles par admin" ON order_items;
CREATE POLICY "Order items visibles par admin" ON order_items
  FOR SELECT USING (public.is_admin());

-- Attributs (si la migration 002 a été appliquée)
DROP POLICY IF EXISTS "Admin gère les attributs" ON attribute_definitions;
DROP POLICY IF EXISTS "Admin gère les options" ON attribute_options;
DROP POLICY IF EXISTS "Admin gère les associations" ON product_attributes;
CREATE POLICY "Admin gère les attributs" ON attribute_definitions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin gère les options" ON attribute_options FOR ALL USING (public.is_admin());
CREATE POLICY "Admin gère les associations" ON product_attributes FOR ALL USING (public.is_admin());
