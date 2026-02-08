const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// All 37 Jamie Oliver cooking with kids recipes
const recipes = [
  { name: "Boo-nana Ghosts", desc: "Spooky banana treats with chocolate chip eyes - perfect for Halloween", prep: 5, cook: 0, cat: "snack", allergens: [] },
  { name: "Spooky Red Dip", desc: "Creepy beetroot hummus for Halloween parties", prep: 10, cook: 0, cat: "snack", allergens: [] },
  { name: "Bat Crackers", desc: "Fun Halloween crackers shaped like bats", prep: 15, cook: 0, cat: "snack", allergens: ["gluten"] },
  { name: "Spider Pizzas", desc: "Spooky pizzas with olive spider decorations", prep: 15, cook: 12, cat: "main", allergens: ["gluten", "dairy"] },
  { name: "Apple Monsters", desc: "Creepy apple creatures with googly marshmallow eyes", prep: 10, cook: 0, cat: "snack", allergens: [] },
  { name: "Tex-Mex Bowl", desc: "Quick and colourful Mexican-inspired rice bowl", prep: 10, cook: 15, cat: "main", allergens: ["dairy"] },
  { name: "Cheesy Corn Flatbreads", desc: "Quick cheesy flatbreads with sweetcorn", prep: 10, cook: 15, cat: "snack", allergens: ["gluten", "dairy"] },
  { name: "Harissa Falafel", desc: "Homemade spiced falafel - kids can help shape them", prep: 20, cook: 15, cat: "main", allergens: ["gluten"] },
  { name: "Store-Cupboard Mackerel Pasta", desc: "Quick pasta with tinned mackerel and tomatoes", prep: 10, cook: 15, cat: "main", allergens: ["gluten", "fish"] },
  { name: "Carrot Cake Pancakes", desc: "Fluffy pancakes with grated carrot and warm spices", prep: 10, cook: 15, cat: "breakfast", allergens: ["gluten", "eggs", "dairy"] },
  { name: "Hot Cross Bun Bread Pudding", desc: "Indulgent Easter dessert using hot cross buns", prep: 15, cook: 40, cat: "dessert", allergens: ["gluten", "eggs", "dairy"] },
  { name: "Black Forest Yoghurt Bark", desc: "Frozen yoghurt bark with cherries and chocolate", prep: 10, cook: 0, cat: "snack", allergens: ["dairy"] },
  { name: "Mint Choc Chip Yoghurt Bark", desc: "Frozen yoghurt bark with mint and chocolate chips", prep: 10, cook: 0, cat: "snack", allergens: ["dairy"] },
  { name: "Steak Sarnie", desc: "Jamie's ultimate steak sandwich with onions", prep: 10, cook: 15, cat: "main", allergens: ["gluten"] },
  { name: "Mini Quiches", desc: "Bite-sized quiches perfect for lunchboxes", prep: 20, cook: 25, cat: "snack", allergens: ["gluten", "eggs", "dairy"] },
  { name: "Egg Tortilla Wrap", desc: "Quick breakfast wrap with scrambled eggs", prep: 5, cook: 5, cat: "breakfast", allergens: ["gluten", "eggs"] },
  { name: "Quick and Easy Pizzas", desc: "Speedy homemade pizzas kids can top themselves", prep: 15, cook: 12, cat: "main", allergens: ["gluten", "dairy"] },
  { name: "Spicy Tomato Pasta", desc: "Simple pasta with a kick - adjust spice for kids", prep: 5, cook: 15, cat: "main", allergens: ["gluten"] },
  { name: "Banana Sticky Toffee Pudding", desc: "Gooey banana pudding with toffee sauce", prep: 15, cook: 35, cat: "dessert", allergens: ["gluten", "eggs", "dairy"] },
  { name: "Buddy's Super Veggie Burgers", desc: "Loaded veggie burgers packed with goodness", prep: 20, cook: 15, cat: "main", allergens: ["gluten", "eggs"] },
  { name: "Buddy's Grilled Fruit Salad", desc: "Warm grilled fruit with honey and yoghurt", prep: 10, cook: 10, cat: "dessert", allergens: ["dairy"] },
  { name: "Buddy's Barbecue Ribs", desc: "Sticky BBQ ribs - messy but delicious!", prep: 15, cook: 60, cat: "main", allergens: [] },
  { name: "Buddy's Super-Quick Flatbreads", desc: "2-ingredient flatbreads ready in minutes", prep: 10, cook: 10, cat: "snack", allergens: ["gluten", "dairy"] },
  { name: "Buddy's Crispy-Skinned Fish", desc: "Pan-fried fish with perfectly crispy skin", prep: 10, cook: 10, cat: "main", allergens: ["fish"] },
];

async function addRecipes() {
  console.log("🍳 Adding remaining Jamie Oliver recipes...\n");
  
  let added = 0;
  let skipped = 0;
  
  for (const r of recipes) {
    try {
      const existing = await sql`SELECT id FROM meals WHERE name = ${r.name}`;
      if (existing.length > 0) {
        console.log(`⏭️  Exists: ${r.name}`);
        skipped++;
        continue;
      }
      
      await sql`
        INSERT INTO meals (name, description, prep_time, cook_time, servings, image_url, is_picky_eater_friendly, allergens, ingredients, steps, nutrition, category)
        VALUES (${r.name}, ${r.desc}, ${r.prep}, ${r.cook}, ${4}, ${null}, ${true}, ${r.allergens}, ${JSON.stringify([])}, ${JSON.stringify([])}, ${JSON.stringify({})}, ${r.cat})
      `;
      
      console.log(`✅ Added: ${r.name} (${r.prep + r.cook}min) [${r.cat}]`);
      added++;
    } catch (e) {
      console.log(`❌ Error: ${r.name}: ${e.message}`);
    }
  }
  
  console.log(`\n✨ Added ${added} recipes, skipped ${skipped} existing`);
  
  const total = await sql`SELECT COUNT(*) as count FROM meals`;
  console.log(`📊 Total recipes: ${total[0].count}`);
  
  const summary = await sql`SELECT category, COUNT(*) as count FROM meals GROUP BY category ORDER BY category`;
  console.log('\n📊 By category:');
  summary.forEach(s => console.log(`  ${s.category}: ${s.count}`));
}

addRecipes().catch(console.error);
