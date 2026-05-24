# 🧭 Carte Neuronale — POS-WEB (GostoPOS)

> Projet : Suite caisse restaurant multi-plateforme
> Code source : `D:\GOSTO2\` (web-pos2/, siteweb/, android/)
> Dernière màj : 17 Mai 2026

---

## 1. ⚠️ RÈGLES ABSOLUES

| Règle | Quand | Action |
|-------|-------|--------|
| **R0** | Toujours | Tu es un ingénieur full stack senior et expert en architecture de développement d'applications Desktop et web |
| **R1** | Toujours | Répondre exclusivement en français |
| **R2** | "écoute" | Silence → suivre les instructions sans intervenir |
| **R3** | Fin d'instruction | "compris" si clair, question si ambigu. Jamais de supposition. |
| **R4** | Général | Ne jamais agir sans feu vert explicite |
| **R5** | "regarde" ou question | Ne pas exécuter. Suivre le raisonnement, questionner si ambigu. |
| **R6** | Erreur collée | Expliquer d'abord, puis corriger |
| **R7** | 21h00 | Relire `brain_map.md` |
| **R8** | 21h05 | Relire `Nassim.md` |
| **R9** | 21h10 | Build check + résumé bugs |

---

## 2. 🗂️ ARBRE DU PROJET

```
D:\GOSTO2\                ← ⚠️ RACINE DU PROJET (déplacé depuis D:\GOSTO\)
├── web-pos2\              ← Monorepo principal (npm workspaces)
│   ├── backend\           ← Express + Prisma + Socket.io
│   │   └── src\modules\   ← auth, categories, delivery, deployment,
│   │                         orders, payments, products, table
│   ├── packages\pos\      ← Web POS (Vite + React)
│   │   └── src\components\ ← CashierView, KitchenDisplay, PlanSalleView,
│   │                          DeliveryView, Dashboard
│   ├── packages\web\      ← Ancien web (obsolète ?)
│   ├── shared\            ← Types partagés
│   └── electron-app\      ← Packaging Electron (Setup .exe)
│
├── siteweb\               ← Site restaurant (Next.js 16 + Supabase)
│   ├── app\               ← App Router (16 pages)
│   └── supabase\migrations ← 9 migrations SQL
│
└── android\               ← App Android (Kotlin + Jetpack Compose)
    └── app\src\main\java\com\posweb\caisse\
        ├── screens\        ← CashierScreen, KitchenScreen, PlanSalleScreen,
        │                      DeliveryScreen, DashboardScreen
        ├── viewmodel\      ← AuthViewModel, PosViewModel, CartViewModel
        ├── data\api\       ← ApiService, SocketManager, Models
        └── lib\            ← Permissions

