// Manually set image URLs for remaining recipes using reliable CDN sources
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// Using Unsplash (free, reliable CDN) with relevant food images
const imageMap = {
  'Mac and Cheese': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600&h=400&fit=crop',
  'Spag Bol': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
  'Cheese Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop',
  'Fish Pie': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop',
  'Sausage & Mash': 'https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=600&h=400&fit=crop',
  'Toad in the Hole': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
  'Jacket Potato': 'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=600&h=400&fit=crop',
  'Beans on Toast': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop',
  'Mini Pizzas': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',
  'Cheese Toastie': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop',
  'Chicken Nuggets': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',
  'Chicken Goujons': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',
  'BBC Chicken Goujons': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',
  'Fakeaway Fish & Chips': 'https://images.unsplash.com/photo-1579208030886-b1715a742644?w=600&h=400&fit=crop',
  "Hidden Veg Shepherd's Pie": 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop',
  'Mexican Tortilla Bake': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop',
  'Pitta Pizzas': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  "Veggie Mac 'n' Cheese": 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600&h=400&fit=crop',
  'Mediterranean Turkey Meatballs': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&h=400&fit=crop',
  'Oaty Salmon Fingers': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
  'Bacon Crisp Chicken Nuggets': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',
  'Cheesy Falafels': 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=600&h=400&fit=crop',
  'Veggie Fritters': 'https://images.unsplash.com/photo-1606851094655-b3b5a4f96e7c?w=600&h=400&fit=crop',
  'Eggy Bread': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop',
};

async function main() {
  const missing = await sql`SELECT id, name FROM meals WHERE image_url IS NULL OR image_url = '' ORDER BY name`;
  console.log(`${missing.length} recipes still need images\n`);
  
  let updated = 0;
  for (const recipe of missing) {
    const imageUrl = imageMap[recipe.name];
    if (imageUrl) {
      await sql`UPDATE meals SET image_url = ${imageUrl} WHERE id = ${recipe.id}`;
      console.log(`✅ ${recipe.name}`);
      updated++;
    } else {
      console.log(`❌ No mapping for: ${recipe.name}`);
    }
  }
  
  console.log(`\n✅ Updated ${updated}/${missing.length} recipes`);
  
  // Final check
  const remaining = await sql`SELECT COUNT(*) as count FROM meals WHERE image_url IS NULL OR image_url = ''`;
  console.log(`Remaining without images: ${remaining[0].count}`);
}

main().catch(console.error);
