const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');
const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  const key = t.slice(0, i).trim();
  let val = t.slice(i + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  if (!process.env[key]) process.env[key] = val;
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const sql = fs.readFileSync('supabase/migrations/002_attributes.sql', 'utf-8');

async function run() {
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('RPC exec_sql not available:', error.message);
    console.log('Please run the migration manually in Supabase SQL Editor:');
    console.log('---');
    console.log(sql);
    console.log('---');
    process.exit(1);
  }
  console.log('Migration applied successfully');
}
run().catch(console.error);
