'use client';

import { useState } from 'react';
import SpinWheel from '@/components/SpinWheel';
import FiltersPanel from '@/components/FiltersPanel';
import MealCard from '@/components/MealCard';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import { ChefHat, Calendar, Heart, Settings } from 'lucide-react';
import { Meal } from '@/lib/db';

interface Filters {
  maxPrepTime: number;
  pickyEaterFriendly: boolean;
  excludeAllergens: string[];
  category: string;
}

export default function Home() {
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showWeeklyPlanner, setShowWeeklyPlanner] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filters, setFilters] = useState<Filters>({
    maxPrepTime: 60,
    pickyEaterFriendly: false,
    excludeAllergens: [],
    category: 'all'
  });

  const handleSpin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setCurrentMeal(null);
    
    try {
      const response = await fetch('/api/meals/random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (response.ok) {
        const meal = await response.json();
        // Simulate spinning delay
        setTimeout(() => {
          setCurrentMeal(meal);
          setIsSpinning(false);
        }, 2000);
      } else {
        setIsSpinning(false);
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
      setIsSpinning(false);
    }
  };

  const toggleFavorite = (mealId: number) => {
    setFavorites(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              MealSpin
            </h1>
          </div>
          <p className="text-gray-300 max-w-md mx-auto">
            Spin the wheel to discover delicious, kid-friendly meals!
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
          >
            <Settings className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setShowWeeklyPlanner(!showWeeklyPlanner)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Weekly Plan
          </button>
          <button
            onClick={() => {/* TODO: Show favorites */}}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-full transition-colors"
          >
            <Heart className="w-4 h-4" />
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <FiltersPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Weekly Planner */}
        {showWeeklyPlanner && (
          <WeeklyPlanner 
            onClose={() => setShowWeeklyPlanner(false)}
          />
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Spin Wheel */}
          <div className="mb-8">
            <SpinWheel 
              isSpinning={isSpinning}
              onSpin={handleSpin}
              meal={currentMeal}
            />
          </div>

          {/* Meal Result */}
          {currentMeal && (
            <MealCard 
              meal={currentMeal}
              isFavorite={favorites.includes(currentMeal.id)}
              onToggleFavorite={() => toggleFavorite(currentMeal.id)}
            />
          )}
        </div>
      </div>
    </main>
  );
}