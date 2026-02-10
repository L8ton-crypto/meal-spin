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
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

// The broken recipes and their Jamie Oliver page slugs
const recipePages = {
  "Buddy's Crispy Chicken": 'buddys-crispy-chicken',
  "Buddy's Easy Meatballs": 'buddys-easy-meatballs',
  "Buddy's Quick Pizzettas": 'buddys-quick-pizzettas',
  "Buddy's Tuna Pasta": 'buddy-s-tuna-pasta',
  "Buddy's Veggie Nachos": 'buddy-s-veggie-nachos',
};

async function findImage(slug) {
  // Try jamieoliver.com recipe page
  const urls = [
    `https://www.jamieoliver.com/recipes/${slug}/`,
    `https://www.jamieoliver.com/recipes/chicken-recipes/${slug}/`,
    `https://www.jamieoliver.com/recipes/pasta-recipes/${slug}/`,
    `https://www.jamieoliver.com/recipes/pizza-recipes/${slug}/`,
    `https://www.jamieoliver.com/recipes/beef-recipes/${slug}/`,
    `https://www.jamieoliver.com/recipes/fish-recipes/${slug}/`,
  ];
  
  for (const url of urls) {
    try {
      const { status, body } = await fetchUrl(url);
      if (status === 200) {
        // Look for the new asset CDN image in JSON-LD
        const assetMatch = body.match(/asset\.jamieoliver\.com\/images\/[^"?\s]+/);
        if (assetMatch) {
          return 'https://' + assetMatch[0] + '?w=600&h=400&fit=crop&fm=webp&q=75';
        }
        // Try og:image
        const ogMatch = body.match(/<meta\s+property="og:image"\s+content="(https?:\/\/[^"]+)"/i) ||
                        body.match(/content="(https?:\/\/[^"]+)"\s+property="og:image"/i);
        if (ogMatch) return ogMatch[1];
      }
    } catch (e) {}
  }
  return null;
}

async function main() {
  const broken = await sql`SELECT id, name, image_url FROM meals WHERE image_url LIKE '%img.jamieoliver%' ORDER BY name`;
  console.log(`${broken.length} recipes with old Jamie Oliver CDN URLs\n`);

  let updated = 0;
  for (const recipe of broken) {
    const slug = recipePages[recipe.name];
    if (!slug) {
      console.log(`❌ ${recipe.name}: no slug mapped`);
      continue;
    }
    
    process.stdout.write(`🔍 ${recipe.name}... `);
    const imageUrl = await findImage(slug);
    
    if (imageUrl) {
      await sql`UPDATE meals SET image_url = ${imageUrl} WHERE id = ${recipe.id}`;
      console.log(`✅ ${imageUrl.substring(0, 80)}...`);
      updated++;
    } else {
      console.log(`❌ not found`);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\n✅ Fixed ${updated}/${broken.length}`);
}

main().catch(console.error);
