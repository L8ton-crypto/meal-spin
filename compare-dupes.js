const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function compare() {
  // Check potential duplicates
  const suspects = [
    [22, 8],   // BBC Chicken Goujons vs Chicken Goujons
    [25, 46],  // Egg Fried Rice vs Egg Fried Rice with Kale
    [27, 1],   // Veggie Mac 'n' Cheese vs Mac and Cheese
  ];
  
  for (const [id1, id2] of suspects) {
    const [r1] = await sql`SELECT * FROM meals WHERE id = ${id1}`;
    const [r2] = await sql`SELECT * FROM meals WHERE id = ${id2}`;
    
    console.log('━'.repeat(60));
    console.log(`\n📋 COMPARING [${id1}] vs [${id2}]:\n`);
    
    console.log(`[${id1}] ${r1.name}`);
    console.log(`  Time: ${r1.prep_time + r1.cook_time}min`);
    console.log(`  Desc: ${r1.description.substring(0, 80)}...`);
    
    console.log(`\n[${id2}] ${r2.name}`);
    console.log(`  Time: ${r2.prep_time + r2.cook_time}min`);
    console.log(`  Desc: ${r2.description.substring(0, 80)}...`);
    
    // Check if essentially same
    const isSame = r1.description === r2.description || 
                   JSON.stringify(r1.ingredients) === JSON.stringify(r2.ingredients);
    console.log(`\n  → ${isSame ? '⚠️ LIKELY DUPLICATE' : '✅ Different recipes'}\n`);
  }
}

compare().catch(console.error);
