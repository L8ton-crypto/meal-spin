import { NextRequest, NextResponse } from 'next/server';
import { initDb, getMeals } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDb();
    
    const { searchParams } = new URL(request.url);
    const maxPrepTime = searchParams.get('maxPrepTime');
    const pickyEaterFriendly = searchParams.get('pickyEaterFriendly');
    const excludeAllergens = searchParams.get('excludeAllergens');
    
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
    
    const meals = await getMeals(filters);
    
    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}