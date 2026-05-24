# Prompt de Session — GostoPOS

## Stack
- **POS** : React + Vite + TypeScript + Zustand
- **Backend** : Express + Prisma + Socket.io
- **Site web** : Next.js + Supabase
- **Android** : Kotlin + Jetpack Compose
- **Electron** : electron-builder (Setup .exe)

## Règles
1. Répondre en français
2. Full stack senior React/Node.js/TypeScript
3. Code en anglais (variables/fonctions), UI en français
4. PascalCase composants, camelCase services
5. Statuts commande : `confirmed` → `preparing` → `ready` → `served`/`delivered`
6. Modes : `DINE_IN`, `TAKEAWAY`, `DELIVERY`
7. Socket events : `namespace:action`
8. Ne pas agir sans feu vert explicite

## POS (packages/pos/src)

### App & Routes
- `/` Caisse, `/plan-salle`, `/kitchen`, `/delivery`, `/dashboard`
- 6 rôles : ADMIN, MANAGER, CASHIER, KITCHEN, LIVREUR, CLIENT
- Permissions read/write/execute par module

### CashierView (~1483 lignes)
- 3 modes : Sur place, À emporter, À livrer
- Grille produits 7 colonnes, drill-down familles
- Panier latéral 384px, modal produit (qté, taille, suppléments, message)
- Modal encaissement : Espèces/Carte/Ticket
- Modal sélection table : plan visuel avec occupation
- Session ouverture/fermeture
- Socket temps réel, auto-refresh 15s
- Impression ticket thermique (réseau + WebUSB)
- Offline fallback IndexedDB + données démo
- Verrouillage table localStorage

### PlanSalleView (~422 lignes)
- Grille visuelle tables avec statut occupation
- Alertes appel serveur (pulse 30s)
- Verrouillage/déverrouillage table
- Panneau commande latéral 480px
- Onglets familles, grille produits 3 colonnes
- Modal produit : taille, suppléments (6 prédéfinis), note

### KitchenDisplay (~497 lignes)
- Kanban 3 colonnes : Reçues / En préparation / Prêtes
- Drag-and-drop, cartes (numéro, type, articles, timer)
- Minuteur intelligent par file d'attente
- Code couleur urgence : vert/ambre/rouge + pulse
- Filtre station cuisine

### DeliveryView (~271 lignes)
- Liste latérale 384px
- Carte Leaflet (CartoDB dark)
- Marqueurs restaurant (orange) + livraisons (vert/rouge)
- Calcul itinéraire OSRM
- Géolocalisation, lien Google Maps
- Workflow : non-capturée → capturée → livrée

### Auth (Login.tsx)
- Double mode : Email ou Nom/Prénom
- Comptes démo : admin@posweb.fr, caissier@posweb.fr, cuisine@posweb.fr

### Dashboard (12 sections)
| Panel | Fichier | Fonctionnalités |
|-------|---------|-----------------|
| Stats | StatsPanel.tsx | CA, commandes, panier moyen |
| Cuisines | CuisinesPanel.tsx | CRUD cuisines + imprimante + KDS |
| Produits | ProduitsPanel.tsx | Liste produits (read-only) |
| Salles & Tables | SallesPanel.tsx | CRUD salles/tables, plan drag-drop |
| Menu | MenuPanel.tsx | CRUD familles + produits + tailles/suppléments |
| Personnel | PersonnelPanel.tsx | CRUD employés + pavé 6 chiffres |
| Licence | LicencePanel.tsx | Activation XXXX-XXXX-XXXX-XXXX |
| Compte | ComptePanel.tsx | Session employé + pavé numérique |
| Mode | ModePanel.tsx | Sélecteur Caisse/Cuisine/Dashboard |
| Paramètres | ParametresPanel.tsx | Réseau, scanner, TPE, monnaie (24 devises) |
| Comptabilité | ComptabilitePanel.tsx | Ventes, achats, charges, CA, factures |
| Déploiement | DeploiementPanel.tsx | Wizard 7 étapes (GitHub/Supabase/Vercel/Email) |

### Stores
- posStore : panier, bons, tables, sessions
- cartStore : panier générique, suppléments
- authStore : utilisateur, JWT, refresh token
- currencyStore : 24 devises, formatage

### Services
- api.ts : Axios + refresh token, 10 endpoints
- socket.ts : Socket.io auto-reconnect (10 tentatives)
- offline.ts : Dexie IndexedDB (orders, products, categories, syncLog)
- printer.ts : ESC/POS tickets thermiques + QR code

## Web (Next.js)

### Pages publiques
- Landing : Hero, Categories, Produits populaires, Avis
- Commande en ligne avec panier
- Réservation avec planning + plan salle interactif
- Suivi commande par email (polling 3s)
- Appel serveur

### Admin web
- Stats (salles, tables, produits, commandes, livraisons, réservations)
- Gestion : attributs, catalogue, commandes, comptes, infos, réservations, salles, tables, thème

### UI Components
- Button, Card, ImageUpload, Input, Modal, Skeleton, Toast
- Navbar, Footer, Sidebar
- ThemeProvider, ThemeWrapper

### Hooks
- useAuth, useCart, useRealtime (Supabase), useScrollPosition

## Travail effectué (24 mai 2026)

### Sessions précédentes
1. SallesPanel : expand inline, tables visibles
2. Bouton "+" famille → MenuProduitsPanel pré-sélectionné
3. Suppression sous-familles (types, navigation, formulaires)
4. Lock/Unlock sur chaque table
5. Formulaire inline édition table (switch verrouille)
6. saveTable : String(numero || '').trim() sécurité
7. loadSalles : String(t.number) pour numero string
8. startEditTable : paramètre salleId optionnel
9. saveTable : retrait champ status (occupation serveur)
10. Restauration vue défaut après suppression
11. Icône Caisse : ShoppingCart → Monitor

### Session actuelle
12. Familles en colonne verticale gauche permanente
13. Suppression panelMode state
14. Suppression retourFamilles
15. Suppression useEffect [panelMode]
16. BUG #1 : seats→capacity (3 endroits) — SallesPanel.tsx
17. BUG #2 : "Se connecter" supprimé — CashierView.tsx
18. BUG #3 : "Changer compte" → /login + logout — CashierView.tsx
19. BUG #4 : Suppléments chargés + fallback globalSupps — CashierView.tsx
20. BUG #5 : Filtrage produit-spécifique → global — CashierView.tsx
21. BUG #6 : setPanelMode orphelin → fix — CashierView.tsx
22. BUG #7 : Type union name/nom → cast any — CashierView.tsx
23. BUG #8 : Chrome chrome-error → fixé #6+#7
24. Création brain-map + recap

## Problèmes connus
- catch { } bare syntax (strict TS)
- 401 = session expirée (refresh token devrait gérer)
- menuApi.getModifierGroups() 403 pour CASHIER
- Backend n'écrit pas order_item_modifiers
- Fallback offline produits sans options (compensé globalSupps)
