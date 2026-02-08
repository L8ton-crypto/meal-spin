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
  const maxTime = filters?.maxPrepTime;
  const pickyOnly = filters?.pickyEaterFriendly;
  const excludeAllergens = filters?.excludeAllergens || [];

  // Use different queries based on filter combinations to work with tagged template
  if (maxTime && pickyOnly && excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE prep_time <= ${maxTime} AND is_picky_eater_friendly = true AND NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else if (maxTime && pickyOnly) {
    return sql`SELECT * FROM meals WHERE prep_time <= ${maxTime} AND is_picky_eater_friendly = true ORDER BY RANDOM()` as unknown as Meal[];
  } else if (maxTime && excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE prep_time <= ${maxTime} AND NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else if (pickyOnly && excludeAllergens.length > 0) {
    return sql`SELECT * FROM meals WHERE is_picky_eater_friendly = true AND NOT (allergens && ${excludeAllergens}::text[]) ORDER BY RANDOM()` as unknown as Meal[];
  } else if (maxTime) {
    return sql`SELECT * FROM meals WHERE prep_time <= ${maxTime} ORDER BY RANDOM()` as unknown as Meal[];
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
        { item: "Elbow pasta", amount: "2 cups" },
        { item: "Butter", amount: "2 tbsp" },
        { item: "Flour", amount: "2 tbsp" },
        { item: "Milk", amount: "1.5 cups" },
        { item: "Cheddar cheese", amount: "2 cups shredded" },
        { item: "Salt", amount: "to taste" }
      ],
      steps: [
        "Cook pasta according to package directions",
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
        { item: "Chicken breast", amount: "1 lb, cut into pieces" },
        { item: "Flour", amount: "1 cup" },
        { item: "Eggs", amount: "2, beaten" },
        { item: "Breadcrumbs", amount: "1.5 cups" },
        { item: "Salt", amount: "1 tsp" },
        { item: "Paprika", amount: "1 tsp" }
      ],
      steps: [
        "Cut chicken into nugget-sized pieces",
        "Set up breading station: flour, eggs, breadcrumbs with seasonings",
        "Dredge chicken in flour, then egg, then breadcrumbs",
        "Bake at 400°F for 12-15 minutes",
        "Serve with favorite dipping sauce"
      ],
      nutrition: { calories: 320, protein: 28, carbs: 18, fat: 14 }
    },
    {
      name: "Spaghetti and Meatballs",
      description: "Classic comfort food with tender meatballs",
      prep_time: 20,
      cook_time: 25,
      servings: 6,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "eggs"],
      ingredients: [
        { item: "Ground beef", amount: "1 lb" },
        { item: "Breadcrumbs", amount: "0.5 cups" },
        { item: "Egg", amount: "1" },
        { item: "Spaghetti", amount: "1 lb" },
        { item: "Marinara sauce", amount: "3 cups" },
        { item: "Parmesan cheese", amount: "0.5 cups grated" }
      ],
      steps: [
        "Mix ground beef, breadcrumbs, egg, salt and pepper",
        "Form into meatballs",
        "Brown meatballs in pan",
        "Simmer in marinara sauce for 15 minutes",
        "Cook spaghetti according to package directions",
        "Serve meatballs over pasta, top with cheese"
      ],
      nutrition: { calories: 450, protein: 25, carbs: 58, fat: 12 }
    },
    {
      name: "Grilled Cheese Sandwich",
      description: "Golden, crispy sandwich with melted cheese",
      prep_time: 5,
      cook_time: 6,
      servings: 1,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy", "gluten"],
      ingredients: [
        { item: "Bread", amount: "2 slices" },
        { item: "Butter", amount: "2 tbsp" },
        { item: "Cheese slices", amount: "2-3 slices" }
      ],
      steps: [
        "Butter one side of each bread slice",
        "Place cheese between unbuttered sides",
        "Heat pan over medium heat",
        "Cook sandwich 2-3 minutes per side until golden",
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
      allergens: ["dairy"],
      ingredients: [
        { item: "Flour tortillas", amount: "4 large" },
        { item: "Cooked chicken", amount: "1 cup shredded" },
        { item: "Cheese", amount: "1.5 cups shredded" },
        { item: "Butter", amount: "2 tbsp" }
      ],
      steps: [
        "Place chicken and cheese on half of each tortilla",
        "Fold tortillas in half",
        "Heat butter in pan",
        "Cook quesadillas 2-3 minutes per side until crispy",
        "Cut into wedges and serve"
      ],
      nutrition: { calories: 420, protein: 26, carbs: 32, fat: 22 }
    },
    {
      name: "Mini Pizzas",
      description: "English muffin pizzas with favorite toppings",
      prep_time: 10,
      cook_time: 8,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy"],
      ingredients: [
        { item: "English muffins", amount: "4, split" },
        { item: "Pizza sauce", amount: "0.5 cups" },
        { item: "Mozzarella cheese", amount: "1.5 cups shredded" },
        { item: "Pepperoni", amount: "optional" }
      ],
      steps: [
        "Preheat oven to 425°F",
        "Spread sauce on muffin halves",
        "Sprinkle with cheese and add toppings",
        "Bake for 6-8 minutes until cheese melts",
        "Cool slightly before serving"
      ],
      nutrition: { calories: 280, protein: 14, carbs: 28, fat: 12 }
    },
    {
      name: "Pancakes",
      description: "Fluffy breakfast pancakes",
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy", "eggs"],
      ingredients: [
        { item: "Flour", amount: "2 cups" },
        { item: "Sugar", amount: "2 tbsp" },
        { item: "Baking powder", amount: "2 tsp" },
        { item: "Salt", amount: "1 tsp" },
        { item: "Milk", amount: "1.75 cups" },
        { item: "Eggs", amount: "2" },
        { item: "Butter", amount: "4 tbsp melted" }
      ],
      steps: [
        "Mix dry ingredients in large bowl",
        "Whisk milk, eggs, and melted butter",
        "Combine wet and dry ingredients until just mixed",
        "Cook on griddle until bubbles form, flip once",
        "Serve with syrup or fruit"
      ],
      nutrition: { calories: 320, protein: 10, carbs: 48, fat: 10 }
    },
    {
      name: "Chicken Tenders",
      description: "Crispy baked chicken strips",
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten"],
      ingredients: [
        { item: "Chicken tenderloins", amount: "1.5 lbs" },
        { item: "Flour", amount: "1 cup" },
        { item: "Breadcrumbs", amount: "1.5 cups" },
        { item: "Parmesan cheese", amount: "0.5 cups grated" },
        { item: "Garlic powder", amount: "1 tsp" },
        { item: "Salt and pepper", amount: "to taste" }
      ],
      steps: [
        "Preheat oven to 425°F",
        "Set up breading station with flour and seasoned breadcrumbs",
        "Coat chicken in flour, then breadcrumbs",
        "Place on baking sheet and bake 18-20 minutes",
        "Serve with honey mustard or ranch"
      ],
      nutrition: { calories: 290, protein: 32, carbs: 15, fat: 10 }
    },
    {
      name: "Cheese Pizza",
      description: "Classic homemade pizza with cheese",
      prep_time: 20,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy"],
      ingredients: [
        { item: "Pizza dough", amount: "1 lb" },
        { item: "Pizza sauce", amount: "0.75 cups" },
        { item: "Mozzarella cheese", amount: "2 cups shredded" },
        { item: "Olive oil", amount: "2 tbsp" }
      ],
      steps: [
        "Preheat oven to 475°F",
        "Roll out dough on floured surface",
        "Transfer to pizza pan, brush with olive oil",
        "Spread sauce and sprinkle cheese",
        "Bake 12-15 minutes until crust is golden"
      ],
      nutrition: { calories: 420, protein: 18, carbs: 52, fat: 16 }
    },
    {
      name: "Fish Sticks",
      description: "Crispy baked fish fingers",
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten"],
      ingredients: [
        { item: "White fish fillets", amount: "1 lb, cut into strips" },
        { item: "Breadcrumbs", amount: "1.5 cups" },
        { item: "Flour", amount: "0.5 cups" },
        { item: "Egg", amount: "1, beaten" },
        { item: "Salt", amount: "1 tsp" }
      ],
      steps: [
        "Preheat oven to 400°F",
        "Cut fish into finger-sized strips",
        "Bread fish: flour, egg, then breadcrumbs",
        "Place on baking sheet and bake 12-15 minutes",
        "Serve with tartar sauce or ketchup"
      ],
      nutrition: { calories: 260, protein: 24, carbs: 18, fat: 8 }
    },
    {
      name: "Waffles",
      description: "Crispy golden waffles",
      prep_time: 10,
      cook_time: 20,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy", "eggs"],
      ingredients: [
        { item: "Flour", amount: "2 cups" },
        { item: "Sugar", amount: "2 tbsp" },
        { item: "Baking powder", amount: "1 tbsp" },
        { item: "Salt", amount: "0.5 tsp" },
        { item: "Milk", amount: "1.75 cups" },
        { item: "Eggs", amount: "2, separated" },
        { item: "Butter", amount: "4 tbsp melted" }
      ],
      steps: [
        "Mix dry ingredients in bowl",
        "Whisk milk, egg yolks, and melted butter",
        "Beat egg whites until stiff peaks form",
        "Combine wet and dry ingredients, fold in egg whites",
        "Cook in waffle iron until golden"
      ],
      nutrition: { calories: 340, protein: 11, carbs: 50, fat: 12 }
    },
    {
      name: "Tacos",
      description: "Soft shell tacos with ground beef",
      prep_time: 15,
      cook_time: 10,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["dairy"],
      ingredients: [
        { item: "Ground beef", amount: "1 lb" },
        { item: "Taco seasoning", amount: "1 packet" },
        { item: "Soft taco shells", amount: "8" },
        { item: "Shredded cheese", amount: "1 cup" },
        { item: "Lettuce", amount: "2 cups shredded" },
        { item: "Tomatoes", amount: "2, diced" }
      ],
      steps: [
        "Brown ground beef in large pan",
        "Add taco seasoning and water per packet instructions",
        "Simmer until thickened",
        "Warm taco shells according to package",
        "Assemble tacos with meat and toppings"
      ],
      nutrition: { calories: 380, protein: 24, carbs: 28, fat: 18 }
    },
    {
      name: "Hot Dogs",
      description: "Classic hot dogs with buns",
      prep_time: 5,
      cook_time: 8,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten"],
      ingredients: [
        { item: "Hot dogs", amount: "8" },
        { item: "Hot dog buns", amount: "8" },
        { item: "Ketchup", amount: "optional" },
        { item: "Mustard", amount: "optional" },
        { item: "Relish", amount: "optional" }
      ],
      steps: [
        "Boil hot dogs in water for 5-7 minutes",
        "Or grill for 8-10 minutes",
        "Warm buns if desired",
        "Place hot dogs in buns",
        "Add condiments as desired"
      ],
      nutrition: { calories: 290, protein: 12, carbs: 25, fat: 16 }
    },
    {
      name: "French Toast",
      description: "Sweet breakfast french toast",
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy", "eggs"],
      ingredients: [
        { item: "Bread slices", amount: "8 thick slices" },
        { item: "Eggs", amount: "4" },
        { item: "Milk", amount: "0.5 cups" },
        { item: "Vanilla", amount: "1 tsp" },
        { item: "Cinnamon", amount: "1 tsp" },
        { item: "Butter", amount: "for cooking" }
      ],
      steps: [
        "Beat eggs, milk, vanilla, and cinnamon",
        "Dip bread slices in mixture",
        "Cook in buttered pan until golden on both sides",
        "Serve with syrup and butter"
      ],
      nutrition: { calories: 320, protein: 12, carbs: 38, fat: 14 }
    },
    {
      name: "Chicken Rice Bowl",
      description: "Simple chicken and rice dinner",
      prep_time: 10,
      cook_time: 25,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: [],
      ingredients: [
        { item: "Chicken breast", amount: "1 lb, diced" },
        { item: "White rice", amount: "1.5 cups uncooked" },
        { item: "Chicken broth", amount: "3 cups" },
        { item: "Soy sauce", amount: "2 tbsp" },
        { item: "Garlic powder", amount: "1 tsp" },
        { item: "Frozen peas", amount: "1 cup" }
      ],
      steps: [
        "Cook rice in chicken broth",
        "Season and cook diced chicken",
        "Add peas in last 2 minutes of cooking",
        "Serve chicken over rice",
        "Drizzle with soy sauce"
      ],
      nutrition: { calories: 420, protein: 32, carbs: 58, fat: 6 }
    },
    {
      name: "Meatball Subs",
      description: "Meatballs in marinara on sub rolls",
      prep_time: 10,
      cook_time: 20,
      servings: 4,
      image_url: null,
      is_picky_eater_friendly: true,
      allergens: ["gluten", "dairy"],
      ingredients: [
        { item: "Frozen meatballs", amount: "20 pieces" },
        { item: "Marinara sauce", amount: "2 cups" },
        { item: "Sub rolls", amount: "4" },
        { item: "Mozzarella cheese", amount: "1 cup shredded" }
      ],
      steps: [
        "Heat meatballs in marinara sauce",
        "Simmer for 15 minutes",
        "Split sub rolls and warm slightly",
        "Fill with meatballs and sauce",
        "Top with cheese and serve"
      ],
      nutrition: { calories: 520, protein: 26, carbs: 48, fat: 24 }
    }
    // Now we have 15 diverse kid-friendly meals!
  ];

  for (const meal of meals) {
    await sql`
      INSERT INTO meals (name, description, prep_time, cook_time, servings, image_url, is_picky_eater_friendly, allergens, ingredients, steps, nutrition)
      VALUES (${meal.name}, ${meal.description}, ${meal.prep_time}, ${meal.cook_time}, ${meal.servings}, ${meal.image_url}, ${meal.is_picky_eater_friendly}, ${meal.allergens}, ${JSON.stringify(meal.ingredients)}, ${JSON.stringify(meal.steps)}, ${JSON.stringify(meal.nutrition)})
    `;
  }
}

export { sql };