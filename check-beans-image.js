require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`SELECT id, name, image_url FROM meals WHERE id = 11`;
  console.log('Current URL:', rows[0].image_url);
}
main().catch(console.error);
