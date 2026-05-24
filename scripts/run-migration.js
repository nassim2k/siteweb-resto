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

const migrationFile = process.argv[2] || '009_infos_etablissement.sql';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const sql = fs.readFileSync(path.resolve('supabase/migrations', migrationFile), 'utf-8');

async function run() {
  // Try exec_sql RPC
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (!error) {
    console.log('Migration applied successfully via exec_sql');
    return;
  }
  console.log('RPC exec_sql not available, trying to create it via pg connection...');

  // Try direct pg connection with pg module
  try {
    const { Client } = require('pg');
    const client = new Client({
      host: `db.${process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.+)\.supabase/)[1]}.supabase.co`,
      database: 'postgres',
      user: 'postgres',
      port: 5432,
      password: process.env.SUPABASE_DB_PASSWORD || '',
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    // First create the exec_sql function, then run the migration
    await client.query(`
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$ BEGIN EXECUTE sql; END; $$;
    `);
    await client.query(sql);
    await client.end();
    console.log('Migration applied successfully via direct pg connection');
    return;
  } catch (pgError) {
    console.log('Direct pg connection failed:', pgError.message);
  }

  console.log('\nAll automatic methods failed.');
  console.log('Please run this SQL in Supabase Dashboard > SQL Editor:\n');
  console.log('---');
  console.log(sql);
  console.log('---');
  process.exit(1);
}
run().catch(console.error);
