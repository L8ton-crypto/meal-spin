require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`SELECT id, name, ingredients, steps FROM meals WHERE name LIKE '%Spicy Tomato%'`;
  const r = rows[0];
  console.log(`${r.name} (id: ${r.id})`);
  console.log(`Ingredients (${r.ingredients?.length || 0}):`);
  console.log(JSON.stringify(r.ingredients, null, 2));
  console.log(`\nSteps (${r.steps?.length || 0}):`);
  console.log(JSON.stringify(r.steps, null, 2));
}
main().catch(console.error);
