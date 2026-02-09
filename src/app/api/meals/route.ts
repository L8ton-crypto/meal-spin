import { NextRequest, NextResponse } from 'next/server';
import { initDb, getMeals } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDb();
    
    const { searchParams } = new URL(request.url);
    const maxPrepTime = searchParams.get('maxPrepTime');
    const pickyEaterFriendly = searchParams.get('pickyEaterFriendly');
    const excludeAllergens = searchParams.get('excludeAllergens');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort'); // name, time, newest
    
    const filters: any = {};
    
    if (maxPrepTime) {
      filters.maxPrepTime = parseInt(maxPrepTime);
    }
    
    if (pickyEaterFriendly === 'true') {
      filters.pickyEaterFriendly = true;
    }
    
    if (excludeAllergens) {
      filters.excludeAllergens = excludeAllergens.split(',');
    }

    if (category && category !== 'all') {
      filters.category = category;
    }
    
    let meals = await getMeals(filters);

    // Client-side search filter (name + description)
    if (search) {
      const q = search.toLowerCase();
      meals = meals.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'name') {
      meals.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'time') {
      meals.sort((a, b) => (a.prep_time + a.cook_time) - (b.prep_time + b.cook_time));
    } else if (sort === 'newest') {
      meals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Default: alphabetical for browse
      meals.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
