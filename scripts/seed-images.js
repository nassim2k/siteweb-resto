const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve('.env.local')
const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
for (const l of lines) {
  const t = l.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  const key = t.slice(0, i).trim()
  let val = t.slice(i + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
  if (!process.env[key]) process.env[key] = val
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const IMAGES = {
  backgrounds: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80',
  ],
  rooms: {
    'Salle Principale': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'Le Patio': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    'Salon Privé': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5f710?w=800&q=80',
  },
  families: {
    'Entrées': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    'Plats Principaux': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    'Desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    'Boissons': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80',
    'Apéritifs': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80',
  },
  products: {
    'Salade de chèvre chaud': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
    'Carpaccio de bœuf': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&q=80',
    'Soupe à l\'oignon': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80',
    'Foie gras maison': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80',
    'Bruschetta tomate-basilic': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&q=80',
    'Entrecôte grillée': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80',
    'Magret de canard': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&q=80',
    'Filet de bar': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80',
    'Bœuf bourguignon': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80',
    'Risotto aux champignons': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&q=80',
    'Pizza Margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80',
    'Burger du chef': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
    'Crème brûlée': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&q=80',
    'Moelleux au chocolat': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80',
    'Tarte tatin': 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=300&q=80',
    'Cheesecake fruits rouges': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&q=80',
    'Mousse au chocolat': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80',
    'Eau plate': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&q=80',
    'Eau pétillante': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&q=80',
    'Coca-Cola': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80',
    'Jus d\'orange pressé': 'https://images.unsplash.com/photo-1621506289937-170bb0832227?w=300&q=80',
    'Vin rouge': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&q=80',
    'Vin blanc': 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=300&q=80',
    'Bière pression': 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=300&q=80',
    'Coupe de Champagne': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=300&q=80',
    'Kir royal': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=300&q=80',
    'Martini blanc': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=300&q=80',
    'Pastis': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=300&q=80',
  }
}

async function main() {
  console.log('=== MISE À JOUR DES IMAGES ===\n')

  // 1. Thème — fond d'écran
  console.log('--- Thème ---')
  const { data: theme } = await supabase.from('themes').select('id').limit(1).single()
  if (theme) {
    await supabase.from('themes').update({ background_image: IMAGES.backgrounds[0] }).eq('id', theme.id)
    console.log('  ✓ Fond d\'écran mis à jour')
  }
  console.log()

  // 2. Salles
  console.log('--- Salles ---')
  for (const [name, url] of Object.entries(IMAGES.rooms)) {
    const { error } = await supabase.from('rooms').update({ image_url: url }).eq('name', name)
    if (!error) console.log(`  ✓ ${name}`)
  }
  console.log()

  // 3. Familles
  console.log('--- Familles ---')
  for (const [name, url] of Object.entries(IMAGES.families)) {
    const { error } = await supabase.from('product_families').update({ image_url: url }).eq('name', name)
    if (!error) console.log(`  ✓ ${name}`)
  }
  console.log()

  // 4. Produits
  console.log('--- Produits ---')
  let count = 0
  for (const [name, url] of Object.entries(IMAGES.products)) {
    const { error } = await supabase.from('products').update({ image_url: url }).ilike('name', name + '%')
    if (!error) count++
  }
  console.log(`  ✓ ${count} produits mis à jour`)
  console.log()

  console.log('=== TERMINÉ ===')
}

main().catch(console.error)
