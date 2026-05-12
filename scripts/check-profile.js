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
  const userId = '2241cb0f-8bbb-4dfc-a8ba-08bea82f883a'
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    
  console.log('Profile query result:', JSON.stringify({ data: profile, error: error?.message }, null, 2))

  const { data: byEmail, error: err2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'khobzi.nassim@gmail.com')

  console.log('By email:', JSON.stringify({ data: byEmail, error: err2?.message }, null, 2))
}
main()
