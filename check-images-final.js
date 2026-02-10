require('dotenv').config({path:'.env.local'});
const{neon}=require('@neondatabase/serverless');
const sql=neon(process.env.DATABASE_URL);

async function main() {
  const unsplash = await sql`SELECT COUNT(*) as c FROM meals WHERE image_url LIKE '%unsplash%'`;
  const total = await sql`SELECT COUNT(*) as c FROM meals WHERE image_url IS NOT NULL AND image_url != ''`;
  const all = await sql`SELECT COUNT(*) as c FROM meals`;
  console.log(`Total recipes: ${all[0].c}`);
  console.log(`With images: ${total[0].c}`);
  console.log(`Unsplash placeholders: ${unsplash[0].c}`);
}
main().catch(console.error);
