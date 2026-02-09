'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Search, Clock, Users, Heart, ArrowLeft, SlidersHorizontal, X, Utensils, AlertTriangle, Grid3X3, List } from 'lucide-react';
import Link from 'next/link';
import { Meal } from '@/lib/db';

const categoryOptions = [
  { value: 'all', label: 'All', icon: '🍽️' },
  { value: 'main', label: 'Mains', icon: '🍝' },
  { value: 'snack', label: 'Snacks', icon: '🥪' },
  { value: 'dessert', label: 'Desserts', icon: '🍰' },
  { value: 'breakfast', label: 'Breakfast', icon: '🥞' },
];

const sortOptions = [
  { value: 'name', label: 'A-Z' },
  { value: 'time', label: 'Quickest' },
  { value: 'newest', label: 'Newest' },
];

const allergens = [
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
];

export default function RecipesPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [pickyOnly, setPickyOnly] = useState(false);
  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mealspin-favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('mealspin-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch meals
  useEffect(() => {
    fetchMeals();
  }, [category, sort, pickyOnly, excludeAllergens]);

  async function fetchMeals() {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    params.set('sort', sort);
    if (pickyOnly) params.set('pickyEaterFriendly', 'true');
    if (excludeAllergens.length > 0) params.set('excludeAllergens', excludeAllergens.join(','));
    
    try {
      const res = await fetch(`/api/meals?${params}`);
      const data = await res.json();
      setMeals(data);
    } catch (e) {
      console.error('Failed to fetch meals:', e);
    }
    setLoading(false);
  }

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search) return meals;
    const q = search.toLowerCase();
    return meals.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q) ||
      m.ingredients?.some((i: any) => i.item?.toLowerCase().includes(q))
    );
  }, [meals, search]);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const toggleAllergen = (id: string) => {
    setExcludeAllergens(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Spinner</span>
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-yellow-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Recipe Book
            </h1>
          </div>
          <div className="text-gray-400 text-sm">
            {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search + Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort + Filter + View toggles */}
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 focus:outline-none focus:border-purple-500 text-sm"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                showFilters || pickyOnly || excludeAllergens.length > 0
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(pickyOnly || excludeAllergens.length > 0) && (
                <span className="bg-yellow-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {(pickyOnly ? 1 : 0) + excludeAllergens.length}
                </span>
              )}
            </button>

            <div className="flex bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryOptions.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.value
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Users className="w-4 h-4" /> Preferences
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                      <input
                        type="checkbox"
                        checked={pickyOnly}
                        onChange={(e) => setPickyOnly(e.target.checked)}
                        className="rounded text-yellow-400 focus:ring-yellow-400"
                      />
                      Picky eater friendly
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Exclude Allergens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allergens.map(a => (
                        <button
                          key={a.id}
                          onClick={() => toggleAllergen(a.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            excludeAllergens.includes(a.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {a.icon} {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Utensils className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No recipes found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search</p>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setSelectedMeal(meal)}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-700 overflow-hidden">
                  {meal.image_url ? (
                    <img
                      src={meal.image_url}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {/* Favorite button */}
                  <button
                    onClick={(e) => toggleFavorite(meal.id, e)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                      favorites.includes(meal.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-black/50 text-white/70 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(meal.id) ? 'fill-current' : ''}`} />
                  </button>
                  {/* Category badge */}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full capitalize">
                    {meal.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{meal.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-2">{meal.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.prep_time + meal.cook_time} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meal.servings}
                    </span>
                    {meal.is_picky_eater_friendly && (
                      <span className="text-green-400">✓ Kid friendly</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === 'list' && (
          <div className="space-y-2">
            {filtered.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                onClick={() => setSelectedMeal(meal)}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden cursor-pointer hover:border-purple-500 transition-all flex"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-28 sm:h-24 flex-shrink-0 bg-gray-700 overflow-hidden">
                  {meal.image_url ? (
                    <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-3 flex items-center justify-between min-w-0">
                  <div className="min-w-0 mr-3">
                    <h3 className="font-semibold text-white text-sm truncate">{meal.name}</h3>
                    <p className="text-gray-400 text-xs truncate">{meal.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.prep_time + meal.cook_time} min
                      </span>
                      <span className="capitalize">{meal.category}</span>
                      {meal.is_picky_eater_friendly && (
                        <span className="text-green-400">✓ Kid friendly</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(meal.id, e)}
                    className={`p-2 rounded-full flex-shrink-0 transition-colors ${
                      favorites.includes(meal.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(meal.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedMeal && (
          <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} isFavorite={favorites.includes(selectedMeal.id)} onToggleFavorite={() => toggleFavorite(selectedMeal.id)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function RecipeModal({ meal, onClose, isFavorite, onToggleFavorite }: { meal: Meal; onClose: () => void; isFavorite: boolean; onToggleFavorite: () => void }) {
  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4 pt-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl overflow-hidden mb-8"
      >
        {/* Hero Image */}
        {meal.image_url && (
          <div className="relative h-48 sm:h-64 bg-gray-700">
            <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/90 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-1">{meal.name}</h2>
              <p className="text-gray-300 text-sm">{meal.description}</p>
            </div>
          </div>
        )}

        {/* Non-image header fallback */}
        {!meal.image_url && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-1">{meal.name}</h2>
            <p className="text-purple-100 text-sm">{meal.description}</p>
          </div>
        )}

        {/* Meta bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-750 border-b border-gray-700">
          <div className="flex flex-wrap gap-3 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              {meal.prep_time + meal.cook_time} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-yellow-400" />
              Serves {meal.servings}
            </span>
            <span className="capitalize px-2 py-0.5 bg-gray-700 rounded-full text-xs">{meal.category}</span>
            {meal.is_picky_eater_friendly && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">Kid Friendly</span>
            )}
          </div>
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Allergens */}
        {meal.allergens && meal.allergens.length > 0 && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-gray-700 flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs font-medium">Contains:</span>
            {meal.allergens.map(a => (
              <span key={a} className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs capitalize">{a}</span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">📝 Ingredients</h3>
            <ul className="space-y-1.5">
              {meal.ingredients?.map((ingredient: any, index: number) => (
                <li key={index} className="flex justify-between text-sm text-gray-300 py-1 border-b border-gray-700/50 last:border-0">
                  <span>{ingredient.item}</span>
                  <span className="text-yellow-400 font-medium ml-4 text-right">{ingredient.amount}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">👨‍🍳 Method</h3>
            <ol className="space-y-3">
              {meal.steps?.map((step: string, index: number) => (
                <li key={index} className="flex gap-3 text-sm text-gray-300">
                  <span className="bg-yellow-400 text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition */}
          {meal.nutrition && Object.keys(meal.nutrition).length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">📊 Nutrition (per serving)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(meal.nutrition).map(([key, value]) => (
                  <div key={key} className="text-center bg-gray-700/50 rounded-lg p-3">
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
    </motion.div>
  );
}
