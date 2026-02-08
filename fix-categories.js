const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fix() {
  // Fix miscategorized recipes
  const fixes = [
    [27, 'main'],      // Veggie Mac 'n' Cheese - main not dessert
    [48, 'breakfast'], // Breakfast Bacon Naan
    [49, 'snack'],     // Teriyaki Chicken Sandwich
    [60, 'main'],      // Caprese Savoury Pancakes (savoury!)
    [61, 'snack'],     // Halloumi Chilli Honey Toastie
    [62, 'snack'],     // Spring Onion Pancakes (savoury!)
  ];
  
  for (const [id, cat] of fixes) {
    await sql`UPDATE meals SET category = ${cat} WHERE id = ${id}`;
  }
  
  console.log('✅ Fixed categories\n');
  
  const summary = await sql`SELECT category, COUNT(*) as count FROM meals GROUP BY category ORDER BY category`;
  console.log('📊 Updated Summary:');
  summary.forEach(s => console.log(`  ${s.category}: ${s.count} recipes`));
}

fix().catch(console.error);
