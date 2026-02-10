require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

// Map each broken recipe to its Jamie Oliver page URL(s) to try
const recipeUrls = {
  "Blueberry Muffins": [
    'https://www.jamieoliver.com/recipes/fruit-recipes/blueberry-muffins/',
    'https://www.jamieoliver.com/recipes/cake-recipes/blueberry-muffins/',
  ],
  "Buddy's Crispy Chicken": [
    'https://www.jamieoliver.com/recipes/chicken-recipes/buddys-crispy-chicken/',
    'https://www.jamieoliver.com/recipes/chicken-recipes/buddy-s-crispy-chicken/',
  ],
  "Buddy's Easy Meatballs": [
    'https://www.jamieoliver.com/recipes/beef-recipes/buddys-easy-meatballs/',
    'https://www.jamieoliver.com/recipes/beef-recipes/buddy-s-easy-meatballs/',
  ],
  "Buddy's Quick Pizzettas": [
    'https://www.jamieoliver.com/recipes/pizza-recipes/buddys-quick-pizzettas/',
    'https://www.jamieoliver.com/recipes/pizza-recipes/buddy-s-quick-pizzettas/',
  ],
  "Buddy's Tuna Pasta": [
    'https://www.jamieoliver.com/recipes/pasta-recipes/buddy-s-tuna-pasta/',
    'https://www.jamieoliver.com/recipes/fish-recipes/buddy-s-tuna-pasta/',
    'https://www.jamieoliver.com/recipes/tuna-recipes/buddy-s-tuna-pasta/',
  ],
  "Buddy's Veggie Nachos": [
    'https://www.jamieoliver.com/recipes/vegetables-recipes/buddy-s-veggie-nachos/',
    'https://www.jamieoliver.com/recipes/snack-recipes/buddy-s-veggie-nachos/',
  ],
  "Choccy Microwave Mug Cake": [
    'https://www.jamieoliver.com/recipes/chocolate-recipes/choccy-microwave-mug-cake/',
    'https://www.jamieoliver.com/recipes/cake-recipes/choccy-microwave-mug-cake/',
  ],
  "Fish Finger Sarnies": [
    'https://www.jamieoliver.com/recipes/fish-recipes/fish-finger-sarnies/',
    'https://www.jamieoliver.com/recipes/sandwich-recipes/fish-finger-sarnies/',
  ],
  "Ginger Nut Biscuits": [
    'https://www.jamieoliver.com/recipes/baking-recipes/ginger-nut-biscuits/',
    'https://www.jamieoliver.com/recipes/fruit-recipes/ginger-nut-biscuits/',
  ],
  "Mini Apple Pancakes": [
    'https://www.jamieoliver.com/recipes/fruit-recipes/mini-apple-pancakes/',
    'https://www.jamieoliver.com/recipes/breakfast-recipes/mini-apple-pancakes/',
  ],
  "Mini Veg Tortillas": [
    'https://www.jamieoliver.com/recipes/vegetables-recipes/mini-veg-tortillas/',
    'https://www.jamieoliver.com/recipes/vegetable-recipes/mini-veg-tortillas/',
  ],
  "Peanut Butter Banana Yoghurt Bark": [
    'https://www.jamieoliver.com/recipes/snack-recipes/peanut-butter-banana-yoghurt-bark/',
    'https://www.jamieoliver.com/recipes/fruit-recipes/peanut-butter-banana-yoghurt-bark/',
  ],
};

async function findImage(name) {
  const urls = recipeUrls[name] || [];
  
  for (const url of urls) {
    try {
      const { status, body } = await fetchUrl(url);
      if (status === 200) {
        // New asset CDN
        const assetMatch = body.match(/(asset\.jamieoliver\.com\/images\/[^"?\s]+)/);
        if (assetMatch) {
          return 'https://' + assetMatch[1] + '?w=600&h=400&fit=crop&fm=webp&q=75';
        }
        // og:image
        const ogMatch = body.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
                        body.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
        if (ogMatch) return ogMatch[1];
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Fallback: search BBC Good Food
  try {
    const slug = name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { status, body } = await fetchUrl(`https://www.bbcgoodfood.com/recipes/${slug}`);
    if (status === 200) {
      const imgMatch = body.match(/(images\.immediate\.co\.uk\/production\/volatile\/sites\/30\/[^"?\s]+)/);
      if (imgMatch) return 'https://' + imgMatch[0];
    }
  } catch (e) {}
  
  // Fallback: BBC search
  try {
    const { status, body } = await fetchUrl(`https://www.bbcgoodfood.com/search?q=${encodeURIComponent(name)}`);
    if (status === 200) {
      const imgMatch = body.match(/(images\.immediate\.co\.uk\/production\/volatile\/sites\/30\/[^"?\s]+)/);
      if (imgMatch) return 'https://' + imgMatch[0];
    }
  } catch (e) {}
  
  return null;
}

async function main() {
  const broken = await sql`SELECT id, name FROM meals WHERE image_url LIKE '%img.jamieoliver%' ORDER BY name`;
  console.log(`Fixing ${broken.length} broken images...\n`);

  let updated = 0;
  let failed = [];

  for (const recipe of broken) {
    process.stdout.write(`🔍 ${recipe.name}... `);
    const imageUrl = await findImage(recipe.name);
    
    if (imageUrl) {
      await sql`UPDATE meals SET image_url = ${imageUrl} WHERE id = ${recipe.id}`;
      console.log(`✅`);
      updated++;
    } else {
      console.log(`❌`);
      failed.push(recipe.name);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n✅ Fixed ${updated}/${broken.length}`);
  if (failed.length) console.log(`❌ Still broken: ${failed.join(', ')}`);
}

main().catch(console.error);
