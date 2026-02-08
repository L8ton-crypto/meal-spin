const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// All Jamie Oliver cooking with kids recipes
const recipeUrls = [
  { name: "Boo-nana ghosts", url: "https://www.jamieoliver.com/recipes/halloween/boo-nana-ghosts", category: "snack" },
  { name: "Spooky red dip", url: "https://www.jamieoliver.com/recipes/halloween/spooky-red-dip", category: "snack" },
  { name: "Bat crackers", url: "https://www.jamieoliver.com/recipes/halloween/bat-crackers", category: "snack" },
  { name: "Spider pizzas", url: "https://www.jamieoliver.com/recipes/halloween/spider-pizzas", category: "main" },
  { name: "Apple monsters", url: "https://www.jamieoliver.com/recipes/halloween/apple-monsters", category: "snack" },
  { name: "Tex-mex bowl", url: "https://www.jamieoliver.com/recipes/quick-and-easy/tex-mex-bowl/", category: "main" },
  { name: "Cheesy corn flatbreads", url: "https://www.jamieoliver.com/recipes/bread/cheesy-corn-flatbreads/", category: "snack" },
  { name: "Mini veg tortillas", url: "https://www.jamieoliver.com/recipes/egg/mini-veg-tortillas/", category: "main" },
  { name: "Harissa falafel", url: "https://www.jamieoliver.com/recipes/vegetables/harissa-falafel/", category: "main" },
  { name: "Blueberry muffins", url: "https://www.jamieoliver.com/recipes/baking/blueberry-muffins/", category: "dessert" },
  { name: "Store-cupboard spaghetti with mackerel balls", url: "https://www.jamieoliver.com/recipes/pasta/store-cupboard-spaghetti-with-mackerel-balls/", category: "main" },
  { name: "Carrot cake pancakes", url: "https://www.jamieoliver.com/recipes/pancakes/carrot-cake-pancakes/", category: "breakfast" },
  { name: "Mini apple pancakes", url: "https://www.jamieoliver.com/recipes/fruit/mini-apple-pancakes/", category: "breakfast" },
  { name: "Hot cross bun bread & butter pudding", url: "https://www.jamieoliver.com/recipes/bread/hot-cross-bun-bread-butter-pudding/", category: "dessert" },
  { name: "Peanut butter & banana yoghurt bark", url: "https://www.jamieoliver.com/recipes/snacks/peanut-butter-banana-yoghurt-bark", category: "snack" },
  { name: "Black Forest fruits & coconut yoghurt bark", url: "https://www.jamieoliver.com/recipes/snacks/black-forest-fruits-coconut-yoghurt-bark", category: "snack" },
  { name: "Mint chocolate chip yoghurt bark", url: "https://www.jamieoliver.com/recipes/snacks/mint-chocolate-chip-yoghurt-bark", category: "snack" },
  { name: "Steak sarnie", url: "https://www.jamieoliver.com/recipes/steak/steak-sarnie/", category: "main" },
  { name: "Choccy microwave mug cake", url: "https://www.jamieoliver.com/recipes/microwave/choccy-microwave-mug-cake", category: "dessert" },
  { name: "Buddy's Ginger nut biscuits", url: "https://www.jamieoliver.com/recipes/biscuit/ginger-nut-biscuits", category: "dessert" },
  { name: "Mini quiches", url: "https://www.jamieoliver.com/recipes/quiche/mini-quiches/", category: "snack" },
  { name: "Egg tortilla wrap", url: "https://www.jamieoliver.com/recipes/eggs/egg-tortilla-wrap/", category: "breakfast" },
  { name: "Quick and easy pizzas", url: "https://www.jamieoliver.com/recipes/pizza/quick-and-easy-pizzas/", category: "main" },
  { name: "Spicy tomato pasta", url: "https://www.jamieoliver.com/recipes/pasta/spicy-tomato-pasta/", category: "main" },
  { name: "Fish finger sarnies", url: "https://www.jamieoliver.com/recipes/fish/fish-finger-sarnies/", category: "snack" },
  { name: "Brilliant banana sticky toffee pud", url: "https://www.jamieoliver.com/recipes/desserts/brilliant-banana-sticky-toffee-pud/", category: "dessert" },
  { name: "Buddy's super veggie burgers", url: "https://www.jamieoliver.com/recipes/vegetables/buddy-s-super-veggie-burgers/", category: "main" },
  { name: "Buddy's veggie nachos", url: "https://www.jamieoliver.com/recipes/vegetables/buddy-s-veggie-nachos/", category: "snack" },
  { name: "Buddy's grilled fruit salad", url: "https://www.jamieoliver.com/recipes/fruit/buddy-s-grilled-fruit-salad/", category: "dessert" },
  { name: "Buddy's barbecue ribs", url: "https://www.jamieoliver.com/recipes/pork/buddy-s-barbecue-ribs/", category: "main" },
  { name: "Buddy's tuna pasta", url: "https://www.jamieoliver.com/recipes/pasta/buddy-s-tuna-pasta/", category: "main" },
  { name: "Buddy's easy meatballs", url: "https://www.jamieoliver.com/recipes/pasta/buddys-easy-meatballs/", category: "main" },
  { name: "Buddy's quick pizzettas", url: "https://www.jamieoliver.com/recipes/pizza/buddys-quick-pizzettas/", category: "main" },
  { name: "Buddy's super-quick flatbreads", url: "https://www.jamieoliver.com/recipes/bread/buddy-s-super-quick-flatbreads/", category: "snack" },
  { name: "Buddy's crispy chicken", url: "https://www.jamieoliver.com/recipes/chicken/buddy-s-crispy-chicken/", category: "main" },
  { name: "Buddy's crispy-skinned fish", url: "https://www.jamieoliver.com/recipes/mackerel/buddy-s-crispy-skinned-fish/", category: "main" },
];

