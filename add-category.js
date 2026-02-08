const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addCategoryColumn() {
  console.log('🏷️ Adding category column to meals table...\n');
  
  // Add category column if it doesn't exist
  try {
    await sql`ALTER TABLE meals ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'main'`;
    console.log('✅ Category column added\n');
  } catch (e) {
    console.log('Column may already exist:', e.message);
  }
  
  // Categorize existing recipes based on name/description
  const meals = await sql`SELECT id, name, description FROM meals`;
  
  console.log('🔄 Categorizing existing recipes...\n');
  
  for (const meal of meals) {
    const nameLower = meal.name.toLowerCase();
    const descLower = (meal.description || '').toLowerCase();
    
    let category = 'main'; // default
    
    // Desserts
    if (nameLower.includes('pancake') || nameLower.includes('french toast') || 
        nameLower.includes('chocolate') || nameLower.includes('brownie') ||
        nameLower.includes('calzone') && nameLower.includes('banana') ||
        nameLower.includes('lolly') || nameLower.includes('lollies') ||
        nameLower.includes('flapjack') || nameLower.includes('pudding') ||
        nameLower.includes('sorbet') || nameLower.includes('crumpet bites') ||
        descLower.includes('dessert') || descLower.includes('treat') ||
        descLower.includes('sweet')) {
      category = 'dessert';
    }
    // Breakfast
    else if (nameLower.includes('porridge') || nameLower.includes('breakfast') ||
             nameLower.includes('eggy bread') || nameLower.includes('bacon naan') ||
             (nameLower.includes('toast') && !nameLower.includes('toastie'))) {
      category = 'breakfast';
    }
    // Snacks
    else if (nameLower.includes('toastie') || nameLower.includes('sandwich') ||
             nameLower.includes('sarnie') || nameLower.includes('bagel') ||
             nameLower.includes('nugget') || nameLower.includes('goujon') ||
             nameLower.includes('fish finger') && !nameLower.includes('sarnie') ||
             nameLower.includes('fritter') || nameLower.includes('falafel') ||
             nameLower.includes('quesadilla')) {
      category = 'snack';
    }
    
    await sql`UPDATE meals SET category = ${category} WHERE id = ${meal.id}`;
    console.log(`  [${meal.id}] ${meal.name} → ${category}`);
  }
  
  // Show summary
  const summary = await sql`SELECT category, COUNT(*) as count FROM meals GROUP BY category ORDER BY category`;
  console.log('\n📊 Category Summary:');
  summary.forEach(s => console.log(`  ${s.category}: ${s.count} recipes`));
}

addCategoryColumn().catch(console.error);
