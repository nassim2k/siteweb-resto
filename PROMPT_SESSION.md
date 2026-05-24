# Prompt de Session — GostoPOS / Siteweb-Resto

## Contexte projet

Suite caisse restaurant multi-plateforme + site web client. Le projet comprend :
- **Site web** (Next.js 16 + Supabase + Tailwind CSS v4) — site public + admin
- **POS Web** (Vite + React + Zustand) — caisse, cuisine, plan salle, livraison, dashboard
- **Backend** (Express + Prisma + Socket.io) — API REST + temps réel
- **Android** (Kotlin + Jetpack Compose) — app caisse native
- **Electron** — packaging desktop (.exe)

## Règles absolues

1. Répondre exclusivement en français
2. Tu es un ingénieur full stack senior spécialisé React/Next.js/TypeScript
3. Ne jamais agir sans feu vert explicite du promoteur
4. Relire `brain_map.md` si demandé
5. Next.js 16 a des breaking changes — lire `node_modules/next/dist/docs/` avant d'écrire du code
6. Conventions : code en anglais (variables/fonctions), UI en français, PascalCase pour composants, camelCase pour services

## Stack technique

| Composant | Stack |
|-----------|-------|
| Site web | Next.js 16.2 + React 19 + Supabase + Resend |
| POS Web | Vite + React 18 + Zustand + Socket.io-client |
| Backend | Express + Prisma + Socket.io + TypeScript |
| Android | Kotlin + Jetpack Compose + Retrofit |
| Electron | Electron + electron-builder |
| Styling | Tailwind CSS v4 |
| Base de données | Supabase (PostgreSQL) + Prisma (PostgreSQL locale) |

## Structure du projet

```
D:\GOSTO2\
├── src/                          # Site web Next.js (App Router)
│   ├── app/                      # Pages (App Router)
│   │   ├── page.tsx              # Landing page
│   │   ├── commande/             # Commande en ligne
│   │   ├── reservation/          # Réservation avec plan salle
│   │   ├── suivi-commande/       # Suivi temps réel
│   │   ├── call/                 # Appel serveur
│   │   ├── login/                # Connexion admin
│   │   ├── admin/                # Dashboard admin (10 sections)
│   │   │   ├── page.tsx          # Stats
│   │   │   ├── commandes/        # Gestion commandes
│   │   │   ├── reservations/     # Gestion réservations
│   │   │   ├── catalogue/        # Familles + produits
│   │   │   ├── attributs/        # Attributs (select/text)
│   │   │   ├── salles/           # Gestion salles
│   │   │   ├── tables/           # Gestion tables
│   │   │   ├── theme/            # Thème (couleurs, logo)
│   │   │   ├── comptes/          # Comptes admin
│   │   │   └── infos/            # Infos établissement
│   │   └── api/                  # API routes (12 endpoints)
│   ├── components/
│   │   ├── sections/             # Hero, Categories, PopularProducts, etc.
│   │   ├── layout/               # Navbar, Footer, Sidebar
│   │   ├── commande/             # Panier, ValidationEmail
│   │   ├── reservation/          # PlanSalle, TableInteractive, etc.
│   │   ├── admin/                # Sidebar admin
│   │   └── ui/                   # Button, Card, Input, Modal, Toast, etc.
│   ├── hooks/                    # useAuth, useCart, useRealtime, useScrollPosition
│   ├── lib/                      # Supabase client/server/admin, email, utils
│   └── types/                    # Types partagés
├── web-pos2/                     # Ancien mono-repo POS
│   └── backend/                  # (vide — à reconstruire ?)
├── android/                      # App Android native (vide — code à restaurer ?)
├── public/                       # Images thèmes (pizza, streetfood, gastronomie)
├── supabase/
│   └── migrations/               # 9 migrations SQL (schema → 009_infos_etablissement)
├── brain_map.md                  # Carte neuronale du projet
├── RECAP.md                      # Récapitulatif fonctionnalités + bugs
└── PROMPT_SESSION.md             # Ce fichier
```

## État d'avancement

### ✅ Fonctionnel
- Landing page avec hero slideshow crossfade (20s)
- Commande en ligne (sur place, livraison, à emporter)
- Réservation avec plan visuel des salles
- Suivi commande temps réel (polling 3s)
- Admin dashboard (stats, commandes, réservations, catalogue, attributs, salles, tables, thème, comptes, infos)
- Upload images vers Supabase Storage
- Envoi email via Resend (code confirmation)
- Attribution attributs aux produits
- Changement statut automatique (preparing → ready) après temps préparation
- Déploiement Vercel automatique (git push)

### ❌ Bloquant / À faire
- **Migration SQL 009** : colonnes address/phone/contact_email/hours/location_url dans `themes` — à exécuter
- **Email clients** : Resend limité à `onboarding@resend.dev` — besoin domaine personnalisé
- **Attributs select** : non affichés dans formulaire commande client
- **Modificateurs prix** : `attribute_options.price_modifier` jamais appliqué
- **Stockage attributs** : non sauvegardés dans `order_items`
- **Timer visible** : temps restant sur page suivi
- **Son notification** : quand statut change

### Bugs connus
- catch { } bare syntax (strict TS)
- 401 session expirée (refresh token)
- menuApi.getModifierGroups() 403 pour CASHIER
- Backend n'écrit pas order_item_modifiers
- Fallback offline produits sans options

## Flux de commande

1. Client commande → API `create-order` → DB + email confirmation
2. Admin voit commande → change statut (confirmed → preparing → ready → served/delivered)
3. Changement statut automatique après temps préparation (via fonction planifiée ou trigger)
4. Client suit temps réel sur `/suivi-commande` (polling toutes les 3s)
5. Client confirme réception (bouton "Bien reçu" / "Livré")

## Commandes utiles

```bash
npm run dev          # Dev Next.js (site web)
npm run build        # Build Next.js
npm run lint         # ESLint
npx vercel deploy --prod  # Déploiement manuel Vercel
```

## Dépendances clés

- next@16.2.6, react@19.2.4
- @supabase/ssr, @supabase/supabase-js
- framer-motion (animations)
- lucide-react (icônes)
- html5-qrcode, qrcode
- nodemailer
- tailwindcss v4

## Conventions base de données

- Statuts commande : `confirmed` → `preparing` → `ready` → `served` / `delivered`
- Modes livraison : `DINE_IN`, `TAKEAWAY`, `DELIVERY`
- Attributs : `select` (choix multiples) ou `text` (saisie libre)
- Tables Supabase : orders, order_items, products, categories, attributes, attribute_options, tables, rooms, reservations, themes, profiles

## Déploiement

- Repo GitHub : `nassim2k/siteweb-resto`
- Live : `https://siteweb-resto.vercel.app`
- Admin : `khobzi.nassim@gmail.com` / `admin123`
