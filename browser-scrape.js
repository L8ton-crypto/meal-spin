// Browser-assisted Sainsbury's scraper - run with extracted JSON-LD data
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Process recipe from JSON-LD data
function parseTime(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || 0) * 60) + parseInt(match[2] || 0);
}

async function addRecipe(jsonLd, slug) {
  const recipe = typeof jsonLd === 'string' ? JSON.parse(jsonLd) : jsonLd;
  
  const name = recipe.name;
  const prepTime = parseTime(recipe.prepTime);
  const cookTime = parseTime(recipe.cookTime);
  let totalTime = parseTime(recipe.totalTime) || (prepTime + cookTime);
  
  // Sainsbury's often has wrong times in schema - use realistic estimates
  if (totalTime > 120 && !name.toLowerCase().includes('slow')) {
    // Likely wrong, estimate from name
    if (name.toLowerCase().includes('15 minute')) totalTime = 15;
    else if (name.toLowerCase().includes('quick')) totalTime = 20;
    else totalTime = 30;
  }
  
  const servings = parseInt(recipe.recipeYield) || 4;
  const ingredients = recipe.recipeIngredient || [];
  const instructions = recipe.recipeInstructions || [];
  const imageUrl = recipe.image?.url || recipe.image || null;
  const sourceUrl = `https://www.sainsburys.co.uk/gol-ui/recipes/${slug}`;
  
  // Tags
  const tags = ['family', 'budget'];
  const nameLower = name.toLowerCase();
  const ingText = ingredients.join(' ').toLowerCase();
  
  if (nameLower.includes('air fryer')) tags.push('air-fryer');
  if (nameLower.includes('vegetable') || nameLower.includes('veggie') || nameLower.includes('vegan')) tags.push('vegetarian');
  if (nameLower.includes('chicken')) tags.push('chicken');
  if (nameLower.includes('fish') || nameLower.includes('salmon') || nameLower.includes('tuna')) tags.push('fish');
  if (nameLower.includes('pasta') || nameLower.includes('spaghetti') || nameLower.includes('mac')) tags.push('pasta');
  if (nameLower.includes('pancake') || nameLower.includes('french toast') || nameLower.includes('porridge')) tags.push('breakfast');
  if (nameLower.includes('chocolate') || nameLower.includes('brownie') || nameLower.includes('pudding')) tags.push('dessert');
  if (nameLower.includes('pizza')) tags.push('pizza');
  if (totalTime <= 30) tags.push('quick');
  
  // Allergens
  const allergens = [];
  if (ingText.includes('milk') || ingText.includes('cheese') || ingText.includes('cream') || ingText.includes('butter') || ingText.includes('mozzarella')) {
    allergens.push('dairy');
  }
  if (ingText.includes('egg')) allergens.push('eggs');
  if (ingText.includes('flour') || ingText.includes('bread') || ingText.includes('pasta') || ingText.includes('tortilla')) {
    allergens.push('gluten');
  }
  if (ingText.includes('peanut')) allergens.push('peanuts');
  if (ingText.includes('fish') || ingText.includes('salmon') || ingText.includes('tuna') || ingText.includes('cod')) allergens.push('fish');
  
  try {
    // Check if exists
    const existing = await pool.query('SELECT id FROM recipes WHERE source_url = $1', [sourceUrl]);
    if (existing.rows.length > 0) {
      console.log(`Already exists: ${name}`);
      return false;
    }
    
    await pool.query(`
      INSERT INTO recipes (name, prep_time, cook_time, total_time, servings, ingredients, instructions, image_url, tags, allergens, picky_friendly, source_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      name,
      prepTime,
      cookTime, 
      totalTime,
      servings,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      imageUrl,
      JSON.stringify(tags),
      JSON.stringify(allergens),
      true,
      sourceUrl
    ]);
    
    console.log(`✓ Added: ${name} (${totalTime}min)`);
    return true;
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    return false;
  }
}

// Add recipes passed via stdin (JSON array)
async function main() {
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', async () => {
    const recipes = JSON.parse(input);
    let added = 0;
    for (const { slug, data } of recipes) {
      const success = await addRecipe(data, slug);
      if (success) added++;
    }
    console.log(`\n✅ Added ${added} recipes`);
    
    const result = await pool.query('SELECT COUNT(*) FROM recipes');
    console.log(`📊 Total: ${result.rows[0].count}`);
    
    await pool.end();
  });
}

main();
