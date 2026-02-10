require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
  });
}

async function main() {
  const names = [
    "Buddy's Crispy-Skinned Fish",
    "Beans on Toast",
    "Chicken Nuggets",
    "Mini Veg Tortillas",
    "Bat Crackers",
    "Apple Monsters",
    "Boo-nana Ghosts",
    "Spider Pizzas",
    "Spooky Red Dip",
  ];

  for (const name of names) {
    const rows = await sql`SELECT id, name, image_url, ingredients, steps FROM meals WHERE name = ${name}`;
    if (rows.length === 0) {
      console.log(`❌ NOT FOUND: ${name}\n`);
      continue;
    }
    const r = rows[0];
    const imgStatus = r.image_url ? await checkUrl(r.image_url) : 'NULL';
    const ingCount = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
    const stepCount = Array.isArray(r.steps) ? r.steps.length : 0;
    
    console.log(`--- ${r.name} (id: ${r.id}) ---`);
    console.log(`  Image: ${imgStatus} | ${r.image_url ? r.image_url.substring(0, 80) + '...' : 'NULL'}`);
    console.log(`  Ingredients: ${ingCount} items${ingCount === 0 ? ' ⚠️ EMPTY' : ''}`);
    if (ingCount > 0) console.log(`    First: ${JSON.stringify(r.ingredients[0])}`);
    console.log(`  Steps: ${stepCount} items${stepCount === 0 ? ' ⚠️ EMPTY' : ''}`);
    console.log('');
  }
}

main().catch(console.error);
