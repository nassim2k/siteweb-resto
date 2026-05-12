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

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, is_admin')
    .eq('email', 'khobzi.nassim@gmail.com')
  if (error) { console.log('Erreur:', error.message); return }
  console.log(JSON.stringify(data, null, 2))
  if (data.length === 0) console.log('Aucun profil trouvé pour cet email')
}
main()
