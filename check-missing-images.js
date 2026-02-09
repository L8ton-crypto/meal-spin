require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const missing = await sql`SELECT id, name, category FROM meals WHERE image_url IS NULL OR image_url = '' ORDER BY category, name`;
  console.log(`${missing.length} recipes without images:`);
  missing.forEach(m => console.log(`  [${m.category}] ${m.name} (id: ${m.id})`));
  
  const hasImage = await sql`SELECT id, name, image_url FROM meals WHERE image_url IS NOT NULL AND image_url != '' LIMIT 3`;
  console.log('\nSample with images:');
  hasImage.forEach(m => console.log(`  ${m.name}: ${m.image_url}`));
}

main().catch(console.error);
