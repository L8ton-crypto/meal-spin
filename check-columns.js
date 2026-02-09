require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='meals' ORDER BY ordinal_position`;
  console.log('Columns:', cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  
  // Check how many have source_url or image_url populated
  const stats = await sql`SELECT 
    COUNT(*) as total,
    COUNT(image_url) as has_image,
    COUNT(NULLIF(image_url, '')) as has_image_nonempty
  FROM meals`;
  console.log('Stats:', stats[0]);
  
  // Sample a few recipes to see what source info we have
  const sample = await sql`SELECT id, name, image_url, category FROM meals LIMIT 5`;
  console.log('Sample:', sample);
}

main().catch(console.error);
