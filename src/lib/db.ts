import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Meal {
  id: number;
  name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_url: string | null;
  is_picky_eater_friendly: boolean;
  allergens: string[];
  ingredients: any;
  steps: any;
  nutrition: any;
  created_at: string;
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      prep_time INTEGER NOT NULL DEFAULT 30,
      cook_time INTEGER NOT NULL DEFAULT 30,
      servings INTEGER NOT NULL DEFAULT 4,
      image_url VARCHAR(500),
      is_picky_eater_friendly BOOLEAN DEFAULT false,
      allergens TEXT[] DEFAULT '{}',
      ingredients JSONB NOT NULL DEFAULT '[]',
      steps JSONB NOT NULL DEFAULT '[]',
      nutrition JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Check if we need to seed
  const count = await sql`SELECT COUNT(*) as count FROM meals`;
  if (parseInt(count[0].count) === 0) {
    await seedMeals();
  }
}

export async function getMeals(filters?: {
  maxPrepTime?: number;
  pickyEaterFriendly?: boolean;
  excludeAllergens?: string[];
}): Promise<Meal[]> {
  // Build conditions based on filters
  // Note: maxPrepTime actually means max TOTAL time (prep + cook)
  const maxTime = filters?.maxPrepTime;
  const pickyOnly = filters?.pickyEaterFriendly;
  const excludeAllergens = filters?.excludeAllergens || [];

  // Use different queries based on filter combinations to work with tagged template
  // Filter on (prep_time + cook_time) for total time
  if (maxTime && pickyOnly && excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE (prep_time + cook_time) <= ${maxTime} AND is_picky_eater_friendly = true AND NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else if (maxTime && pickyOnly) {
    return sql`SELECT * FROM meals WHERE (prep_time + cook_time) <= ${maxTime} AND is_picky_eater_friendly = true ORDER BY RANDOM()` as unknown as Meal[];
  } else if (maxTime && excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE (prep_time + cook_time) <= ${maxTime} AND NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else if (pickyOnly && excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE is_picky_eater_friendly = true AND NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else if (maxTime) {
    return sql`SELECT * FROM meals WHERE (prep_time + cook_time) <= ${maxTime} ORDER BY RANDOM()` as unknown as Meal[];
  } else if (pickyOnly) {
    return sql`SELECT * FROM meals WHERE is_picky_eater_friendly = true ORDER BY RANDOM()` as unknown as Meal[];
  } else if (excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else {
    return sql`SELECT * FROM meals ORDER BY RANDOM()` as unknown as Meal[];
  }
}

export async function getMealById(id: number): Promise<Meal | null> {
  const result = await sql`SELECT * FROM meals WHERE id = ${id}`;
  return result.length > 0 ? (result[0] as Meal) : null;
}

export async function getRandomMeal(filters?: {
  maxPrepTime?: number;
  pickyEaterFriendly?: boolean;
  excludeAllergens?: string[];
}): Promise<Meal | null> {
  const meals = await getMeals(filters);
  return meals.length > 0 ? meals[0] : null;
}

async function seedMeals() {
  const meals = [
    {
      name: "Mac and Cheese",
      description: "Creamy, cheesy pasta that kids absolutely love",
      prep_time: 10,
      cook_time: 20,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy", "gluten"],
      ingredients: [
        { item: "Macaroni pasta", amount: "300g" },
        { item: "Butter", amount: "30g" },
        { item: "Plain flour", amount: "30g" },
        { item: "Whole milk", amount: "350ml" },
        { item: "Mature cheddar", amount: "200g, grated" },
        { item: "Salt", amount: "to taste" }
      ],
      steps: [
        "Cook pasta according to packet directions",
        "Melt butter in saucepan, add flour",
        "Gradually whisk in milk",
        "Add cheese and stir until melted",
        "Combine with cooked pasta",
        "Season with salt to taste"
      ],
      nutrition: { calories: 380, protein: 16, carbs: 42, fat: 16 }
    },
    {
      name: "Chicken Nuggets",
      description: "Homemade crispy chicken bites",
      prep_time: 15,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "eggs"],
      ingredients: [
        { item: "Chicken breast", amount: "450g, cut into pieces" },
        { item: "Plain flour", amount: "100g" },
        { item: "Eggs", amount: "2, beaten" },
        { item: "Breadcrumbs", amount: "150g" },
        { item: "Salt", amount: "1 tsp" },
        { item: "Paprika", amount: "1 tsp" }
      ],
      steps: [
        "Cut chicken into nugget-sized pieces",
        "Set up breading station: flour, eggs, breadcrumbs with seasonings",
        "Dredge chicken in flour, then egg, then breadcrumbs",
        "Bake at 200°C (gas mark 6) for 12-15 mins",
        "Serve with favourite dipping sauce"
      ],
      nutrition: { calories: 320, protein: 28, carbs: 18, fat: 14 }
    },
    {
      name: "Spag Bol",
      description: "Classic spaghetti bolognese the kids will love",
      prep_time: 15,
      cook_time: 25,
      servings: 6,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten"],
      ingredients: [
        { item: "Beef mince", amount: "500g" },
        { item: "Onion", amount: "1, diced" },
        { item: "Garlic", amount: "2 cloves" },
        { item: "Passata", amount: "500g" },
        { item: "Spaghetti", amount: "400g" },
        { item: "Parmesan", amount: "50g, grated" }
      ],
      steps: [
        "Fry onion and garlic until soft",
        "Add mince and brown thoroughly",
        "Add passata and simmer for 20 mins",
        "Cook spaghetti according to packet",
        "Serve sauce over pasta with cheese"
      ],
      nutrition: { calories: 420, protein: 25, carbs: 52, fat: 12 }
    },
    {
      name: "Cheese Toastie",
      description: "Golden, crispy sandwich with melted cheese",
      prep_time: 5,
      cook_time: 6,
      servings: 1,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy", "gluten"],
      ingredients: [
        { item: "Bread", amount: "2 slices" },
        { item: "Butter", amount: "20g" },
        { item: "Cheddar cheese", amount: "60g, sliced" }
      ],
      steps: [
        "Butter one side of each bread slice",
        "Place cheese between unbuttered sides",
        "Heat pan over medium heat",
        "Cook 2-3 mins per side until golden",
        "Serve hot"
      ],
      nutrition: { calories: 340, protein: 14, carbs: 28, fat: 20 }
    },
    {
      name: "Chicken Quesadillas",
      description: "Crispy tortillas filled with chicken and cheese",
      prep_time: 10,
      cook_time: 8,
      servings: 2,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy", "gluten"],
      ingredients: [
        { item: "Flour tortillas", amount: "4 large" },
        { item: "Cooked chicken", amount: "150g, shredded" },
        { item: "Cheddar cheese", amount: "150g, grated" },
        { item: "Butter", amount: "20g" }
      ],
      steps: [
        "Place chicken and cheese on half of each tortilla",
        "Fold tortillas in half",
        "Heat butter in pan",
        "Cook 2-3 mins per side until crispy",
        "Cut into wedges and serve"
      ],
      nutrition: { calories: 420, protein: 26, carbs: 32, fat: 22 }
    },
    {
      name: "Mini Pizzas",
      description: "Quick muffin pizzas with favourite toppings",
      prep_time: 10,
      cook_time: 8,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy"],
      ingredients: [
        { item: "English muffins", amount: "4, halved" },
        { item: "Passata or pizza sauce", amount: "120ml" },
        { item: "Mozzarella", amount: "150g, grated" },
        { item: "Toppings of choice", amount: "as desired" }
      ],
      steps: [
        "Preheat oven to 220°C (gas mark 7)",
        "Spread sauce on muffin halves",
        "Sprinkle with cheese and add toppings",
        "Bake for 6-8 mins until cheese melts",
        "Cool slightly before serving"
      ],
      nutrition: { calories: 280, protein: 14, carbs: 28, fat: 12 }
    },
    {
      name: "Pancakes",
      description: "Fluffy American-style pancakes",
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy", "eggs"],
      ingredients: [
        { item: "Self-raising flour", amount: "250g" },
        { item: "Caster sugar", amount: "2 tbsp" },
        { item: "Baking powder", amount: "1 tsp" },
        { item: "Whole milk", amount: "300ml" },
        { item: "Eggs", amount: "2" },
        { item: "Butter", amount: "30g, melted" }
      ],
      steps: [
        "Mix dry ingredients in large bowl",
        "Whisk milk, eggs, and melted butter",
        "Combine wet and dry until just mixed",
        "Cook on griddle until bubbles form, flip once",
        "Serve with maple syrup or fruit"
      ],
      nutrition: { calories: 320, protein: 10, carbs: 48, fat: 10 }
    },
    {
      name: "Chicken Goujons",
      description: "Crispy baked chicken strips",
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten"],
      ingredients: [
        { item: "Chicken mini fillets", amount: "600g" },
        { item: "Plain flour", amount: "100g" },
        { item: "Breadcrumbs", amount: "150g" },
        { item: "Parmesan", amount: "50g, grated" },
        { item: "Garlic granules", amount: "1 tsp" }
      ],
      steps: [
        "Preheat oven to 220°C (gas mark 7)",
        "Set up breading station",
        "Coat chicken in flour, then breadcrumbs",
        "Bake on tray for 18-20 mins",
        "Serve with BBQ sauce or ketchup"
      ],
      nutrition: { calories: 290, protein: 32, carbs: 15, fat: 10 }
    },
    {
      name: "Cheese Pizza",
      description: "Classic homemade pizza",
      prep_time: 20,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy"],
      ingredients: [
        { item: "Pizza dough", amount: "500g" },
        { item: "Passata", amount: "150ml" },
        { item: "Mozzarella", amount: "200g, grated" },
        { item: "Olive oil", amount: "2 tbsp" }
      ],
      steps: [
        "Preheat oven to 240°C (gas mark 9)",
        "Roll out dough on floured surface",
        "Transfer to tray, brush with oil",
        "Spread passata and add cheese",
        "Bake 12-15 mins until golden"
      ],
      nutrition: { calories: 420, protein: 18, carbs: 52, fat: 16 }
    },
    {
      name: "Fish Fingers",
      description: "Homemade crispy fish fingers",
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "eggs"],
      ingredients: [
        { item: "Cod or haddock fillets", amount: "450g" },
        { item: "Breadcrumbs", amount: "150g" },
        { item: "Plain flour", amount: "50g" },
        { item: "Egg", amount: "1, beaten" },
        { item: "Salt", amount: "to taste" }
      ],
      steps: [
        "Preheat oven to 200°C (gas mark 6)",
        "Cut fish into finger-sized strips",
        "Coat in flour, egg, then breadcrumbs",
        "Bake on tray for 12-15 mins",
        "Serve with chips and peas"
      ],
      nutrition: { calories: 260, protein: 24, carbs: 18, fat: 8 }
    },
    {
      name: "Beans on Toast",
      description: "British classic - quick and filling",
      prep_time: 2,
      cook_time: 5,
      servings: 2,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten"],
      ingredients: [
        { item: "Baked beans", amount: "400g tin" },
        { item: "Bread", amount: "4 slices" },
        { item: "Butter", amount: "20g" },
        { item: "Cheddar (optional)", amount: "50g, grated" }
      ],
      steps: [
        "Heat beans in saucepan or microwave",
        "Toast the bread",
        "Butter the toast",
        "Pour beans over toast",
        "Top with grated cheese if desired"
      ],
      nutrition: { calories: 320, protein: 14, carbs: 52, fat: 8 }
    },
    {
      name: "Jacket Potato",
      description: "Fluffy baked potato with fillings",
      prep_time: 5,
      cook_time: 60,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy"],
      ingredients: [
        { item: "Baking potatoes", amount: "4 large" },
        { item: "Butter", amount: "40g" },
        { item: "Cheddar cheese", amount: "100g, grated" },
        { item: "Baked beans", amount: "200g" }
      ],
      steps: [
        "Preheat oven to 200°C (gas mark 6)",
        "Prick potatoes with fork",
        "Bake for 1 hour until soft inside",
        "Cut open and add butter",
        "Top with cheese and beans"
      ],
      nutrition: { calories: 380, protein: 12, carbs: 58, fat: 12 }
    },
    {
      name: "Sausage & Mash",
      description: "Classic British comfort food",
      prep_time: 10,
      cook_time: 25,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy", "gluten"],
      ingredients: [
        { item: "Pork sausages", amount: "8" },
        { item: "Potatoes", amount: "800g, peeled" },
        { item: "Butter", amount: "50g" },
        { item: "Milk", amount: "100ml" },
        { item: "Onion gravy", amount: "300ml" }
      ],
      steps: [
        "Cook sausages under grill or in pan for 20 mins",
        "Boil potatoes until tender",
        "Mash with butter and milk",
        "Heat gravy",
        "Serve sausages on mash with gravy"
      ],
      nutrition: { calories: 520, protein: 22, carbs: 48, fat: 28 }
    },
    {
      name: "Toad in the Hole",
      description: "Sausages in Yorkshire pudding batter",
      prep_time: 10,
      cook_time: 35,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy", "eggs"],
      ingredients: [
        { item: "Pork sausages", amount: "8" },
        { item: "Plain flour", amount: "140g" },
        { item: "Eggs", amount: "2" },
        { item: "Whole milk", amount: "200ml" },
        { item: "Vegetable oil", amount: "2 tbsp" }
      ],
      steps: [
        "Preheat oven to 220°C (gas mark 7)",
        "Brown sausages in roasting tin with oil",
        "Whisk flour, eggs and milk into batter",
        "Pour batter around hot sausages",
        "Bake 30-35 mins until risen and golden"
      ],
      nutrition: { calories: 480, protein: 24, carbs: 35, fat: 28 }
    },
    {
      name: "Fish Pie",
      description: "Creamy fish pie with mash topping",
      prep_time: 20,
      cook_time: 30,
      servings: 6,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy", "gluten"],
      ingredients: [
        { item: "Mixed fish (cod, salmon)", amount: "600g" },
        { item: "Potatoes", amount: "800g" },
        { item: "Butter", amount: "60g" },
        { item: "Whole milk", amount: "400ml" },
        { item: "Plain flour", amount: "40g" },
        { item: "Frozen peas", amount: "100g" }
      ],
      steps: [
        "Boil potatoes and mash with half the butter and some milk",
        "Poach fish in remaining milk for 5 mins",
        "Make white sauce with butter, flour and poaching milk",
        "Flake fish into sauce with peas",
        "Top with mash and bake at 200°C for 25 mins"
      ],
      nutrition: { calories: 420, protein: 28, carbs: 42, fat: 16 }
    },
    {
      name: "Eggy Bread",
      description: "Quick eggy bread soldiers",
      prep_time: 5,
      cook_time: 8,
      servings: 2,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy", "eggs"],
      ingredients: [
        { item: "Bread", amount: "4 slices" },
        { item: "Eggs", amount: "2" },
        { item: "Whole milk", amount: "50ml" },
        { item: "Butter", amount: "25g" }
      ],
      steps: [
        "Beat eggs with milk",
        "Dip bread slices in egg mixture",
        "Fry in butter until golden both sides",
        "Cut into soldiers",
        "Serve with ketchup or beans"
      ],
      nutrition: { calories: 280, protein: 12, carbs: 28, fat: 14 }
    }
  ];

  for (const meal of meals) {
    await sql`
      INSERT INTO meals (name, description, prep_time, cook_time, servings, image_url, is_picky_eater_friendly, allergens, ingredients, steps, nutrition)
      VALUES (${meal.name}, ${meal.description}, ${meal.prep_time}, ${meal.cook_time}, ${meal.servings}, ${meal.image_url}, ${meal.is_picky_eater_friendly}, ${meal.allergens}, ${JSON.stringify(meal.ingredients)}, ${JSON.stringify(meal.steps)}, ${JSON.stringify(meal.nutrition)})
    `;
  }
}

export { sql };
