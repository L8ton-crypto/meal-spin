// Search for proper recipe images via web search
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function findImageFromBBCGoodFood(recipeName) {
  // Try multiple slug variations
  const slugs = [
    recipeName.toLowerCase().replace(/['']/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    recipeName.toLowerCase().replace(/['']/g, '').replace(/&/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    'best-' + recipeName.toLowerCase().replace(/['']/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    'easy-' + recipeName.toLowerCase().replace(/['']/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  ];

  for (const slug of slugs) {
    try {
      const url = `https://www.bbcgoodfood.com/recipes/${slug}`;
      const { status, body } = await fetchUrl(url);
      if (status === 200) {
        // Try JSON-LD first
        const ldMatch = body.match(/"image"\s*:\s*(?:\[)?\s*{[^}]*"url"\s*:\s*"(https?:\/\/[^"]+)"/);
        if (ldMatch) return ldMatch[1];
        
        // Try og:image
        const ogMatch = body.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) ||
                        body.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i);
        if (ogMatch) return ogMatch[1];

        // Try srcset or img with recipe in it
        const imgMatch = body.match(/images\.immediate\.co\.uk\/production\/volatile\/sites\/30\/[^"?\s]+/);
        if (imgMatch) return 'https://' + imgMatch[0];
      }
    } catch (e) {
      // try next slug
    }
  }
  return null;
}

async function findImageFromSearch(recipeName) {
  // Try BBC Good Food search
  try {
    const searchUrl = `https://www.bbcgoodfood.com/search?q=${encodeURIComponent(recipeName)}`;
    const { status, body } = await fetchUrl(searchUrl);
    if (status === 200) {
      // Find first recipe link and image
      const imgMatch = body.match(/images\.immediate\.co\.uk\/production\/volatile\/sites\/30\/[^"?\s]+/);
      if (imgMatch) return 'https://' + imgMatch[0];
    }
  } catch (e) {}
  return null;
}

async function main() {
  const recipes = await sql`SELECT id, name FROM meals WHERE image_url LIKE '%unsplash%' ORDER BY name`;
  console.log(`Finding proper images for ${recipes.length} recipes...\n`);

  let updated = 0;
  let failed = [];

  for (const recipe of recipes) {
    process.stdout.write(`🔍 ${recipe.name}... `);
    
    // Try direct URL first
    let imageUrl = await findImageFromBBCGoodFood(recipe.name);
    
    // Try search if direct failed
    if (!imageUrl) {
      imageUrl = await findImageFromSearch(recipe.name);
    }

    if (imageUrl) {
      await sql`UPDATE meals SET image_url = ${imageUrl} WHERE id = ${recipe.id}`;
      console.log(`✅`);
      updated++;
    } else {
      console.log(`❌`);
      failed.push(recipe.name);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n✅ Found ${updated}/${recipes.length} proper images`);
  if (failed.length > 0) {
    console.log(`❌ Still need: ${failed.join(', ')}`);
  }
}

main().catch(console.error);
