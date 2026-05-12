/**
 * Script de création de l'admin
 * Usage : node -e "process.env.NEXT_PUBLIC_SUPABASE_URL='$URL' process.env.SUPABASE_SERVICE_ROLE_KEY='$KEY'" scripts/seed-admin.js
 *
 * Ou simplement : node scripts/seed-admin.js
 * (les variables d'env sont déjà dans .env.local)
 */

const { createClient } = require('@supabase/supabase-js')

// Chargement manuel de .env.local
const fs = require('fs')
const path = require('path')
const envPath = path.resolve(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'khobzi.nassim@gmail.com'
const ADMIN_PASSWORD = process.argv[2] || 'admin123'

async function main() {
  console.log(`Création de l'admin : ${ADMIN_EMAIL}`)

  // 1. Créer l'utilisateur dans Auth
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  })

  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('→ L\'utilisateur existe déjà, mise à jour du profil...')
    } else {
      console.error('Erreur création :', createError.message)
      process.exit(1)
    }
  } else {
    console.log(`✓ Utilisateur créé : ${user.user.id}`)
  }

  // 2. Récupérer l'ID utilisateur
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const target = users.find(u => u.email === ADMIN_EMAIL)
  if (!target) {
    console.error('Utilisateur introuvable dans Auth')
    process.exit(1)
  }

  // 3. Forcer is_admin = true
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: target.id, email: ADMIN_EMAIL, is_admin: true }, { onConflict: 'id' })

  if (upsertError) {
    console.error('Erreur profil :', upsertError.message)
    process.exit(1)
  }

  console.log('✓ Profil marqué administrateur')
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Email    : ${ADMIN_EMAIL}`)
  console.log(`Mot passe : ${ADMIN_PASSWORD}`)
  console.log(`Connexion : http://localhost:3000/login`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━`)
}

main()
