import { NextRequest, NextResponse } from 'next/server';
import { initDb, getRandomMeal } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initDb();
    
    const body = await request.json();
    const { maxPrepTime, pickyEaterFriendly, excludeAllergens, category } = body;
    
    const meal = await getRandomMeal({
      maxPrepTime,
      pickyEaterFriendly,
      excludeAllergens,
      category
    });
    
    if (!meal) {
      return NextResponse.json(
        { error: 'No meals found matching your filters' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(meal);
  } catch (error) {
    console.error('Error fetching random meal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}