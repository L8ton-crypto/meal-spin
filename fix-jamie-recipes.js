const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

// Map recipe names to Jamie Oliver URLs
const recipeUrls = {
  'Boo-nana Ghosts': 'https://www.jamieoliver.com/recipes/halloween/boo-nana-ghosts',
  'Spooky Red Dip': 'https://www.jamieoliver.com/recipes/halloween/spooky-red-dip',
  'Bat Crackers': 'https://www.jamieoliver.com/recipes/halloween/bat-crackers',
  'Spider Pizzas': 'https://www.jamieoliver.com/recipes/halloween/spider-pizzas',
  'Apple Monsters': 'https://www.jamieoliver.com/recipes/halloween/apple-monsters',
  'Tex-Mex Bowl': 'https://www.jamieoliver.com/recipes/quick-and-easy/tex-mex-bowl/',
  'Cheesy Corn Flatbreads': 'https://www.jamieoliver.com/recipes/bread/cheesy-corn-flatbreads/',
  'Harissa Falafel': 'https://www.jamieoliver.com/recipes/vegetables/harissa-falafel/',
  'Store-Cupboard Mackerel Pasta': 'https://www.jamieoliver.com/recipes/pasta/store-cupboard-spaghetti-with-mackerel-balls/',
  'Carrot Cake Pancakes': 'https://www.jamieoliver.com/recipes/pancakes/carrot-cake-pancakes/',
  'Hot Cross Bun Bread Pudding': 'https://www.jamieoliver.com/recipes/bread/hot-cross-bun-bread-butter-pudding/',
  'Black Forest Yoghurt Bark': 'https://www.jamieoliver.com/recipes/snacks/black-forest-fruits-coconut-yoghurt-bark',
  'Mint Choc Chip Yoghurt Bark': 'https://www.jamieoliver.com/recipes/snacks/mint-chocolate-chip-yoghurt-bark',
  'Steak Sarnie': 'https://www.jamieoliver.com/recipes/steak/steak-sarnie/',
  'Mini Quiches': 'https://www.jamieoliver.com/recipes/quiche/mini-quiches/',
  'Egg Tortilla Wrap': 'https://www.jamieoliver.com/recipes/eggs/egg-tortilla-wrap/',
  'Quick and Easy Pizzas': 'https://www.jamieoliver.com/recipes/pizza/quick-and-easy-pizzas/',
  'Spicy Tomato Pasta': 'https://www.jamieoliver.com/recipes/pasta/spicy-tomato-pasta/',
  'Banana Sticky Toffee Pudding': 'https://www.jamieoliver.com/recipes/desserts/brilliant-banana-sticky-toffee-pud/',
  "Buddy's Super Veggie Burgers": 'https://www.jamieoliver.com/recipes/vegetables/buddy-s-super-veggie-burgers/',
  "Buddy's Grilled Fruit Salad": 'https://www.jamieoliver.com/recipes/fruit/buddy-s-grilled-fruit-salad/',
  "Buddy's Barbecue Ribs": 'https://www.jamieoliver.com/recipes/pork/buddy-s-barbecue-ribs/',
  "Buddy's Super-Quick Flatbreads": 'https://www.jamieoliver.com/recipes/bread/buddy-s-super-quick-flatbreads/',
  "Buddy's Crispy-Skinned Fish": 'https://www.jamieoliver.com/recipes/mackerel/buddy-s-crispy-skinned-fish/'
};

async function fetchRecipe(url) {
  const res = await fetch(url);
  const html = await res.text();
  
  // Extract JSON-LD - may have multiple script tags
  const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  
  for (const match of matches) {
    try {
      let data = JSON.parse(match[1]);
      
      // Handle @graph wrapper
      if (data['@graph']) {
        data = data['@graph'];
      }
      
      // Find Recipe in array
      const recipe = Array.isArray(data) 
        ? data.find(d => d['@type'] === 'Recipe') 
        : (data['@type'] === 'Recipe' ? data : null);
      
      if (!recipe) continue;
      
      // Parse instructions - can be string, array, or array of objects
      let steps = [];
      const instr = recipe.recipeInstructions;
      if (typeof instr === 'string') {
        steps = [instr];
      } else if (Array.isArray(instr)) {
        steps = instr.map(s => {
          if (typeof s === 'string') return s;
          if (s.text) return s.text;
          if (s['@type'] === 'HowToStep') return s.text || s.name || '';
          return JSON.stringify(s);
        }).filter(Boolean);
      }
      
      const prepTime = parseTime(recipe.prepTime);
      const cookTime = parseTime(recipe.cookTime);
      const totalTime = parseTime(recipe.totalTime);
      
      return {
        name: recipe.name,
        description: recipe.description || '',
        image: Array.isArray(recipe.image) ? recipe.image[0] : (recipe.image?.url || recipe.image),
        prepTime: prepTime || Math.max(1, (totalTime || 10) - (cookTime || 0)),
        cookTime: cookTime || 0,
        totalTime: totalTime,
        servings: parseInt(recipe.recipeYield) || 4,
        ingredients: recipe.recipeIngredient || [],
        steps: steps,
        nutrition: recipe.nutrition || null
      };
    } catch (e) {
      // Try next match
      continue;
    }
  }
  
  return null;
}

function parseTime(iso) {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1]) || 0;
  const mins = parseInt(match[2]) || 0;
  return hours * 60 + mins;
}

async function main() {
  // Get missing recipes
  const missing = await sql`
    SELECT id, name
    FROM meals
    WHERE ingredients IS NULL 
       OR ingredients = '[]'::jsonb 
       OR jsonb_array_length(ingredients) = 0
    ORDER BY id
  `;
  
  console.log(`Found ${missing.length} recipes to fix\n`);
  
  let fixed = 0;
  let failed = 0;
  
  for (const row of missing) {
    const url = recipeUrls[row.name];
    if (!url) {
      console.log(`❌ No URL for: ${row.name}`);
      failed++;
      continue;
    }
    
    console.log(`Fetching: ${row.name}...`);
    
    try {
      const recipe = await fetchRecipe(url);
      if (!recipe) {
        console.log(`  ⚠️ Could not parse recipe data`);
        failed++;
        continue;
      }
      
      if (recipe.ingredients.length === 0) {
        console.log(`  ⚠️ No ingredients found`);
        failed++;
        continue;
      }
      
      // Update database
      await sql`
        UPDATE meals SET
          description = ${recipe.description},
          image_url = ${recipe.image || null},
          prep_time = ${recipe.prepTime},
          cook_time = ${recipe.cookTime},
          servings = ${recipe.servings},
          ingredients = ${JSON.stringify(recipe.ingredients)},
          steps = ${JSON.stringify(recipe.steps)},
          nutrition = ${recipe.nutrition ? JSON.stringify(recipe.nutrition) : null}
        WHERE id = ${row.id}
      `;
      
      console.log(`  ✅ Updated: ${recipe.ingredients.length} ingredients, ${recipe.steps.length} steps`);
      fixed++;
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
      failed++;
    }
    
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\nDone! Fixed: ${fixed}, Failed: ${failed}`);
}

main().catch(console.error);
