// More Sainsbury's recipes to scrape via browser
// Run this after getting JSON-LD from each page via browser

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// New kid-friendly recipes to add (not already in DB)
const newRecipes = [
  {
    slug: "egg-fried-rice-with-kale-garlic",
    name: "Egg Fried Rice with Kale",
    prep_time: 10,
    cook_time: 15,
    description: "Quick and tasty egg fried rice with crispy garlic - a family favourite",
    ingredients: [
      { item: "Cooked rice", amount: "400g" },
      { item: "Eggs", amount: "3" },
      { item: "Kale", amount: "100g, chopped" },
      { item: "Garlic", amount: "4 cloves, sliced" },
      { item: "Soy sauce", amount: "2 tbsp" },
      { item: "Vegetable oil", amount: "3 tbsp" }
    ],
    steps: [
      "Heat oil in wok, fry garlic until crispy and golden, set aside",
      "Scramble eggs in wok, push to side",
      "Add kale, stir-fry 2 mins",
      "Add cold rice, toss well with soy sauce",
      "Top with crispy garlic and serve"
    ],
    allergens: ["eggs", "soy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/egg-fried-rice-with-kale-garlic/original.jpg"
  },
  {
    slug: "air-fryer-indian-spiced-chicken",
    name: "Air Fryer Indian Spiced Chicken",
    prep_time: 10,
    cook_time: 15,
    description: "Quick and flavourful spiced chicken thighs in the air fryer",
    ingredients: [
      { item: "Chicken thighs", amount: "8" },
      { item: "Natural yogurt", amount: "150g" },
      { item: "Tikka paste", amount: "3 tbsp" },
      { item: "Rice", amount: "300g" },
      { item: "Naan bread", amount: "4" }
    ],
    steps: [
      "Mix yogurt and tikka paste, coat chicken and marinate 10 mins",
      "Air fry at 200°C for 12-15 mins until cooked through",
      "Cook rice and warm naan",
      "Serve chicken with rice and naan"
    ],
    allergens: ["dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/air-fryer-indian-spiced-chicken/original.jpg"
  },
  {
    slug: "breakfast-in-bed-bacon-naan",
    name: "Breakfast Bacon Naan",
    prep_time: 10,
    cook_time: 15,
    description: "Crispy bacon and eggs on warm naan bread - a weekend treat",
    ingredients: [
      { item: "Naan bread", amount: "4" },
      { item: "Bacon rashers", amount: "8" },
      { item: "Eggs", amount: "4" },
      { item: "Cheddar cheese", amount: "100g, grated" },
      { item: "Butter", amount: "20g" }
    ],
    steps: [
      "Grill or fry bacon until crispy",
      "Warm naan in oven or toaster",
      "Fry eggs in butter",
      "Top naan with bacon, egg and cheese"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/breakfast-in-bed-bacon-naan/original.jpg"
  },
  {
    slug: "teriyaki-crispy-chicken-sando",
    name: "Teriyaki Chicken Sandwich",
    prep_time: 10,
    cook_time: 20,
    description: "Crispy chicken with sweet teriyaki sauce in a soft bun",
    ingredients: [
      { item: "Chicken breast", amount: "2" },
      { item: "Breadcrumbs", amount: "100g" },
      { item: "Egg", amount: "1" },
      { item: "Teriyaki sauce", amount: "4 tbsp" },
      { item: "Brioche buns", amount: "4" },
      { item: "Lettuce", amount: "handful" }
    ],
    steps: [
      "Bash chicken thin, coat in egg then breadcrumbs",
      "Fry until golden and cooked through",
      "Brush with teriyaki sauce",
      "Serve in buns with lettuce"
    ],
    allergens: ["gluten", "eggs", "soy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/teriyaki-crispy-chicken-sando/original.jpg"
  },
  {
    slug: "pea-and-mint-cannelloni-bake",
    name: "Pea and Mint Cannelloni",
    prep_time: 15,
    cook_time: 30,
    description: "Creamy pea-filled pasta tubes baked with cheese",
    ingredients: [
      { item: "Cannelloni tubes", amount: "12" },
      { item: "Frozen peas", amount: "400g" },
      { item: "Ricotta", amount: "250g" },
      { item: "Fresh mint", amount: "20g" },
      { item: "Passata", amount: "400g" },
      { item: "Mozzarella", amount: "125g" }
    ],
    steps: [
      "Blend peas with ricotta and mint, season well",
      "Pipe filling into cannelloni tubes",
      "Pour passata in dish, arrange tubes, top with mozzarella",
      "Bake at 190°C for 25-30 mins"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/pea-and-mint-cannelloni-bake/original.jpg"
  },
  {
    slug: "choco-peanut-banana-lollies",
    name: "Choco-Peanut Banana Lollies",
    prep_time: 15,
    cook_time: 0,
    description: "Frozen banana lollies dipped in chocolate and peanuts - a healthy treat",
    ingredients: [
      { item: "Bananas", amount: "4" },
      { item: "Dark chocolate", amount: "200g" },
      { item: "Peanuts", amount: "50g, crushed" },
      { item: "Lolly sticks", amount: "4" }
    ],
    steps: [
      "Insert lolly sticks into banana halves",
      "Freeze bananas 30 mins until firm",
      "Melt chocolate, dip bananas",
      "Sprinkle with peanuts, freeze 1 hour"
    ],
    allergens: ["peanuts"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/choco-peanut-banana-lollies/original.jpg"
  },
  {
    slug: "Salted-toffee-apple-pancakes",
    name: "Salted Toffee Apple Pancakes",
    prep_time: 10,
    cook_time: 15,
    description: "Fluffy pancakes topped with caramelized apples and toffee sauce",
    ingredients: [
      { item: "Pancake mix", amount: "1 packet" },
      { item: "Milk", amount: "250ml" },
      { item: "Apples", amount: "2, sliced" },
      { item: "Toffee sauce", amount: "4 tbsp" },
      { item: "Butter", amount: "30g" },
      { item: "Sea salt", amount: "pinch" }
    ],
    steps: [
      "Make pancakes according to pack",
      "Fry apple slices in butter until golden",
      "Stack pancakes, top with apples",
      "Drizzle with toffee sauce and sea salt"
    ],
    allergens: ["gluten", "dairy", "eggs"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/Salted-toffee-apple-pancakes/original.jpg"
  },
  {
    slug: "Peachy-flapjacks",
    name: "Peachy Flapjacks",
    prep_time: 10,
    cook_time: 25,
    description: "Chewy oat flapjacks with juicy peach pieces",
    ingredients: [
      { item: "Oats", amount: "300g" },
      { item: "Butter", amount: "150g" },
      { item: "Golden syrup", amount: "100g" },
      { item: "Brown sugar", amount: "100g" },
      { item: "Tinned peaches", amount: "200g, diced" }
    ],
    steps: [
      "Melt butter, syrup and sugar together",
      "Stir in oats and peaches",
      "Press into lined tin",
      "Bake at 180°C for 20-25 mins",
      "Cool and slice into bars"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/Peachy-flapjacks/original.jpg"
  },
  {
    slug: "honey-and-banana-french-toast",
    name: "Honey Banana French Toast",
    prep_time: 5,
    cook_time: 10,
    description: "Classic French toast topped with banana and honey",
    ingredients: [
      { item: "Thick bread", amount: "4 slices" },
      { item: "Eggs", amount: "2" },
      { item: "Milk", amount: "50ml" },
      { item: "Bananas", amount: "2, sliced" },
      { item: "Honey", amount: "4 tbsp" },
      { item: "Butter", amount: "20g" }
    ],
    steps: [
      "Whisk eggs with milk",
      "Dip bread slices in egg mixture",
      "Fry in butter until golden both sides",
      "Top with banana slices and drizzle with honey"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/honey-and-banana-french-toast/original.jpg"
  },
  {
    slug: "ricotta-lemon-and-crispy-kale-pasta",
    name: "Ricotta Lemon Pasta with Crispy Kale",
    prep_time: 5,
    cook_time: 12,
    description: "Quick creamy pasta with lemon and crispy kale topping",
    ingredients: [
      { item: "Pasta", amount: "350g" },
      { item: "Ricotta", amount: "250g" },
      { item: "Lemon", amount: "1 (zest and juice)" },
      { item: "Kale", amount: "100g" },
      { item: "Olive oil", amount: "2 tbsp" },
      { item: "Parmesan", amount: "30g" }
    ],
    steps: [
      "Cook pasta, reserve some water",
      "Crisp kale in oil until edges are brown",
      "Mix ricotta with lemon zest and juice",
      "Toss pasta with ricotta mixture and pasta water",
      "Top with crispy kale and parmesan"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/ricotta-lemon-and-crispy-kale-pasta/original.jpg"
  },
  {
    slug: "cauliflower-cheese-soup",
    name: "Cauliflower Cheese Soup",
    prep_time: 10,
    cook_time: 25,
    description: "Creamy soup with all the flavours of cauliflower cheese",
    ingredients: [
      { item: "Cauliflower", amount: "1 large head" },
      { item: "Onion", amount: "1" },
      { item: "Vegetable stock", amount: "750ml" },
      { item: "Cheddar cheese", amount: "150g" },
      { item: "Milk", amount: "200ml" },
      { item: "Butter", amount: "30g" }
    ],
    steps: [
      "Sweat onion in butter, add cauliflower florets",
      "Add stock, simmer 20 mins until tender",
      "Blend until smooth",
      "Stir in cheese and milk, heat through",
      "Serve with crusty bread"
    ],
    allergens: ["dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/cauliflower-cheese-soup/original.jpg"
  },
  {
    slug: "slow-cooker-vegetable-curry",
    name: "Slow Cooker Vegetable Curry",
    prep_time: 15,
    cook_time: 240,
    description: "Easy dump-and-go vegetable curry - just set and forget",
    ingredients: [
      { item: "Mixed vegetables", amount: "800g" },
      { item: "Curry paste", amount: "3 tbsp" },
      { item: "Coconut milk", amount: "400ml" },
      { item: "Chickpeas", amount: "400g tin" },
      { item: "Rice", amount: "300g" },
      { item: "Naan bread", amount: "4" }
    ],
    steps: [
      "Add vegetables, curry paste, coconut milk and chickpeas to slow cooker",
      "Cook on low 4-6 hours or high 2-3 hours",
      "Cook rice and warm naan",
      "Serve curry with rice and naan"
    ],
    allergens: [],
    image: "https://assets.sainsburys-groceries.co.uk/gol/slow-cooker-vegetable-curry/original.jpg"
  },
  {
    slug: "microwave-porridge-with-apple-nuts-and-raisins",
    name: "Microwave Porridge with Apple",
    prep_time: 2,
    cook_time: 3,
    description: "Quick microwave porridge topped with apple, nuts and raisins",
    ingredients: [
      { item: "Porridge oats", amount: "80g" },
      { item: "Milk", amount: "300ml" },
      { item: "Apple", amount: "1, grated" },
      { item: "Mixed nuts", amount: "30g" },
      { item: "Raisins", amount: "30g" },
      { item: "Honey", amount: "2 tbsp" }
    ],
    steps: [
      "Mix oats and milk in microwave bowl",
      "Microwave 2-3 mins, stirring halfway",
      "Top with grated apple, nuts and raisins",
      "Drizzle with honey"
    ],
    allergens: ["dairy", "nuts"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/microwave-porridge-with-apple-nuts-and-raisins/original.jpg"
  },
  {
    slug: "vegan-shepherds-pie",
    name: "Vegan Shepherd's Pie",
    prep_time: 15,
    cook_time: 40,
    description: "Hearty plant-based shepherd's pie with lentils",
    ingredients: [
      { item: "Lentils", amount: "400g tin" },
      { item: "Mixed vegetables", amount: "300g" },
      { item: "Vegetable stock", amount: "200ml" },
      { item: "Tomato puree", amount: "2 tbsp" },
      { item: "Potatoes", amount: "800g" },
      { item: "Plant butter", amount: "30g" }
    ],
    steps: [
      "Boil potatoes and mash with plant butter",
      "Fry vegetables, add lentils, stock and tomato puree, simmer 15 mins",
      "Pour filling into dish, top with mash",
      "Bake at 200°C for 25 mins until golden"
    ],
    allergens: [],
    image: "https://assets.sainsburys-groceries.co.uk/gol/vegan-shepherds-pie/original.jpg"
  },
  {
    slug: "caprese-style-pancakes",
    name: "Caprese Savoury Pancakes",
    prep_time: 10,
    cook_time: 15,
    description: "Savoury pancakes with tomato, mozzarella and basil",
    ingredients: [
      { item: "Pancake batter", amount: "from 150g flour, 1 egg, 300ml milk" },
      { item: "Cherry tomatoes", amount: "200g, halved" },
      { item: "Mozzarella", amount: "125g, torn" },
      { item: "Fresh basil", amount: "handful" },
      { item: "Olive oil", amount: "2 tbsp" }
    ],
    steps: [
      "Make pancake batter, cook thin pancakes",
      "Top with tomatoes, mozzarella and basil",
      "Drizzle with olive oil",
      "Fold and serve warm"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/caprese-style-pancakes/original.jpg"
  },
  {
    slug: "halloumi-and-chilli-honey-toastie",
    name: "Halloumi Chilli Honey Toastie",
    prep_time: 5,
    cook_time: 8,
    description: "Golden halloumi with sweet chilli honey in a crispy toastie",
    ingredients: [
      { item: "Sourdough bread", amount: "4 slices" },
      { item: "Halloumi", amount: "200g, sliced" },
      { item: "Honey", amount: "2 tbsp" },
      { item: "Chilli flakes", amount: "1 tsp" },
      { item: "Butter", amount: "20g" }
    ],
    steps: [
      "Fry halloumi until golden each side",
      "Mix honey with chilli flakes",
      "Layer halloumi in buttered bread",
      "Toast in pan until golden, drizzle with chilli honey"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/halloumi-and-chilli-honey-toastie/original.jpg"
  },
  {
    slug: "spring-onion-pancakes-with-dipping-sauce",
    name: "Spring Onion Pancakes",
    prep_time: 15,
    cook_time: 15,
    description: "Crispy Chinese-style pancakes with soy dipping sauce",
    ingredients: [
      { item: "Plain flour", amount: "250g" },
      { item: "Hot water", amount: "150ml" },
      { item: "Spring onions", amount: "6, sliced" },
      { item: "Sesame oil", amount: "2 tbsp" },
      { item: "Soy sauce", amount: "4 tbsp" },
      { item: "Rice vinegar", amount: "2 tbsp" }
    ],
    steps: [
      "Mix flour with hot water to form dough, rest 15 mins",
      "Roll thin, brush with sesame oil, scatter spring onions",
      "Roll up, coil, flatten and fry until crispy",
      "Serve with soy and vinegar dipping sauce"
    ],
    allergens: ["gluten", "sesame", "soy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/spring-onion-pancakes-with-dipping-sauce/original.jpg"
  }
];

async function addRecipes() {
  console.log("🍽️ Adding more Sainsbury's recipes to MealSpin...\n");
  
  let added = 0;
  
  for (const r of newRecipes) {
    try {
      const existing = await sql`SELECT id FROM meals WHERE name = ${r.name}`;
      if (existing.length > 0) {
        console.log(`⏭️  Skipped (exists): ${r.name}`);
        continue;
      }
      
      await sql`
        INSERT INTO meals (name, description, prep_time, cook_time, servings, image_url, is_picky_eater_friendly, allergens, ingredients, steps, nutrition)
        VALUES (${r.name}, ${r.description}, ${r.prep_time}, ${r.cook_time}, ${4}, ${r.image}, ${true}, ${r.allergens}, ${JSON.stringify(r.ingredients)}, ${JSON.stringify(r.steps)}, ${JSON.stringify({})})
      `;
      
      console.log(`✅ Added: ${r.name} (${r.prep_time + r.cook_time}min)`);
      added++;
    } catch (e) {
      console.log(`❌ Error adding ${r.name}: ${e.message}`);
    }
  }
  
  console.log(`\n✨ Added ${added} new recipes`);
  
  const result = await sql`SELECT COUNT(*) as count FROM meals`;
  console.log(`📊 Total recipes in MealSpin: ${result[0].count}`);
}

addRecipes().catch(console.error);
