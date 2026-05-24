<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-rules -->
# Règles de session — GostoPOS

## Erreurs passées à ne PAS répéter
1. **NE JAMAIS** lancer `git clean -fd` ou `git reset --hard` sans feu vert explicite
2. **NE JAMAIS** `git init` à la racine `D:\GOSTO2\` — travailler uniquement dans `siteweb/`
3. **TOUJOURS** demander avant toute commande destructive (delete, clean, reset, force push)
4. **TOUJOURS** vérifier ce qu'une commande va affecter avant de l'exécuter
5. **TOUJOURS** faire une backup avant une opération risquée

## Projets dans D:\GOSTO2\
- `siteweb/` — Site Next.js (SEUL dossier à modifier)
- `android/` — App Android Kotlin (NE PAS TOUCHER sauf demande)
- `web-pos2/` — POS React/Vite (NE PAS TOUCHER sauf demande)
- Autres dossiers (brain-map, etc.) — NE PAS TOUCHER sauf demande
<!-- END:session-rules -->