// This will be populated by browser scraping
// For now, add basic info and we'll enhance with JSON-LD data
async function addRecipe(recipe, jsonLd) {
  try {
    // Check if exists
    const existing = await sql`SELECT id FROM meals WHERE name = ${recipe.name}`;
    if (existing.length > 0) {
      console.log(`⏭️  Exists: ${recipe.name}`);
      return false;
    }

    let data = {
      name: recipe.name,
      description: jsonLd?.description || `Jamie Oliver's ${recipe.name} - a kid-friendly recipe`,
      prep_time: 10,
      cook_time: 15,
      category: recipe.category,
      ingredients: [],
      steps: [],
      allergens: [],
      image: null
    };

    if (jsonLd) {
      // Parse time
      const parseTime = (t) => {
        if (!t) return 0;
        const m = t.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!m) return 0;
        return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
      };

      data.prep_time = parseTime(jsonLd.prepTime) || 5;
      data.cook_time = parseTime(jsonLd.cookTime) || parseTime(jsonLd.totalTime) || 10;
      
      // Ingredients
      if (jsonLd.recipeIngredient) {
        data.ingredients = jsonLd.recipeIngredient
          .filter(i => !i.startsWith("YOU'LL"))
          .map(i => ({ item: i, amount: "" }));
      }
      
      // Steps
      if (jsonLd.recipeInstructions) {
        data.steps = jsonLd.recipeInstructions.map(s => 
          typeof s === 'string' ? s : s.text
        );
      }
      
      // Image
      if (jsonLd.image) {
        data.image = Array.isArray(jsonLd.image) 
          ? jsonLd.image[0]?.url || jsonLd.image[0]
          : jsonLd.image?.url || jsonLd.image;
      }
      
      // Allergens from keywords/diets
      const keywords = (jsonLd.keywords || '').toLowerCase();
      if (!keywords.includes('gluten-free')) data.allergens.push('gluten');
      if (!keywords.includes('dairy-free') && !keywords.includes('vegan')) data.allergens.push('dairy');
      if (keywords.includes('egg') || recipe.name.toLowerCase().includes('egg')) data.allergens.push('eggs');
      if (keywords.includes('fish') || recipe.name.toLowerCase().includes('fish')) data.allergens.push('fish');
      if (keywords.includes('nut') || recipe.name.toLowerCase().includes('peanut')) data.allergens.push('nuts');
    }

    await sql`
      INSERT INTO meals (name, description, prep_time, cook_time, servings, image_url, is_picky_eater_friendly, allergens, ingredients, steps, nutrition, category)
      VALUES (${data.name}, ${data.description}, ${data.prep_time}, ${data.cook_time}, ${4}, ${data.image}, ${true}, ${data.allergens}, ${JSON.stringify(data.ingredients)}, ${JSON.stringify(data.steps)}, ${JSON.stringify({})}, ${data.category})
    `;
    
    console.log(`✅ Added: ${data.name} (${data.prep_time + data.cook_time}min) [${data.category}]`);
    return true;
  } catch (e) {
    console.log(`❌ Error: ${recipe.name}: ${e.message}`);
    return false;
  }
}

// Read JSON-LD data from stdin (piped from browser scraper)
async function main() {
  let input = '';
  
  if (process.stdin.isTTY) {
    // No stdin, just add with defaults
    console.log("🍳 Adding Jamie Oliver recipes (basic info)...\n");
    let added = 0;
    for (const r of recipeUrls) {
      if (await addRecipe(r, null)) added++;
    }
    console.log(`\n✨ Added ${added} recipes`);
  } else {
    // Read JSON-LD data from stdin
    process.stdin.on('data', chunk => input += chunk);
    process.stdin.on('end', async () => {
      console.log("🍳 Adding Jamie Oliver recipes with full data...\n");
      const jsonData = JSON.parse(input);
      let added = 0;
      for (const item of jsonData) {
        const recipe = recipeUrls.find(r => r.url === item.url);
        if (recipe && await addRecipe(recipe, item.data)) added++;
      }
      console.log(`\n✨ Added ${added} recipes`);
      
      const summary = await sql`SELECT category, COUNT(*) as count FROM meals GROUP BY category ORDER BY category`;
      console.log('\n📊 Category totals:');
      summary.forEach(s => console.log(`  ${s.category}: ${s.count}`));
    });
  }
}

main().catch(console.error);
