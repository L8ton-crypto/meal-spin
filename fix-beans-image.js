require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  // Try multiple sources for a classic beans on toast image
  const sources = [
    'https://www.christinascucina.com/beans-on-toast-the-proper-british-way-recipe-by-a-brit/',
    'https://bitofthegoodstuff.com/2024/11/baked-beans-on-toast/',
    'https://www.lanascooking.com/beans-toast/',
  ];

  for (const url of sources) {
    try {
      const html = await fetchHtml(url);
      // og:image
      const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                      html.match(/content="([^"]+)"\s+property="og:image"/i);
      if (ogMatch) {
        console.log(`Found from ${url}:`);
        console.log(`  ${ogMatch[1]}`);
        
        // Use this one
        await sql`UPDATE meals SET image_url = ${ogMatch[1]} WHERE id = 11`;
        console.log('  ✅ Updated Beans on Toast');
        return;
      }
    } catch (e) {
      console.log(`Failed: ${url} - ${e.message}`);
    }
  }
  console.log('❌ No image found');
}

main().catch(console.error);
