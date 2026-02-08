const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Scraped recipes from Sainsbury's "Feed your family for a fiver" collection
const recipes = [
  {
    slug: "chicken-parm-toasties",
    name: "Chicken Parm Toasties",
    prep_time: 5,
    cook_time: 10,
    description: "Classic combo with chicken, pasta sauce and mozzarella in a toastie",
    ingredients: [
      { item: "Chicken goujons", amount: "pack" },
      { item: "Mozzarella balls", amount: "2, torn" },
      { item: "White bread", amount: "8 slices" },
      { item: "Fresh basil", amount: "30g" },
      { item: "Pasta sauce", amount: "8 tbsp" },
      { item: "Olive oil", amount: "4 tbsp" }
    ],
    steps: [
      "Spread 1 tbsp pasta sauce on bread, add 2-3 goujons, more sauce, torn mozzarella and basil",
      "Top with second slice of bread",
      "Heat 1 tbsp oil in pan and toast 2 mins each side until cheese melts",
      "Repeat with remaining sandwiches"
    ],
    allergens: ["dairy", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/chicken-parm-toasties/original.jpg"
  },
  {
    slug: "Cacio-e-Pepe-mac-and-cheese",
    name: "Cacio e Pepe Mac and Cheese",
    prep_time: 5,
    cook_time: 25,
    description: "All the cheesy flavour from a cacio e pepe but in mac and cheese form",
    ingredients: [
      { item: "Macaroni", amount: "200g" },
      { item: "Cheddar cheese sauce mix", amount: "80g" },
      { item: "Semi-skimmed milk", amount: "400ml" },
      { item: "Parmesan", amount: "60g, grated" },
      { item: "Black pepper", amount: "1 tsp" },
      { item: "Wholemeal bread", amount: "2 slices" },
      { item: "Fresh thyme", amount: "a few sprigs" }
    ],
    steps: [
      "Cook macaroni 5-10 mins until al dente",
      "Make cheese sauce: whisk sauce mix with milk, bring to boil, simmer 2 mins",
      "Drain pasta, mix with sauce and 2/3 parmesan. Season with salt and pepper",
      "Tip into oven dish and preheat oven to 190°C",
      "Blend bread to crumbs, mix with thyme and olive oil. Top pasta and bake 10-15 mins until golden"
    ],
    allergens: ["dairy", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/Cacio-e-Pepe-mac-and-cheese/original.jpg"
  },
  {
    slug: "tuna-spaghetti",
    name: "Tuna Spaghetti",
    prep_time: 5,
    cook_time: 10,
    description: "Great store cupboard recipe - tuna and capers provide the flavour",
    ingredients: [
      { item: "Spaghetti", amount: "360g" },
      { item: "Capers", amount: "2 heaped tbsp" },
      { item: "Garlic cloves", amount: "3, crushed" },
      { item: "Tinned tuna in water", amount: "160g" },
      { item: "Lemon", amount: "1 (zest and juice)" },
      { item: "Flat leaf parsley", amount: "30g" }
    ],
    steps: [
      "Cook spaghetti 8-10 mins",
      "Heat oil, add tuna, garlic and capers. Break tuna down and fry until aromatic",
      "Add lemon juice and zest",
      "Add pasta with some pasta water, season, add parsley and toss"
    ],
    allergens: ["gluten", "fish"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/tuna-spaghetti/original.jpg"
  },
  {
    slug: "veggie-spaghetti-bolognese",
    name: "Veggie Spaghetti Bolognese",
    prep_time: 5,
    cook_time: 20,
    description: "Family favourite spag bol using plant-based mince",
    ingredients: [
      { item: "Spaghetti", amount: "360g" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Onion", amount: "1, diced" },
      { item: "Bolognese recipe mix", amount: "44g" },
      { item: "Plant-based mince", amount: "350g" },
      { item: "Tomato puree", amount: "2 tbsp" },
      { item: "Chopped tomatoes", amount: "400g tin" }
    ],
    steps: [
      "Cook spaghetti according to pack",
      "Sweat onion in oil until soft, add mince and cook",
      "Add recipe mix and tomato puree, then chopped tomatoes plus tin of water",
      "Simmer until thickened",
      "Serve pasta with bolognese and fresh basil"
    ],
    allergens: ["gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/veggie-spaghetti-bolognese/original.jpg"
  },
  {
    slug: "hawaiian-pizza",
    name: "Hawaiian Pizza",
    prep_time: 90,
    cook_time: 30,
    description: "Classic Hawaiian with ham, pineapple and gooey cheese - family favourite for pizza night",
    ingredients: [
      { item: "Pizza base mix", amount: "500g" },
      { item: "Pineapple slices", amount: "225g" },
      { item: "Cooked ham slices", amount: "120g" },
      { item: "Mozzarella", amount: "125g" },
      { item: "Passata", amount: "6 tbsp" },
      { item: "Olive oil", amount: "3 tbsp" }
    ],
    steps: [
      "Mix pizza dough with 340ml water, knead 10 mins. Prove 1.5 hours",
      "Divide into two, stretch to 12-inch circles",
      "Heat oil in frying pan, add base, spread passata, top with ham, cheese and pineapple",
      "Cook 4-5 mins until base crispy, finish under grill until cheese melts"
    ],
    allergens: ["dairy", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/hawaiian-pizza/original.jpg"
  },
  {
    slug: "french-toast-crumpets",
    name: "French Toast Crumpets",
    prep_time: 5,
    cook_time: 15,
    description: "Golden crumpets topped with bananas, honey and chocolate - perfect for breakfast",
    ingredients: [
      { item: "Crumpets", amount: "6" },
      { item: "Eggs", amount: "3" },
      { item: "Milk", amount: "100ml" },
      { item: "Bananas", amount: "2, sliced" },
      { item: "Honey", amount: "3 tbsp" },
      { item: "Milk chocolate", amount: "100g" },
      { item: "Vegetable oil", amount: "1 tbsp" }
    ],
    steps: [
      "Caramelize banana slices in pan, drizzle with 1 tbsp honey",
      "Whisk eggs and milk. Dip crumpets, fry in oil until golden each side",
      "Melt chocolate in microwave (20 sec bursts)",
      "Top crumpets with banana, remaining honey and chocolate drizzle"
    ],
    allergens: ["dairy", "eggs", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/french-toast-crumpets/original.jpg"
  },
  {
    slug: "frying-pan-sausage-tortillas",
    name: "Frying Pan Sausage Tortillas",
    prep_time: 10,
    cook_time: 20,
    description: "A zesty twist on a sausage sandwich - kids love these",
    ingredients: [
      { item: "Wholemeal tortilla wraps", amount: "4" },
      { item: "Pork sausages", amount: "8" },
      { item: "Red onion", amount: "1, sliced" },
      { item: "Lime", amount: "1, juiced" },
      { item: "Cherry tomatoes", amount: "150g" },
      { item: "Natural yogurt", amount: "200g" },
      { item: "Vegetable oil", amount: "2 tbsp" }
    ],
    steps: [
      "Make salsa: quarter tomatoes, mix with onion and half lime juice",
      "Mix yogurt with remaining lime juice",
      "Remove sausage meat from casings, spread onto tortillas",
      "Fry tortilla sausage-side down 2-4 mins, flip 30 secs",
      "Serve with salsa and lime yogurt"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/frying-pan-sausage-tortillas/original.jpg"
  },
  {
    slug: "broccoli-cheese-baked-potatoes",
    name: "Broccoli Cheese Jacket Potatoes",
    prep_time: 10,
    cook_time: 60,
    description: "Filling jacket potatoes with luxurious broccoli cheese sauce",
    ingredients: [
      { item: "Baking potatoes", amount: "4" },
      { item: "Broccoli", amount: "1 head" },
      { item: "Onion", amount: "1, sliced" },
      { item: "Cheese sauce sachet", amount: "40g" },
      { item: "Milk", amount: "300ml" },
      { item: "Grated cheese", amount: "4 tbsp" },
      { item: "Olive oil", amount: "1.5 tbsp" }
    ],
    steps: [
      "Bake potatoes at 190°C for 50-55 mins",
      "Roast broccoli florets 10 mins until charred",
      "Sweat onion, add garlic. Make cheese sauce with milk",
      "Score potatoes, fill with broccoli, cheese sauce and grated cheese",
      "Bake 5 mins until bubbly"
    ],
    allergens: ["dairy", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/broccoli-cheese-baked-potatoes/original.jpg"
  },
  {
    slug: "Air-fryer-fish-finger-sarnie",
    name: "Air Fryer Fish Finger Sarnie",
    prep_time: 5,
    cook_time: 15,
    description: "British classic fish finger sandwich - cheap, cheerful and quick",
    ingredients: [
      { item: "Breaded cod fish fingers", amount: "10" },
      { item: "Salad cream", amount: "80g" },
      { item: "Dill", amount: "10g, chopped" },
      { item: "Gherkins", amount: "6, diced" },
      { item: "Cucumber", amount: "1 small" },
      { item: "White rolls", amount: "4" }
    ],
    steps: [
      "Air fry fish fingers at 200°C for 10-15 mins until golden and crispy",
      "Mix salad cream with dill, gherkins and pepper",
      "Peel cucumber into ribbons",
      "Layer 2-3 fish fingers in rolls with sauce and cucumber"
    ],
    allergens: ["fish", "gluten", "eggs"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/Air-fryer-fish-finger-sarnie/original.jpg"
  },
  {
    slug: "chocolate-banana-and-peanut-mini-calzones",
    name: "Chocolate Banana Peanut Calzones",
    prep_time: 25,
    cook_time: 10,
    description: "Sweet twist on calzone - a fun dessert little hands can help make",
    ingredients: [
      { item: "Pizza base mix", amount: "145g" },
      { item: "Roasted peanuts", amount: "50g" },
      { item: "Bananas", amount: "3" },
      { item: "Chocolate spread", amount: "3 tbsp" },
      { item: "Chocolate crispies", amount: "15g" }
    ],
    steps: [
      "Make pizza dough, knead 5 mins, rest 15 mins",
      "Divide into 8 pieces, roll into circles",
      "Add 1 tsp chocolate spread and 3 banana slices to each. Fold and crimp edges",
      "Air fry at 200°C for 5 mins",
      "Top with melted chocolate, crushed peanuts and crispies"
    ],
    allergens: ["gluten", "peanuts"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/chocolate-banana-and-peanut-mini-calzones/original.jpg"
  },
  {
    slug: "lemon-salmon-spaghetti",
    name: "Lemon Salmon Spaghetti",
    prep_time: 5,
    cook_time: 12,
    description: "Quick and zesty pasta dish for a midweek dinner",
    ingredients: [
      { item: "Tinned pink salmon", amount: "1 tin" },
      { item: "Spaghetti", amount: "300g" },
      { item: "Soft cheese", amount: "200g" },
      { item: "Lemon", amount: "1 (zest)" },
      { item: "Parsley", amount: "30g, chopped" }
    ],
    steps: [
      "Cook spaghetti, reserve 100ml pasta water",
      "Drain and flake salmon",
      "Return pasta to pan with water, stir through soft cheese, salmon, lemon zest and parsley",
      "Heat through and serve with lemon wedge"
    ],
    allergens: ["fish", "gluten", "dairy"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/lemon-salmon-spaghetti/original.jpg"
  },
  {
    slug: "Air-fryer-salmon-fish-cakes",
    name: "Air Fryer Salmon Fish Cakes",
    prep_time: 35,
    cook_time: 20,
    description: "Great store cupboard fishcakes using tinned salmon",
    ingredients: [
      { item: "Tinned pink salmon", amount: "1 tin" },
      { item: "Spring onions", amount: "3, sliced" },
      { item: "Mashed potato", amount: "400g" },
      { item: "Lemon", amount: "1 (zest)" },
      { item: "Peas", amount: "340g" },
      { item: "Olive oil", amount: "1 tbsp" }
    ],
    steps: [
      "Drain and flake salmon into bowl. Add spring onions, mash, lemon zest and pepper",
      "Form 12 fishcakes, chill 30 mins",
      "Air fry at 200°C for 15 mins, turning halfway",
      "Cook peas and serve with fishcakes and lemon wedge"
    ],
    allergens: ["fish"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/Air-fryer-salmon-fish-cakes/original.jpg"
  },
  {
    slug: "mini-dutch-pancakes-with-berry-marbled-yoghurt-and-chocolate",
    name: "Mini Dutch Pancakes with Berry Yogurt",
    prep_time: 10,
    cook_time: 20,
    description: "Fun and tasty breakfast - mini pancakes with berry marbled yogurt and chocolate",
    ingredients: [
      { item: "Pancake mix", amount: "1 packet" },
      { item: "Water", amount: "100ml" },
      { item: "Berry mix", amount: "400g" },
      { item: "Natural yogurt", amount: "400g" },
      { item: "Chocolate spread", amount: "4 tbsp" },
      { item: "Vegetable oil", amount: "1 tbsp" }
    ],
    steps: [
      "Mix pancake mix with water and 200g yogurt",
      "Microwave berries 5+2 mins until thickened. Cool and swirl through remaining yogurt",
      "Cook 1 tbsp dollops of batter in oiled pan, flip when golden",
      "Melt chocolate with oil. Serve pancakes with berry yogurt and chocolate drizzle"
    ],
    allergens: ["dairy", "eggs", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/mini-dutch-pancakes-with-berry-marbled-yoghurt-and-chocolate/original.jpg"
  },
  {
    slug: "air-fryer-cinnamon-crumpet-bites",
    name: "Air Fryer Cinnamon Crumpet Bites",
    prep_time: 5,
    cook_time: 7,
    description: "Sweet crispy cinnamon crumpet bites - ready in minutes, loved by all ages",
    ingredients: [
      { item: "Crumpets", amount: "4, sliced into strips" },
      { item: "Vegetable spread", amount: "120g, melted" },
      { item: "Granulated sugar", amount: "60g" },
      { item: "Cinnamon", amount: "1 tsp" },
      { item: "Milk chocolate", amount: "100g" }
    ],
    steps: [
      "Preheat air fryer to 200°C. Mix sugar and cinnamon",
      "Dip crumpet strips in melted spread, shake off excess",
      "Air fry 5 mins until golden and crispy",
      "Melt chocolate (stir every 20 secs). Roll crumpets in cinnamon sugar",
      "Serve with chocolate for dipping"
    ],
    allergens: ["dairy", "gluten"],
    image: "https://assets.sainsburys-groceries.co.uk/gol/air-fryer-cinnamon-crumpet-bites/original.jpg"
  }
];

async function addRecipes() {
  console.log("🍽️ Adding Sainsbury's family recipes to MealSpin...\n");
  
  let added = 0;
  
  for (const r of recipes) {
    const sourceUrl = `https://www.sainsburys.co.uk/gol-ui/recipes/${r.slug}`;
    
    try {
      // Check if already exists (by name since no source_url column)
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
