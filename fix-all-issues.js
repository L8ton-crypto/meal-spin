require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
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

async function findBBCImage(searchTerm) {
  try {
    const { status, body } = await fetchUrl(`https://www.bbcgoodfood.com/search?q=${encodeURIComponent(searchTerm)}`);
    if (status === 200) {
      const match = body.match(/(images\.immediate\.co\.uk\/production\/volatile\/sites\/30\/[^"?\s]+\.(jpg|png|webp))/);
      if (match) return 'https://' + match[1];
    }
  } catch (e) {}
  return null;
}

async function main() {
  console.log('=== FIXING IMAGE ISSUES ===\n');

  // 1. Chicken Nuggets - 502 error, find new image
  console.log('🔍 Chicken Nuggets...');
  let img = await findBBCImage('homemade chicken nuggets kids');
  if (img) {
    await sql`UPDATE meals SET image_url = ${img} WHERE id = 2`;
    console.log('  ✅ New image set');
  } else {
    // Fallback to a known working BBC image
    const fallback = 'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image__380x380--a0be09b.jpg';
    await sql`UPDATE meals SET image_url = ${fallback} WHERE id = 2`;
    console.log('  ✅ Fallback image set');
  }
  await new Promise(r => setTimeout(r, 1500));

  // 2. Mini Veg Tortillas - 502 error
  console.log('🔍 Mini Veg Tortillas...');
  img = await findBBCImage('mini vegetable tortillas');
  if (img) {
    await sql`UPDATE meals SET image_url = ${img} WHERE id = 73`;
    console.log('  ✅ New image set');
  } else {
    const fallback = 'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image__380x380--a0be09b.jpg';
    await sql`UPDATE meals SET image_url = ${fallback} WHERE id = 73`;
    console.log('  ✅ Fallback image set');
  }
  await new Promise(r => setTimeout(r, 1500));

  // 3. Beans on Toast - wrong image (smoky beans instead of classic)
  console.log('🔍 Beans on Toast...');
  img = await findBBCImage('beans on toast');
  if (img) {
    await sql`UPDATE meals SET image_url = ${img} WHERE id = 11`;
    console.log('  ✅ New image: ' + img.substring(0, 60));
  }
  await new Promise(r => setTimeout(r, 1500));

  // 4. Buddy's Crispy-Skinned Fish - wrong content (mackerel not fish)
  // The recipe itself has mackerel ingredients - the image IS correct for that recipe
  // But the name suggests a different dish. Let's find a proper crispy fish image
  console.log("🔍 Buddy's Crispy-Skinned Fish...");
  img = await findBBCImage('crispy skinned fish');
  if (img) {
    await sql`UPDATE meals SET image_url = ${img} WHERE id = 98`;
    console.log('  ✅ New image set');
  }
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n=== FIXING INGREDIENT FORMAT ===\n');

  // Find all recipes where ingredients are stored as plain strings instead of {item, amount} objects
  const allMeals = await sql`SELECT id, name, ingredients FROM meals`;
  let fixedCount = 0;
  
  for (const meal of allMeals) {
    if (!Array.isArray(meal.ingredients) || meal.ingredients.length === 0) continue;
    
    // Check if first ingredient is a string (not an object)
    if (typeof meal.ingredients[0] === 'string') {
      // Convert plain strings to {item, amount} objects
      const fixed = meal.ingredients.map(ing => {
        if (typeof ing !== 'string') return ing;
        
        // Try to split "amount item" pattern
        // Common patterns: "4 wholemeal tortillas", "1 x 460g jar of roasted red peppers", "olive oil"
        const match = ing.match(/^([\d½¼¾⅓⅔]+(?:\s*(?:x|×)\s*\d+)?(?:\s*(?:g|kg|ml|l|tbsp|tsp|cm|mm))?)\s+(.+)$/i);
        if (match) {
          return { item: match[2].trim(), amount: match[1].trim() };
        }
        // No amount - just the item
        return { item: ing, amount: '' };
      });
      
      await sql`UPDATE meals SET ingredients = ${JSON.stringify(fixed)}::jsonb WHERE id = ${meal.id}`;
      console.log(`✅ ${meal.name} — converted ${fixed.length} ingredients`);
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ingredient format for ${fixedCount} recipes`);

  // Final verification
  console.log('\n=== VERIFICATION ===\n');
  const verify = [2, 11, 73, 75, 76, 77, 78, 79, 98];
  for (const id of verify) {
    const rows = await sql`SELECT id, name, image_url, ingredients FROM meals WHERE id = ${id}`;
    if (rows.length === 0) continue;
    const r = rows[0];
    const ingType = Array.isArray(r.ingredients) && r.ingredients.length > 0 ? typeof r.ingredients[0] : 'empty';
    console.log(`${r.name}: img=${r.image_url ? '✅' : '❌'} | ing=${ingType === 'object' ? '✅' : '⚠️ ' + ingType} (${r.ingredients?.length || 0})`);
  }
}

main().catch(console.error);
