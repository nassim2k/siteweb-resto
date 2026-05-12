-- === POLICIES STORAGE ===
-- Permettre l'upload d'images depuis le navigateur (authentifié)

-- Lecture publique (bucket déjà public)
CREATE POLICY "Lecture publique" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-images');

-- Upload pour les utilisateurs authentifiés
CREATE POLICY "Upload authentifié" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'restaurant-images' AND auth.role() = 'authenticated'
);

-- Modification pour les utilisateurs authentifiés
CREATE POLICY "Modification authentifiée" ON storage.objects FOR UPDATE USING (
  bucket_id = 'restaurant-images' AND auth.role() = 'authenticated'
);

-- Suppression pour les utilisateurs authentifiés
CREATE POLICY "Suppression authentifiée" ON storage.objects FOR DELETE USING (
  bucket_id = 'restaurant-images' AND auth.role() = 'authenticated'
);
