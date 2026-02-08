'use client';

import { motion } from 'framer-motion';
import { X, Clock, Users, AlertTriangle, Utensils } from 'lucide-react';

interface Filters {
  maxPrepTime: number;
  pickyEaterFriendly: boolean;
  excludeAllergens: string[];
  category: string;
}

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

const allergens = [
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
];

const prepTimeOptions = [
  { value: 15, label: '15 mins or less' },
  { value: 30, label: '30 mins or less' },
  { value: 45, label: '45 mins or less' },
  { value: 60, label: '60 mins or less' },
];

const categoryOptions = [
  { value: 'all', label: 'All', icon: '🍽️' },
  { value: 'main', label: 'Mains', icon: '🍝' },
  { value: 'snack', label: 'Snacks', icon: '🥪' },
  { value: 'dessert', label: 'Desserts', icon: '🍰' },
  { value: 'breakfast', label: 'Breakfast', icon: '🥞' },
];

export default function FiltersPanel({ filters, onFiltersChange, onClose }: FiltersPanelProps) {
  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleAllergen = (allergen: string) => {
    const excludeAllergens = filters.excludeAllergens.includes(allergen)
      ? filters.excludeAllergens.filter(a => a !== allergen)
      : [...filters.excludeAllergens, allergen];
    
    updateFilters({ excludeAllergens });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Meal Filters
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Utensils className="w-4 h-4" />
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(option => (
              <button
                key={option.value}
                onClick={() => updateFilters({ category: option.value })}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.category === option.value
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prep Time */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Clock className="w-4 h-4" />
            Total Time
          </label>
          <div className="space-y-2">
            {prepTimeOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="prepTime"
                  value={option.value}
                  checked={filters.maxPrepTime === option.value}
                  onChange={() => updateFilters({ maxPrepTime: option.value })}
                  className="text-yellow-400 focus:ring-yellow-400 focus:ring-2"
                />
                <span className="text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Picky Eater Mode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Users className="w-4 h-4" />
            Preferences
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.pickyEaterFriendly}
              onChange={(e) => updateFilters({ pickyEaterFriendly: e.target.checked })}
              className="rounded text-yellow-400 focus:ring-yellow-400 focus:ring-2"
            />
            <span className="text-gray-300">Picky eater friendly only</span>
          </label>
        </div>

        {/* Allergens */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Avoid Allergens
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allergens.map(allergen => (
              <label key={allergen.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.excludeAllergens.includes(allergen.id)}
                  onChange={() => toggleAllergen(allergen.id)}
                  className="rounded text-yellow-400 focus:ring-yellow-400 focus:ring-2"
                />
                <span className="text-gray-300 text-sm">
                  {allergen.icon} {allergen.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.excludeAllergens.length > 0 || filters.pickyEaterFriendly || filters.maxPrepTime < 45 || (filters.category && filters.category !== 'all')) && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== 'all' && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                {categoryOptions.find(c => c.value === filters.category)?.icon} {categoryOptions.find(c => c.value === filters.category)?.label}
              </span>
            )}
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              ≤ {filters.maxPrepTime} mins total
            </span>
            {filters.pickyEaterFriendly && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                Picky eater friendly
              </span>
            )}
            {filters.excludeAllergens.map(allergen => {
              const allergenData = allergens.find(a => a.id === allergen);
              return allergenData ? (
                <span key={allergen} className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                  No {allergenData.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}