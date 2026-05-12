/**
 * Seed complet : salles, tables, familles, produits
 * Usage : node scripts/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Charger .env.local
const envPath = path.resolve(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seed() {
  console.log('=== SEED DATA ===\n')

  // ─── NETTOYAGE ─────────────────────────────────────
  console.log('Nettoyage des données existantes...')
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('reservations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('product_families').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('tables_resto').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('  ✓ Nettoyé\n')

  // ─── SALLES ───────────────────────────────────────
  console.log('--- Salles ---')
  const rooms = [
    { name: 'Salle Principale', description: 'Grande salle lumineuse avec vue sur la cuisine ouverte', sort_order: 1 },
    { name: 'Le Patio', description: 'Terrasse intérieure végétalisée, ambiance bucolique', sort_order: 2 },
    { name: 'Salon Privé', description: 'Salon intimiste pour dîners d\'affaires ou groupes', sort_order: 3 },
  ]

  const roomIds = []
  for (const r of rooms) {
    const { data, error } = await supabase.from('rooms').insert(r).select().single()
    if (error) { console.error('  Erreur:', error.message); process.exit(1) }
    roomIds.push(data.id)
    console.log(`  ✓ ${data.name}`)
  }
  console.log()

  // ─── TABLES ───────────────────────────────────────
  console.log('--- Tables ---')

  const tableDefs = [
    { ri: 0, name: 'A1', shape: 'circle',    cap: 2, x: 60,  y: 80,  w: 50,  h: 50 },
    { ri: 0, name: 'A2', shape: 'circle',    cap: 2, x: 160, y: 80,  w: 50,  h: 50 },
    { ri: 0, name: 'B1', shape: 'rectangle', cap: 4, x: 60,  y: 200, w: 80,  h: 55 },
    { ri: 0, name: 'B2', shape: 'rectangle', cap: 4, x: 200, y: 200, w: 80,  h: 55 },
    { ri: 0, name: 'C1', shape: 'square',    cap: 4, x: 60,  y: 320, w: 60,  h: 60 },
    { ri: 0, name: 'C2', shape: 'square',    cap: 4, x: 200, y: 320, w: 60,  h: 60 },
    { ri: 0, name: 'D1', shape: 'rectangle', cap: 6, x: 130, y: 450, w: 100, h: 60 },
    { ri: 0, name: 'VIP', shape: 'rectangle',cap: 8, x: 100, y: 560, w: 120, h: 65 },
    { ri: 1, name: 'P1', shape: 'circle',    cap: 2, x: 60,  y: 80,  w: 50,  h: 50 },
    { ri: 1, name: 'P2', shape: 'circle',    cap: 2, x: 160, y: 80,  w: 50,  h: 50 },
    { ri: 1, name: 'P3', shape: 'circle',    cap: 4, x: 60,  y: 200, w: 60,  h: 60 },
    { ri: 1, name: 'P4', shape: 'circle',    cap: 4, x: 180, y: 200, w: 60,  h: 60 },
    { ri: 1, name: 'P5', shape: 'square',    cap: 4, x: 110, y: 320, w: 60,  h: 60 },
    { ri: 2, name: 'S1', shape: 'rectangle', cap: 6, x: 60,  y: 80,  w: 100, h: 60 },
    { ri: 2, name: 'S2', shape: 'rectangle', cap: 6, x: 60,  y: 200, w: 100, h: 60 },
    { ri: 2, name: 'S3', shape: 'rectangle', cap: 8, x: 60,  y: 340, w: 120, h: 65 },
  ]

  const batch = tableDefs.map(t => ({
    room_id: roomIds[t.ri], name: t.name, shape: t.shape,
    capacity: t.cap, pos_x: t.x, pos_y: t.y, width: t.w, height: t.h, status: 'free',
  }))
  const { error: te } = await supabase.from('tables_resto').insert(batch)
  if (te) { console.error('  Erreur:', te.message); process.exit(1) }
  console.log(`  ✓ ${tableDefs.length} tables créées\n`)

  // ─── FAMILLES ─────────────────────────────────────
  console.log('--- Familles ---')
  const families = [
    { name: 'Entrées', description: 'Pour commencer en douceur', sort_order: 1 },
    { name: 'Plats Principaux', description: 'Nos spécialités', sort_order: 2 },
    { name: 'Desserts', description: 'Une touche sucrée', sort_order: 3 },
    { name: 'Boissons', description: 'Rafraîchissements et vins', sort_order: 4 },
    { name: 'Apéritifs', description: 'Pour bien débuter', sort_order: 5 },
  ]
  const { data: famData, error: fe } = await supabase.from('product_families').insert(families).select()
  if (fe) { console.error('  Erreur:', fe.message); process.exit(1) }
  const familyIds = Object.fromEntries(famData.map(f => [f.name, f.id]))
  famData.forEach(f => console.log(`  ✓ ${f.name}`))
  console.log()

  // ─── PRODUITS ─────────────────────────────────────
  console.log('--- Produits ---')
  const products = [
    { fam: 'Entrées', name: 'Salade de chèvre chaud', desc: 'Salade verte, crottin de chèvre, miel, noix', price: 12.50 },
    { fam: 'Entrées', name: 'Carpaccio de bœuf', desc: 'Tranches fines de bœuf, roquette, parmesan', price: 14.00 },
    { fam: 'Entrées', name: 'Soupe à l\'oignon', desc: 'Gratinée à la croûte de fromage', price: 9.50 },
    { fam: 'Entrées', name: 'Foie gras maison', desc: 'Foie gras mi-cuit, chutney de figues', price: 18.00 },
    { fam: 'Entrées', name: 'Bruschetta tomate-basilic', desc: 'Pain grillé, tomates fraîches, huile d\'olive', price: 8.50 },
    { fam: 'Plats Principaux', name: 'Entrecôte grillée', desc: 'Entrecôte 250g, sauce béarnaise, frites maison', price: 24.00 },
    { fam: 'Plats Principaux', name: 'Magret de canard', desc: 'Magret rôti, sauce aux fruits rouges, gratin', price: 22.00 },
    { fam: 'Plats Principaux', name: 'Filet de bar', desc: 'Filet de bar, légumes de saison, beurre blanc', price: 26.00 },
    { fam: 'Plats Principaux', name: 'Bœuf bourguignon', desc: 'Bœuf braisé au vin rouge, pommes vapeur', price: 19.00 },
    { fam: 'Plats Principaux', name: 'Risotto aux champignons', desc: 'Risotto crémeux, cèpes, parmesan', price: 17.00 },
    { fam: 'Plats Principaux', name: 'Pizza Margherita', desc: 'Tomate, mozzarella, basilic frais', price: 13.00 },
    { fam: 'Plats Principaux', name: 'Burger du chef', desc: 'Bœuf, cheddar, bacon, sauce maison, frites', price: 16.00 },
    { fam: 'Desserts', name: 'Crème brûlée', desc: 'Vanille de Madagascar, caramel craquant', price: 8.00 },
    { fam: 'Desserts', name: 'Moelleux au chocolat', desc: 'Cœur coulant, glace vanille', price: 9.50 },
    { fam: 'Desserts', name: 'Tarte tatin', desc: 'Pommes caramélisées, crème fraîche', price: 8.50 },
    { fam: 'Desserts', name: 'Cheesecake fruits rouges', desc: 'Fromage frais, coulis de framboises', price: 9.00 },
    { fam: 'Desserts', name: 'Mousse au chocolat', desc: 'Chocolat noir 70%, œufs fermiers', price: 7.50 },
    { fam: 'Boissons', name: 'Eau plate (75cl)', desc: 'Eau minérale naturelle', price: 4.00 },
    { fam: 'Boissons', name: 'Eau pétillante (75cl)', desc: 'Eau minérale gazeuse', price: 4.50 },
    { fam: 'Boissons', name: 'Coca-Cola', desc: 'Canette 33cl', price: 3.50 },
    { fam: 'Boissons', name: 'Jus d\'orange pressé', desc: 'Orange fraîchement pressée', price: 5.00 },
    { fam: 'Boissons', name: 'Vin rouge (verre)', desc: 'Côtes-du-Rhône, verre 12cl', price: 5.00 },
    { fam: 'Boissons', name: 'Vin blanc (verre)', desc: 'Sancerre, verre 12cl', price: 6.00 },
    { fam: 'Boissons', name: 'Bière pression (50cl)', desc: 'Blonde artisanale', price: 5.50 },
    { fam: 'Apéritifs', name: 'Coupe de Champagne', desc: 'Champagne brut 12cl', price: 8.00 },
    { fam: 'Apéritifs', name: 'Kir royal', desc: 'Crème de cassis, champagne', price: 9.00 },
    { fam: 'Apéritifs', name: 'Martini blanc', desc: 'Martini blanc, glaçons, citron', price: 6.00 },
    { fam: 'Apéritifs', name: 'Pastis', desc: 'Pastis de Marseille, à l\'eau', price: 5.00 },
  ]

  const prodBatch = products.map(p => ({
    family_id: familyIds[p.fam], name: p.name, description: p.desc, price: p.price, active: true,
  }))
  const { error: pe } = await supabase.from('products').insert(prodBatch)
  if (pe) { console.error('  Erreur:', pe.message); process.exit(1) }
  console.log(`  ✓ ${products.length} produits créés\n`)

  console.log('=== SEED TERMINÉ ===')
  console.log(`  ${rooms.length} salles`)
  console.log(`  ${tableDefs.length} tables`)
  console.log(`  ${families.length} familles`)
  console.log(`  ${products.length} produits`)
}

seed().catch(console.error)
