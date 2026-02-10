require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      resolve({ status: res.statusCode, type: res.headers['content-type'] });
    }).on('error', (e) => resolve({ status: 0, error: e.message }));
  });
}

async function main() {
  const buddys = await sql`SELECT id, name, image_url FROM meals WHERE name LIKE 'Buddy%' ORDER BY name`;
  console.log(`Found ${buddys.length} Buddy's recipes:\n`);
  
  for (const r of buddys) {
    const result = await checkUrl(r.image_url);
    const ok = result.status === 200;
    console.log(`${ok ? '✅' : '❌'} ${r.name}`);
    console.log(`   URL: ${r.image_url}`);
    console.log(`   Status: ${result.status} ${result.type || result.error || ''}\n`);
  }
}

main().catch(console.error);
