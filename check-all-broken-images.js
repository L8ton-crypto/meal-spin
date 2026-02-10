require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
  });
}

async function main() {
  const all = await sql`SELECT id, name, image_url FROM meals WHERE image_url LIKE '%img.jamieoliver%' ORDER BY name`;
  console.log(`${all.length} recipes using old Jamie Oliver CDN:\n`);
  
  for (const r of all) {
    const status = await checkUrl(r.image_url);
    console.log(`${status === 200 ? '✅' : '❌'} [${status}] ${r.name}`);
    console.log(`   ${r.image_url}\n`);
  }
}

main().catch(console.error);
