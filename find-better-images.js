require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const unsplashRecipes = await sql`SELECT id, name, image_url FROM meals WHERE image_url LIKE '%unsplash%' ORDER BY name`;
  console.log(`${unsplashRecipes.length} recipes with Unsplash placeholders:`);
  unsplashRecipes.forEach(r => console.log(`  - ${r.name} (id: ${r.id})`));
}

main().catch(console.error);