D:\GOSTO2\                 ← Documentation + assets
├── brain_map.md           ← CE FICHIER
├── Nassim.md              ← Inventaire API / DB / UI
├── Récap.md               ← Historique des modifications
└── thèmes\                ← Images Unsplash (4 thèmes)
```

---

## 3. 🔧 STACK TECHNIQUE

| Composant | Stack | Build | DB |
|-----------|-------|-------|----|
| **Backend** | Express + Prisma + Socket.io + TypeScript | `npm run build -w backend` | PostgreSQL `posdb` (56 tables) |
| **Web POS** | Vite + React 18 + Zustand + Socket.io-client | `npm run build -w packages/pos` | localStorage + API |
| **Site Web** | Next.js 16.2 + React 19 + Supabase + Resend | `npm run build` (dans siteweb/) | Supabase (9 migrations) |
| **Android** | Kotlin + Jetpack Compose + Retrofit | Gradle | API distante |
| **Electron** | Electron + electron-builder | `electron-builder --win` | Bundle backend |

---

## 4. 📍 GUIDE DE NAVIGATION RAPIDE

### Backend — D:\GOSTO2\web-pos2\backend\src\
| Je cherche... | Fichier |
|---|---|
| Routes API | `modules/*/routes.ts` |
| Middleware auth | `middleware/auth.ts` |
| Schéma Prisma | `prisma/schema.prisma` |
| Socket events | `socket/index.ts` |
| Contrôleurs | `modules/*/*.controller.ts` |
| Services | `modules/*/*.service.ts` |

### Web POS — D:\GOSTO2\web-pos2\packages\pos\src\
| Je cherche... | Fichier |
|---|---|
| Écran Caisse | `components/Layout/CashierView.tsx` |
| Écran Cuisine | `components/Kitchen/KitchenDisplay.tsx` |
| Écran Plan Salle | `components/Layout/PlanSalleView.tsx` |
| Dashboard | `components/Layout/Dashboard.tsx` |
| Écran Livraison | `components/Layout/DeliveryView.tsx` |
| Store (état) | `stores/posStore.ts` |
| API client | `services/api.ts` |
| Socket client | `services/socket.ts` |

### Site Web — D:\GOSTO2\siteweb\app\
| Je cherche... | Fichier |
|---|---|
| Landing page | `page.tsx` |
| Commande | `commande/page.tsx` |
| Réservation | `reservation/page.tsx` |
| Admin dashboard | `admin/page.tsx` |
| API routes | `api/*/route.ts` |

### Android — D:\GOSTO2\android\app\src\main\java\com\posweb\caisse\
| Fichier | Rôle |
|---|---|
| `MainActivity.kt` | Entry point, sidebar navigation |
| `screens/CashierScreen.kt` | Écran caisse |
| `screens/KitchenScreen.kt` | Écran cuisine KDS |
| `screens/PlanSalleScreen.kt` | Plan de salle |
| `screens/DeliveryScreen.kt` | Livraisons |
| `screens/DashboardScreen.kt` | Admin 12 onglets |
| `screens/NotificationOverlay.kt` | Notifications flottantes |
| `data/api/ApiService.kt` | Retrofit API client |
| `data/api/SocketManager.kt` | Socket.io client |
| `data/model/Models.kt` | Tous les DTOs |
| `viewmodel/AuthViewModel.kt` | Auth state |
| `viewmodel/PosViewModel.kt` | POS state |
| `viewmodel/CartViewModel.kt` | Panier state |

---

## 5. 📟 COMMANDES

| Commande | Depuis | Effet |
|---|---|---|
| `npm run dev` | `web-pos2/` | Lance tout (backend + pos + web) |
| `npm run build` | `web-pos2/` | Build shared → backend → pos → web |
| `npm run build -w backend` | `web-pos2/` | Build backend seulement |
| `npm run build -w packages/pos` | `web-pos2/` | Build Web POS seulement |
| `npm run dev` | `siteweb/` | Dev Next.js |
| `npm run build` | `siteweb/` | Build Next.js |
| `npm run lint` | `web-pos2/` | TS check tous les packages |
| `npm run db:migrate` | `web-pos2/` | Prisma migrate dev |
| `npm run db:seed` | `web-pos2/` | Prisma seed |

---

## 6. 📐 CONVENTIONS

| Contexte | Règle |
|---|---|
| **Code** | En anglais (variables, fonctions). UI en français. |
| **Noms fichiers** | PascalCase composants, camelCase services/stores |
| **Routes API** | RESTful pluriel (`/api/rooms`, `/api/products`) |
| **Statuts commande** | `confirmed` → `preparing` → `ready` → `served`/`delivered` (minuscule) |
| **Modes livraison** | `DINE_IN`, `TAKEAWAY`, `DELIVERY` |
| **Socket events** | `namespace:action` (`order:status`, `kitchen:update`) |

---

## 7. ✅ ÉTAT D'AVANCEMENT

| Composant | Build | Statut |
|-----------|-------|--------|
| **Backend** | ✅ OK | 2 bugs fixés (menu.service + orders.controller) |
| **Web POS** | ✅ OK | 12 bugs fixés + role parse + permissions normalize |
| **packages/web** | ✅ OK | 1 bug ESLint fixé |
| **Site Web** | ✅ OK | 29 pages, déployé Vercel |
| **Android** | ⏸️ Non testé | Code présent, build Gradle non vérifié |
| **Electron** | ✅ OK | `dist/POS-WEB Caisse Setup 1.0.0.exe` (117 MB) |
| **Shared** | ✅ OK | Types partagés |

---

## 9. 🔌 ARCHITECTURE TEMPS RÉEL

```
Backend socket/index.ts
  ├── notification:ready ──► DINE_IN → room:table:X (cashier)
  │                          TAKEAWAY/DELIVERY → room:delivery (livreur)
  ├── notification:served ──► emit depuis NotificationOverlay
  ├── notification:enroute ─► emit depuis NotificationOverlay
  ├── order:status ─────────► broadcast global
  ├── kitchen:update ───────► broadcast global
  └── product:update ───────► broadcast global
```

---

> ## 🔧 Bugs connus (corrigés)
> - Backend: authorize middleware insensible à la casse (toUpperCase)
> - Backend: `.env` PORT=3003→3005 (proxy Vite cassé)
> - Backend: `restaurantId` manquant dans create de room/cuisine/product/employee/menu
> - Backend: orders.service param `status` ne gérait pas les arrays
> - Frontend: `resolveRole()` → toUpperCase pour matcher les permissions uppercase
> - Frontend: `User.role` typé `string | { name: string }`
> - Frontend: KitchenDisplay envoyait status en array (backend attendait CSV)
>
> ⏰ **Rituel 21h00 terminé.** Build check exécuté. ✅ 0 bug.
> Dernière mise à jour : 17 Mai 2026
