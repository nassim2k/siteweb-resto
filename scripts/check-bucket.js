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
  // Check bucket exists
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) { console.log('Error:', error.message); return }
  
  console.log('Buckets:')
  for (const b of buckets) {
    console.log(`  ${b.id}: public=${b.public}, name=${b.name}`)
  }

  // Check if restaurant-images bucket is public
  const bucket = buckets.find(b => b.id === 'restaurant-images')
  if (bucket && !bucket.public) {
    console.log('\nBucket is NOT public. Making it public...')
    const { error: updateErr } = await supabase.storage.updateBucket('restaurant-images', { public: true })
    if (updateErr) console.log('Update error:', updateErr.message)
    else console.log('Bucket is now public')
  }
}
main()
