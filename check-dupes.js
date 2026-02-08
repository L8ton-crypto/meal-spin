const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkDupes() {
  // Get all recipes
  const all = await sql`SELECT id, name, prep_time, cook_time FROM meals ORDER BY name`;
  
  console.log('📋 All recipes in MealSpin:\n');
  all.forEach(r => console.log(`  [${r.id}] ${r.name} (${r.prep_time + r.cook_time}min)`));
  console.log(`\n📊 Total: ${all.length} recipes`);
  
  // Check for exact duplicates
  const dupes = await sql`SELECT name, COUNT(*) as c FROM meals GROUP BY name HAVING COUNT(*) > 1`;
  
  if (dupes.length) {
    console.log('\n⚠️ DUPLICATES FOUND:');
    dupes.forEach(d => console.log(`  "${d.name}": ${d.c} copies`));
  } else {
    console.log('\n✅ No exact duplicates found');
  }
  
  // Check for similar names (potential dupes)
  console.log('\n🔍 Checking for similar names...');
  const names = all.map(r => ({ id: r.id, name: r.name, lower: r.name.toLowerCase().replace(/[^a-z0-9]/g, '') }));
  const similar = [];
  
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      // Check if one name contains the other or they're very similar
      if (names[i].lower.includes(names[j].lower) || names[j].lower.includes(names[i].lower)) {
        similar.push([names[i], names[j]]);
      }
    }
  }
  
  if (similar.length) {
    console.log('\n⚠️ Similar names (potential duplicates):');
    similar.forEach(([a, b]) => console.log(`  [${a.id}] "${a.name}" ~ [${b.id}] "${b.name}"`));
  } else {
    console.log('✅ No similar names found');
  }
}

checkDupes().catch(console.error);
