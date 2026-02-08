const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Jamie Oliver kids recipes - curated selection
const recipes = [
  {
    name: "Buddy's Easy Meatballs",
    description: "Simple meatballs in tomato sauce - kids can help roll them!",
    prep_time: 15,
    cook_time: 25,
    category: "main",
    ingredients: [
      { item: "Beef mince", amount: "500g" },
      { item: "Breadcrumbs", amount: "50g" },
      { item: "Parmesan", amount: "30g, grated" },
      { item: "Egg", amount: "1" },
      { item: "Passata", amount: "400g" },
      { item: "Spaghetti", amount: "300g" }
    ],
    steps: [
      "Mix mince, breadcrumbs, parmesan and egg. Roll into walnut-sized balls",
      "Fry meatballs until browned all over",
      "Add passata and simmer 15 mins",
      "Cook spaghetti and serve with meatballs"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/buddys-easy-meatballs.jpg"
  },
  {
    name: "Buddy's Quick Pizzettas",
    description: "Mini pizzas on flatbreads - ready in 15 minutes",
    prep_time: 5,
    cook_time: 10,
    category: "main",
    ingredients: [
      { item: "Flatbreads or pitta", amount: "4" },
      { item: "Passata", amount: "100g" },
      { item: "Mozzarella", amount: "125g, torn" },
      { item: "Pepperoni or ham", amount: "50g" },
      { item: "Fresh basil", amount: "handful" }
    ],
    steps: [
      "Preheat oven to 220°C",
      "Spread passata on flatbreads",
      "Top with mozzarella and pepperoni",
      "Bake 8-10 mins until cheese bubbles",
      "Top with fresh basil"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/buddys-quick-pizzettas.jpg"
  },
  {
    name: "Buddy's Crispy Chicken",
    description: "Crunchy coated chicken strips - better than takeaway",
    prep_time: 15,
    cook_time: 20,
    category: "main",
    ingredients: [
      { item: "Chicken breast", amount: "4" },
      { item: "Cornflakes", amount: "100g, crushed" },
      { item: "Flour", amount: "50g" },
      { item: "Eggs", amount: "2, beaten" },
      { item: "Paprika", amount: "1 tsp" }
    ],
    steps: [
      "Slice chicken into strips",
      "Mix crushed cornflakes with paprika",
      "Coat chicken in flour, then egg, then cornflakes",
      "Bake at 200°C for 18-20 mins until golden",
      "Serve with sweet chilli dip"
    ],
    allergens: ["gluten", "eggs"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/buddy-s-crispy-chicken.jpg"
  },
  {
    name: "Fish Finger Sarnies",
    description: "Jamie's ultimate fish finger sandwich with tartare sauce",
    prep_time: 5,
    cook_time: 15,
    category: "snack",
    ingredients: [
      { item: "Fish fingers", amount: "8" },
      { item: "Soft white rolls", amount: "4" },
      { item: "Mayonnaise", amount: "4 tbsp" },
      { item: "Capers", amount: "1 tbsp, chopped" },
      { item: "Gherkins", amount: "2, diced" },
      { item: "Lettuce", amount: "handful" }
    ],
    steps: [
      "Cook fish fingers according to pack",
      "Mix mayo with capers and gherkins for tartare sauce",
      "Split rolls, add lettuce",
      "Add fish fingers and drizzle with sauce"
    ],
    allergens: ["fish", "gluten", "eggs"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/fish-finger-sarnies.jpg"
  },
  {
    name: "Blueberry Muffins",
    description: "Fluffy American-style muffins bursting with berries",
    prep_time: 10,
    cook_time: 25,
    category: "dessert",
    ingredients: [
      { item: "Self-raising flour", amount: "300g" },
      { item: "Caster sugar", amount: "150g" },
      { item: "Eggs", amount: "2" },
      { item: "Milk", amount: "250ml" },
      { item: "Butter", amount: "100g, melted" },
      { item: "Blueberries", amount: "200g" }
    ],
    steps: [
      "Mix flour and sugar. Make a well",
      "Whisk eggs, milk and butter. Pour into well",
      "Fold gently, don't overmix. Fold in blueberries",
      "Divide between 12 muffin cases",
      "Bake at 180°C for 20-25 mins"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/blueberry-muffins.jpg"
  },
  {
    name: "Choccy Microwave Mug Cake",
    description: "Gooey chocolate cake in a mug - ready in 5 minutes!",
    prep_time: 3,
    cook_time: 2,
    category: "dessert",
    ingredients: [
      { item: "Self-raising flour", amount: "4 tbsp" },
      { item: "Cocoa powder", amount: "2 tbsp" },
      { item: "Caster sugar", amount: "3 tbsp" },
      { item: "Milk", amount: "3 tbsp" },
      { item: "Vegetable oil", amount: "2 tbsp" },
      { item: "Chocolate chips", amount: "1 tbsp" }
    ],
    steps: [
      "Mix flour, cocoa and sugar in a large mug",
      "Add milk and oil, stir until smooth",
      "Drop in chocolate chips",
      "Microwave 1 min 30 secs on high",
      "Let stand 1 min before eating (it's hot!)"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/choccy-microwave-mug-cake.jpg"
  },
  {
    name: "Mini Apple Pancakes",
    description: "Fluffy pancakes with grated apple - perfect for breakfast",
    prep_time: 10,
    cook_time: 15,
    category: "breakfast",
    ingredients: [
      { item: "Self-raising flour", amount: "150g" },
      { item: "Egg", amount: "1" },
      { item: "Milk", amount: "150ml" },
      { item: "Apple", amount: "1, grated" },
      { item: "Cinnamon", amount: "1 tsp" },
      { item: "Maple syrup", amount: "to serve" }
    ],
    steps: [
      "Mix flour and cinnamon",
      "Whisk in egg and milk until smooth",
      "Fold in grated apple",
      "Drop spoonfuls into hot pan, cook 2 mins each side",
      "Serve stacked with maple syrup"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/mini-apple-pancakes.jpg"
  },
  {
    name: "Buddy's Veggie Nachos",
    description: "Loaded nachos with beans, cheese and all the toppings",
    prep_time: 10,
    cook_time: 10,
    category: "snack",
    ingredients: [
      { item: "Tortilla chips", amount: "200g" },
      { item: "Black beans", amount: "400g tin, drained" },
      { item: "Cheddar cheese", amount: "150g, grated" },
      { item: "Soured cream", amount: "100g" },
      { item: "Salsa", amount: "100g" },
      { item: "Guacamole", amount: "100g" }
    ],
    steps: [
      "Spread chips on baking tray",
      "Scatter beans and cheese over chips",
      "Grill 5 mins until cheese melts",
      "Dollop soured cream, salsa and guac on top",
      "Serve immediately while hot"
    ],
    allergens: ["dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/buddy-s-veggie-nachos.jpg"
  },
  {
    name: "Buddy's Tuna Pasta",
    description: "Store cupboard pasta that's ready in 15 minutes",
    prep_time: 5,
    cook_time: 12,
    category: "main",
    ingredients: [
      { item: "Pasta", amount: "300g" },
      { item: "Tinned tuna", amount: "2 tins, drained" },
      { item: "Sweetcorn", amount: "200g tin" },
      { item: "Mayonnaise", amount: "3 tbsp" },
      { item: "Lemon juice", amount: "1 tbsp" },
      { item: "Chives", amount: "handful, snipped" }
    ],
    steps: [
      "Cook pasta according to pack",
      "Drain, return to pan",
      "Flake in tuna, add sweetcorn",
      "Stir through mayo and lemon juice",
      "Top with chives and serve"
    ],
    allergens: ["fish", "gluten", "eggs"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/buddy-s-tuna-pasta.jpg"
  },
  {
    name: "Peanut Butter Banana Yoghurt Bark",
    description: "Frozen yoghurt snack with peanut butter swirl",
    prep_time: 10,
    cook_time: 0,
    category: "snack",
    ingredients: [
      { item: "Greek yoghurt", amount: "500g" },
      { item: "Honey", amount: "2 tbsp" },
      { item: "Peanut butter", amount: "3 tbsp" },
      { item: "Banana", amount: "1, sliced" },
      { item: "Chocolate chips", amount: "30g" }
    ],
    steps: [
      "Mix yoghurt with honey, spread on lined tray",
      "Drizzle peanut butter and swirl with knife",
      "Top with banana slices and chocolate chips",
      "Freeze 4 hours until solid",
      "Break into shards to serve"
    ],
    allergens: ["dairy", "peanuts"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/peanut-butter-banana-yoghurt-bark.jpg"
  },
  {
    name: "Mini Veg Tortillas",
    description: "Little veggie-packed omelettes baked in tortillas",
    prep_time: 10,
    cook_time: 20,
    category: "main",
    ingredients: [
      { item: "Small tortillas", amount: "6" },
      { item: "Eggs", amount: "6" },
      { item: "Milk", amount: "100ml" },
      { item: "Frozen peas", amount: "100g" },
      { item: "Sweetcorn", amount: "100g" },
      { item: "Cheddar", amount: "75g, grated" }
    ],
    steps: [
      "Press tortillas into greased muffin tin cups",
      "Whisk eggs with milk, season",
      "Divide peas and corn between cups",
      "Pour in egg mixture, top with cheese",
      "Bake at 180°C for 18-20 mins"
    ],
    allergens: ["gluten", "eggs", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/mini-veg-tortillas.jpg"
  },
  {
    name: "Ginger Nut Biscuits",
    description: "Buddy's crunchy ginger biscuits - perfect for dunking",
    prep_time: 15,
    cook_time: 12,
    category: "dessert",
    ingredients: [
      { item: "Self-raising flour", amount: "225g" },
      { item: "Ground ginger", amount: "2 tsp" },
      { item: "Butter", amount: "100g" },
      { item: "Brown sugar", amount: "100g" },
      { item: "Golden syrup", amount: "4 tbsp" }
    ],
    steps: [
      "Mix flour and ginger",
      "Rub in butter until breadcrumby",
      "Stir in sugar and syrup to make dough",
      "Roll into balls, flatten on trays",
      "Bake at 180°C for 10-12 mins until golden"
    ],
    allergens: ["gluten", "dairy"],
    image: "https://img.jamieoliver.com/jamieoliver/recipe-database/oldImages/large/ginger-nut-biscuits.jpg"
  }
];

async function addRecipes() {
  console.log("🍳 Adding Jamie Oliver kids recipes...\n");
  
  let added = 0;
  
  for (const r of recipes) {
    try {
      const existing = await sql`SELECT id FROM meals WHERE name = ${r.name}`;
      if (existing.length > 0) {
        console.log(`⏭️  Skipped (exists): ${r.name}`);
        continue;
      }
      
      await sql`
        INSERT INTO meals (name, description, prep_time, cook_time, servings, image_url, is_picky_eater_friendly, allergens, ingredients, steps, nutrition, category)
        VALUES (${r.name}, ${r.description}, ${r.prep_time}, ${r.cook_time}, ${4}, ${r.image}, ${true}, ${r.allergens}, ${JSON.stringify(r.ingredients)}, ${JSON.stringify(r.steps)}, ${JSON.stringify({})}, ${r.category})
      `;
      
      console.log(`✅ Added: ${r.name} (${r.prep_time + r.cook_time}min) [${r.category}]`);
      added++;
    } catch (e) {
      console.log(`❌ Error: ${r.name}: ${e.message}`);
    }
  }
  
  console.log(`\n✨ Added ${added} Jamie Oliver recipes`);
  
  const summary = await sql`SELECT category, COUNT(*) as count FROM meals GROUP BY category ORDER BY category`;
  console.log('\n📊 Category totals:');
  summary.forEach(s => console.log(`  ${s.category}: ${s.count}`));
}

addRecipes().catch(console.error);
