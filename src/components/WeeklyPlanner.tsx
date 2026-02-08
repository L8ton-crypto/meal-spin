'use client';

import { motion } from 'framer-motion';
import { X, Calendar, Plus } from 'lucide-react';
import { useState } from 'react';

interface WeeklyPlannerProps {
  onClose: () => void;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlanner({ onClose }: WeeklyPlannerProps) {
  const [weekPlan, setWeekPlan] = useState<{ [key: string]: string }>({});

  const addMealToDay = (day: string, meal: string) => {
    setWeekPlan(prev => ({ ...prev, [day]: meal }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Weekly Meal Planner
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-400 mt-2">Plan your meals for the week ahead</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {days.map(day => (
              <div key={day} className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center justify-between">
                  {day}
                  <button
                    onClick={() => addMealToDay(day, 'Sample Meal')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </h4>
                
                {weekPlan[day] ? (
                  <div className="bg-blue-600 rounded p-2 text-white text-sm">
                    {weekPlan[day]}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-500 rounded p-2 text-center text-gray-400 text-sm">
                    No meal planned
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Save Plan
            </button>
            <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Share as Image
            </button>
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Export Link
            </button>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-6 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
            <p className="text-yellow-200 text-sm text-center">
              🚧 Weekly planning features are coming soon! You'll be able to drag meals from your spins, save meal plans, and share them with family.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}