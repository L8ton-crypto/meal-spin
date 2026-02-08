// Sainsbury's Recipe Scraper for MealSpin
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Recipe URLs from "Feed your family for a fiver" scrapbook
const recipeUrls = [
  'air-fryer-sweet-and-sour-cauliflower',
  'french-onion-soup-with-cheddar-croutons',
  'egg-fried-rice-with-kale-garlic',
  'cajun-carrot-and-black-bean-burgers',
  'whipped-feta-and-mint-greek-style-pasta-salad',
  'frying-pan-sausage-tortillas',
  'air-fryer-indian-spiced-chicken',
  'breakfast-in-bed-bacon-naan',
  'milk-chocolate-brownie-ganache-pots',
  'butternut-squash-tart-with-greek-cheese-and-thyme',
  'chocolate-banana-and-peanut-mini-calzones',
  'baked-feta-with-harissa-chickpeas',
  'teriyaki-crispy-chicken-sando',
  'caramel-apple-layered-pudding-pots',
  'cauliflower-biryani',
  'pea-and-mint-cannelloni-bake',
  'chicken-parm-toasties',
  'greek-inspired-frying-pan-pizzettes',
  'whole-tikka-curry-cauliflower',
  'choco-peanut-banana-lollies',
  'french-toast-crumpets',
  'Salted-toffee-apple-pancakes',
  'patatas-bravas-jackets-with-a-courgette-salad',
  'Peachy-flapjacks',
  'Cacio-e-Pepe-mac-and-cheese',
  'Air-fryer-fish-finger-sarnie',
  'Air-fryer-salmon-fish-cakes',
  'Air-fryer-chicken-wings-with-garlic-mayo',
  'honey-and-banana-french-toast',
  'spiced-chickpeas',
  'broccoli-cheese-baked-potatoes',
  'vegetable-fattoush-salad',
  'ricotta-lemon-and-crispy-kale-pasta',
  'cauliflower-cheese-soup',
  'slow-cooker-vegetable-curry',
  'microwave-porridge-with-apple-nuts-and-raisins',
  'curried-parsnip-soup',
  'air-fryer-jackets-with-veggie-chilli',
  'carrot-and-ginger-soup',
  'spicy-bean-soup-with-pickled-onions-and-tortillas',
  'veggie-spaghetti-bolognese',
  'naked-vegan-burrito-bowl',
  'hawaiian-pizza',
  'tuna-spaghetti',
  'vegan-shepherds-pie',
  'smashed-pea-and-chilli-bagels',
  'lemon-salmon-spaghetti',
  'halloumi-and-chilli-honey-toastie',
  'hoisin-mushroom-bao-buns',
  'air-fryer-cinnamon-crumpet-bites',
  'mini-dutch-pancakes-with-berry-marbled-yoghurt-and-chocolate',
  'spring-onion-pancakes-with-dipping-sauce',
  'chicken-congee-and-crispy-onions',
  'blood-orange-sorbet'
];

// Kid-friendly filter: skip recipes with strong/spicy flavors kids typically don't like
const skipRecipes = [
  'french-onion-soup-with-cheddar-croutons', // 2hr cook, onion-heavy
  'aubergine-flatbreads-with-labneh-and-herb-drizzle', // aubergine, labneh
  'satay-aubergine-and-green-bean-salad', // aubergine
  'harissa-honey-carrot-and-chickpea-salad-with-lemony-labneh', // 12hr, harissa
  'baked-feta-with-harissa-chickpeas', // harissa
  'gazpacho-with-lemony-croutons', // cold soup
  'spiced-chickpeas', // spicy
  'vegetable-fattoush-salad', // salad
  'curried-parsnip-soup', // curry, parsnip
  'spicy-bean-soup-with-pickled-onions-and-tortillas', // spicy
  'blood-orange-sorbet', // needs ice cream maker
  'whole-tikka-curry-cauliflower', // whole cauliflower
];

