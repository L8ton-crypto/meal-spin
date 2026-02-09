'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Users, ChefHat, AlertTriangle } from 'lucide-react';
import { Meal } from '@/lib/db';

interface MealCardProps {
  meal: Meal;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function MealCard({ meal, isFavorite, onToggleFavorite }: MealCardProps) {
  const allergenEmojis: { [key: string]: string } = {
    dairy: '🥛',
    gluten: '🌾', 
    nuts: '🥜',
    eggs: '🥚'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden max-w-4xl mx-auto"
    >
      {/* Hero Image */}
      {meal.image_url && (
        <div className="relative h-48 sm:h-56 bg-gray-700">
          <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{meal.name}</h2>
            <p className="text-purple-100">{meal.description}</p>
          </div>
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Meal Info */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-1 text-purple-100">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Prep: {meal.prep_time} min</span>
          </div>
          <div className="flex items-center gap-1 text-purple-100">
            <ChefHat className="w-4 h-4" />
            <span className="text-sm">Cook: {meal.cook_time} min</span>
          </div>
          <div className="flex items-center gap-1 text-purple-100">
            <Users className="w-4 h-4" />
            <span className="text-sm">Serves: {meal.servings}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {meal.is_picky_eater_friendly && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Kid Friendly
            </span>
          )}
          {meal.allergens.map(allergen => (
            <span key={allergen} className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Contains {allergen}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              📝 Ingredients
            </h3>
            <ul className="space-y-2">
              {meal.ingredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex justify-between text-gray-300 text-sm">
                  <span>{ingredient.item}</span>
                  <span className="text-yellow-400 font-medium">{ingredient.amount}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              👨‍🍳 Instructions
            </h3>
            <ol className="space-y-2">
              {meal.steps.map((step: string, index: number) => (
                <li key={index} className="flex gap-3 text-gray-300 text-sm">
                  <span className="bg-yellow-400 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Nutrition */}
        {meal.nutrition && Object.keys(meal.nutrition).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              📊 Nutrition (per serving)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(meal.nutrition).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-yellow-400 font-bold text-lg">{value as string}</div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">
                    {key === 'carbs' ? 'Carbs' : key}
                    {key !== 'calories' && 'g'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}