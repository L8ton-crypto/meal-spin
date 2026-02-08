const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function getMissing() {
  const all = await sql`
    SELECT id, name, image_url
    FROM meals
    WHERE ingredients IS NULL 
       OR ingredients = '[]'::jsonb 
       OR jsonb_array_length(ingredients) = 0
    ORDER BY id
  `;
  
  console.log('Missing recipes:', all.length);
  console.log('');
  
  // Try to derive URLs from image URLs or names
  all.forEach(r => {
    // Jamie Oliver images usually contain recipe slug
    const slug = r.name
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    console.log(`${r.id}: ${r.name}`);
    console.log(`   Slug guess: ${slug}`);
    console.log(`   Image: ${r.image_url}`);
    console.log('');
  });
}

getMissing().catch(console.error);