async function fetchRecipeDetails(slug) {
  const url = `https://www.sainsburys.co.uk/gol-ui/recipes/${slug}`;
  
  try {
    // Use fetch with browser-like headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      }
    });
    
    if (!response.ok) {
      console.log(`  Failed to fetch ${slug}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extract recipe data from HTML using regex (Sainsbury's uses structured data)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (!jsonLdMatch) {
      console.log(`  No structured data found for ${slug}`);
      return null;
    }
    
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      // Find the Recipe schema
      const recipe = Array.isArray(data) 
        ? data.find(d => d['@type'] === 'Recipe')
        : data['@type'] === 'Recipe' ? data : null;
        
      if (!recipe) {
        console.log(`  No Recipe schema for ${slug}`);
        return null;
      }
      
      return recipe;
    } catch (e) {
      console.log(`  Failed to parse JSON for ${slug}: ${e.message}`);
      return null;
    }
  } catch (e) {
    console.log(`  Error fetching ${slug}: ${e.message}`);
    return null;
  }
}

function parseTime(duration) {
  // Parse ISO 8601 duration like "PT30M" or "PT1H30M"
  if (!duration) return null;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || 0);
  const mins = parseInt(match[2] || 0);
  return hours * 60 + mins;
}

function formatIngredients(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  return ingredients.map(ing => {
    // Clean up ingredient strings - already formatted nicely by Sainsbury's
    return ing.trim();
  });
}

function formatInstructions(instructions) {
  if (!instructions) return [];
  if (Array.isArray(instructions)) {
    return instructions.map(step => {
      if (typeof step === 'string') return step;
      if (step.text) return step.text;
      return step.toString();
    });
  }
  if (typeof instructions === 'string') {
    return instructions.split(/\n+/).filter(s => s.trim());
  }
  return [];
}

async function addRecipe(recipe, slug) {
  const name = recipe.name;
  const prepTime = parseTime(recipe.prepTime) || 0;
  const cookTime = parseTime(recipe.cookTime) || 0;
  const totalTime = parseTime(recipe.totalTime) || (prepTime + cookTime);
  
  // Extract servings
  let servings = 4;
  if (recipe.recipeYield) {
    const yieldMatch = String(recipe.recipeYield).match(/(\d+)/);
    if (yieldMatch) servings = parseInt(yieldMatch[1]);
  }
  
  const ingredients = formatIngredients(recipe.recipeIngredient);
  const instructions = formatInstructions(recipe.recipeInstructions);
  const imageUrl = recipe.image?.url || recipe.image?.[0]?.url || recipe.image || null;
  
  // Determine tags based on recipe content
  const tags = ['family', 'budget'];
  const nameLower = name.toLowerCase();
  const ingText = ingredients.join(' ').toLowerCase();
  
  if (nameLower.includes('air fryer') || ingText.includes('air fryer')) tags.push('air-fryer');
  if (nameLower.includes('vegetable') || nameLower.includes('veggie') || nameLower.includes('vegan')) tags.push('vegetarian');
  if (nameLower.includes('chicken')) tags.push('chicken');
  if (nameLower.includes('fish') || nameLower.includes('salmon') || nameLower.includes('tuna')) tags.push('fish');
  if (nameLower.includes('pasta') || nameLower.includes('spaghetti')) tags.push('pasta');
  if (nameLower.includes('soup')) tags.push('soup');
  if (nameLower.includes('pancake') || nameLower.includes('french toast') || nameLower.includes('porridge')) tags.push('breakfast');
  if (nameLower.includes('chocolate') || nameLower.includes('brownie') || nameLower.includes('calzone') || nameLower.includes('sorbet') || nameLower.includes('flapjack')) tags.push('dessert');
  if (totalTime <= 30) tags.push('quick');
  
  // Check for allergens
  const allergens = [];
  if (ingText.includes('milk') || ingText.includes('cheese') || ingText.includes('cream') || ingText.includes('butter') || ingText.includes('yogurt')) {
    allergens.push('dairy');
  }
  if (ingText.includes('egg')) allergens.push('eggs');
  if (ingText.includes('flour') || ingText.includes('bread') || ingText.includes('pasta') || ingText.includes('naan') || ingText.includes('tortilla')) {
    allergens.push('gluten');
  }
  if (ingText.includes('peanut')) allergens.push('peanuts');
  if (ingText.includes('fish') || ingText.includes('salmon') || ingText.includes('tuna') || ingText.includes('cod')) allergens.push('fish');
  
  const sourceUrl = `https://www.sainsburys.co.uk/gol-ui/recipes/${slug}`;
  
  try {
    // Check if already exists
    const existing = await pool.query('SELECT id FROM recipes WHERE source_url = $1', [sourceUrl]);
    if (existing.rows.length > 0) {
      console.log(`  Already exists: ${name}`);
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
      true, // picky_friendly - all are family-friendly
      sourceUrl
    ]);
    
    console.log(`  ✓ Added: ${name} (${totalTime}min)`);
    return true;
  } catch (e) {
    console.log(`  ✗ DB error for ${name}: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('🍽️ Sainsbury\'s Recipe Scraper for MealSpin\n');
  
  const recipesToScrape = recipeUrls.filter(r => !skipRecipes.includes(r));
  console.log(`Scraping ${recipesToScrape.length} recipes (skipped ${skipRecipes.length} non-kid-friendly)...\n`);
  
  let added = 0;
  let failed = 0;
  
  for (const slug of recipesToScrape) {
    console.log(`Fetching: ${slug}`);
    const recipe = await fetchRecipeDetails(slug);
    
    if (recipe) {
      const success = await addRecipe(recipe, slug);
      if (success) added++;
      else failed++;
    } else {
      failed++;
    }
    
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n✅ Done! Added ${added} recipes, ${failed} failed/skipped`);
  
  // Show total count
  const result = await pool.query('SELECT COUNT(*) FROM recipes');
  console.log(`📊 Total recipes in MealSpin: ${result.rows[0].count}`);
  
  await pool.end();
}

main().catch(console.error);
