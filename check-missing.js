const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const all = await sql`
    SELECT id, name, ingredients, steps
    FROM meals
    ORDER BY name
  `;
  
  const missingIngredients = all.filter(r => {
    if (!r.ingredients) return true;
    if (typeof r.ingredients === 'string' && (r.ingredients === '[]' || r.ingredients === '')) return true;
    if (Array.isArray(r.ingredients) && r.ingredients.length === 0) return true;
    return false;
  });
  
  const missingSteps = all.filter(r => {
    if (!r.steps) return true;
    if (typeof r.steps === 'string' && (r.steps === '[]' || r.steps === '')) return true;
    if (Array.isArray(r.steps) && r.steps.length === 0) return true;
    return false;
  });
  
  console.log('Total recipes:', all.length);
  console.log('Missing ingredients:', missingIngredients.length);
  console.log('Missing steps:', missingSteps.length);
  console.log('');
  
  if (missingIngredients.length > 0) {
    console.log('Recipes missing ingredients:');
    missingIngredients.forEach(r => console.log(`  - [${r.id}] ${r.name}`));
    console.log('');
  }
  
  if (missingSteps.length > 0) {
    console.log('Recipes missing steps:');
    missingSteps.forEach(r => console.log(`  - [${r.id}] ${r.name}`));
  }
}

check().catch(console.error);
