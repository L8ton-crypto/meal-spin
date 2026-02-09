// Add image URLs for recipes that don't have them
// Using royalty-free/open images from recipe sources
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// We'll search for images from BBC Good Food and similar open sources
const https = require('https');
const http = require('http');

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function findBBCImage(searchTerm) {
  try {
    const slug = searchTerm.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const url = `https://www.bbcgoodfood.com/recipes/${slug}`;
    const html = await fetchPage(url);
    
    // Look for og:image or JSON-LD image
    const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    if (ogMatch) return ogMatch[1];
    
    const ldMatch = html.match(/"image"\s*:\s*\[?\s*"(https?:\/\/[^"]+)"/);
    if (ldMatch) return ldMatch[1];
    
    return null;
  } catch (e) {
    return null;
  }
}

// Mapping of recipe names to BBC Good Food slugs (manually verified)
const bbcSlugs = {
  'Mac and Cheese': 'mac-cheese',
  'Spag Bol': 'spaghetti-bolognese',
  'Cheese Pizza': 'easy-cheese-pizza',
  'Fish Pie': 'easy-fish-pie',
  'Sausage & Mash': 'sausage-mash',
  'Toad in the Hole': 'toad-in-the-hole',
  'Jacket Potato': 'jacket-potatoes',
  'Beans on Toast': 'beans-on-toast',
  'Eggy Bread': 'eggy-bread',
  'Pancakes': 'easy-pancakes',
  'Cheese Toastie': 'cheese-toastie',
  'Chicken Nuggets': 'homemade-chicken-nuggets',
  'Fish Fingers': 'homemade-fish-fingers',
  'Chicken Goujons': 'chicken-goujons',
  'Chicken Quesadillas': 'chicken-quesadillas',
  'Mini Pizzas': 'mini-pizza',
  'Chicken Katsu Curry': 'katsu-curry',
  'Fakeaway Fish & Chips': 'fish-chips',
  'Hidden Veg Shepherd\'s Pie': 'shepherds-pie',
  'Mexican Tortilla Bake': 'mexican-tortilla-bake',
  'Egg Fried Rice': 'egg-fried-rice',
  'Beany Enchiladas': 'bean-enchiladas',
  'Pitta Pizzas': 'pitta-pizza',
  'Veggie Mac \'n\' Cheese': 'veggie-mac-cheese',
  'Mediterranean Turkey Meatballs': 'turkey-meatballs',
  'Sausage Pasta Bake': 'sausage-pasta-bake',
  'Oaty Salmon Fingers': 'salmon-fish-fingers',
  'BBC Chicken Goujons': 'chicken-goujons',
  'Bacon Crisp Chicken Nuggets': 'chicken-nuggets',
  'Cheesy Falafels': 'falafel',
  'Veggie Fritters': 'veggie-fritters',
};

async function main() {
  const missing = await sql`SELECT id, name FROM meals WHERE image_url IS NULL OR image_url = '' ORDER BY name`;
  console.log(`Found ${missing.length} recipes without images\n`);
  
  let updated = 0;
  let failed = [];
  
  for (const recipe of missing) {
    const slug = bbcSlugs[recipe.name];
    if (!slug) {
      console.log(`❌ No slug mapped for: ${recipe.name}`);
      failed.push(recipe.name);
      continue;
    }
    
    const url = `https://www.bbcgoodfood.com/recipes/${slug}`;
    console.log(`🔍 ${recipe.name} → ${url}`);
    
    const imageUrl = await findBBCImage(slug);
    if (imageUrl) {
      await sql`UPDATE meals SET image_url = ${imageUrl} WHERE id = ${recipe.id}`;
      console.log(`  ✅ Updated with image`);
      updated++;
    } else {
      console.log(`  ❌ No image found`);
      failed.push(recipe.name);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n✅ Updated ${updated} recipes`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.join(', ')}`);
  }
}

main().catch(console.error);
