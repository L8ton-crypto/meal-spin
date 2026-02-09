// Fix image URLs that were stored as JSON objects instead of plain strings
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Find image_urls that look like JSON objects
  const broken = await sql`SELECT id, name, image_url FROM meals WHERE image_url LIKE '{%'`;
  console.log(`Found ${broken.length} recipes with JSON image URLs\n`);
  
  for (const recipe of broken) {
    try {
      const parsed = JSON.parse(recipe.image_url);
      const url = parsed.url || parsed;
      if (typeof url === 'string' && url.startsWith('http')) {
        // Clean up the URL - remove the rect/resize params to get original
        const cleanUrl = url.split('?')[0] + '?w=600&h=400&fit=crop&fm=webp&q=75';
        await sql`UPDATE meals SET image_url = ${cleanUrl} WHERE id = ${recipe.id}`;
        console.log(`✅ ${recipe.name}: ${cleanUrl.substring(0, 80)}...`);
      } else {
        console.log(`❌ ${recipe.name}: couldn't extract URL from`, parsed);
      }
    } catch (e) {
      console.log(`❌ ${recipe.name}: parse error`, e.message);
    }
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
