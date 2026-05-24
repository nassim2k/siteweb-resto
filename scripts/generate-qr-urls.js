/**
 * Script de génération d'URL sécurisées pour QR codes
 * 
 * Utilisation :
 *   node scripts/generate-qr-urls.js
 * 
 * Ça génère un fichier QR_CODE_URLS.txt avec toutes les URLs
 * à imprimer sur les QR codes de chaque table.
 */

const crypto = require('crypto');

const SECRET_KEY = process.env.TABLE_SECRET || 'pos-web-table-secret-2024-change-in-production';
const DOMAIN = process.env.DOMAIN || 'https://siteweb-resto.vercel.app';

// Générer une URL pour une table
function generateUrl(tableId) {
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(String(tableId))
    .digest('hex')
    .substring(0, 16);

  return {
    tableId,
    signature,
    url: `${DOMAIN}/call?t=${tableId}&s=${signature}`,
  };
}

// Générer pour N tables
function generateAllTables(numTables) {
  const results = [];
  for (let i = 1; i <= numTables; i++) {
    results.push(generateUrl(i));
  }
  return results;
}

// Afficher
const tables = generateAllTables(20);
console.log('=== URLs sécurisées pour QR codes ===\n');
tables.forEach(t => {
  console.log(`Table ${String(t.tableId).padStart(2, '0')} : ${t.url}`);
  console.log(`  Signature: ${t.signature}\n`);
});

// Export pour usage programmatique
module.exports = { generateUrl, generateAllTables };
