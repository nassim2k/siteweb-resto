# Récap Projet — Siteweb Resto

## ✅ Ce qui fonctionne

### Front office (clients)
- [x] Page d'accueil avec héros + slideshow d'images
- [x] Commande en ligne (sur place / livraison)
- [x] Réservation de tables avec plan visuel
- [x] Page de suivi de commande en temps réel
  - [x] Image de fond plein écran selon le statut
  - [x] Ticket (détails de la commande) en haut
  - [x] Barre de progression + timeline
  - [x] Bouton "Bien reçu" (quand livré)
  - [x] Bouton "Livré" (quand en route → le client clique)
  - [x] Recherche par email insensible à la casse
  - [x] Polling toutes les 3s (fallback si WebSocket bloqué)

### Admin
- [x] Tableau de bord avec statistiques
- [x] Gestion des commandes (changement de statut)
  - [x] Affichage des articles dans chaque commande
  - [x] Affichage date + heure
- [x] Gestion des réservations
- [x] Gestion du catalogue (familles + produits)
- [x] Gestion des attributs (select / text)
- [x] Gestion des salles + tables (plan visuel)
- [x] Gestion du thème (couleurs, logo)
- [x] Gestion des comptes admin

### Système
- [x] Attribution d'attributs aux produits (via Catalogue)
- [x] Temps de préparation (attribut "Temps de préparation" en minutes)
- [x] Changement de statut automatique (preparing → ready) après le temps de préparation
- [x] Envoi d'email via Resend (code de confirmation)
- [x] Upload d'images vers Supabase Storage
- [x] Base de données Supabase (RLS, migrations)
- [x] Déploiement Vercel automatique (git push → déploiement)

## ❌ Ce qui reste à faire / À améliorer

### Bloquant
- [ ] **Migration SQL manquante** : `ALTER TABLE orders ADD COLUMN IF NOT EXISTS preparation_minutes INTEGER DEFAULT 0;` — à exécuter dans Supabase SQL Editor
- [ ] **Email aux clients** : Resend limité à `onboarding@resend.dev` → besoin d'un domaine personnalisé pour envoyer à des emails arbitraires

### Fonctionnalités
- [ ] **Attributs select dans la commande client** : les attributs de type "select" (taille, cuisson, supplément) ne sont pas affichés dans le formulaire de commande côté client
- [ ] **Modificateurs de prix** : `attribute_options.price_modifier` n'est jamais appliqué au panier
- [ ] **Stockage des attributs sur les commandes** : les choix d'attributs ne sont pas sauvegardés dans `order_items`
- [ ] **Timer visible** : afficher le temps restant estimé sur la page de suivi quand la commande est "En cuisine"
- [ ] **Son notification** : jouer un son quand le statut change

### Améliorations
- [ ] **Traduction** : tout est en français mais certains textes pourraient être vérifiés
- [ ] **Responsive** : vérifier l'affichage sur tous les écrans
- [ ] **Mode hors-ligne** : PWA / service worker ?

## 🚀 Déploiement

```bash
git add -A
git commit -m "message"
git push
# Vercel déploie automatiquement
```

Ou avec CLI :
```bash
npx vercel deploy --prod
```

## ⚙️ Commandes utiles

```bash
npm run dev        # Dev local
npm run build      # Build
npx vercel deploy --prod   # Déploiement manuel
```

## 📦 Projet technique

- **Framework** : Next.js 16 (App Router)
- **Styling** : Tailwind CSS
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Stockage** : Supabase Storage
- **Email** : Resend API
- **Déploiement** : Vercel
- **Repo GitHub** : `nassim2k/siteweb-resto`
- **Live** : `https://siteweb-resto.vercel.app`
- **Admin** : `khobzi.nassim@gmail.com` / `admin123`
