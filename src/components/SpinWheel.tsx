'use client';

import { motion } from 'framer-motion';
import { ChefHat, Utensils, Pizza, Sandwich, Cookie, Apple } from 'lucide-react';
import { Meal } from '@/lib/db';

interface SpinWheelProps {
  isSpinning: boolean;
  onSpin: () => void;
  meal: Meal | null;
}

const wheelIcons = [ChefHat, Utensils, Pizza, Sandwich, Cookie, Apple, ChefHat, Utensils];
const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];

export default function SpinWheel({ isSpinning, onSpin, meal }: SpinWheelProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
        </div>

        {/* Wheel */}
        <motion.div
          className="w-80 h-80 rounded-full relative overflow-hidden shadow-2xl border-8 border-yellow-400"
          animate={{
            rotate: isSpinning ? 1440 + Math.random() * 360 : 0,
          }}
          transition={{
            duration: isSpinning ? 2 : 0,
            ease: "easeOut",
          }}
        >
          {/* Wheel Segments */}
          {wheelIcons.map((Icon, index) => {
            const angle = (360 / wheelIcons.length) * index;
            const nextAngle = (360 / wheelIcons.length) * (index + 1);
            
            return (
              <div
                key={index}
                className={`absolute w-1/2 h-1/2 origin-bottom-right ${colors[index]}`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(0 0, ${Math.cos((nextAngle - angle) * Math.PI / 180) * 100}% ${Math.sin((nextAngle - angle) * Math.PI / 180) * 100}%, 0 100%)`,
                }}
              >
                <Icon 
                  className="absolute w-8 h-8 text-white"
                  style={{
                    top: '30%',
                    left: '30%',
                    transform: `rotate(-${angle}deg)`,
                  }}
                />
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full border-4 border-yellow-400 flex items-center justify-center z-10">
            <ChefHat className="w-6 h-6 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Spin Button */}
      <motion.button
        onClick={onSpin}
        disabled={isSpinning}
        className={`px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-all ${
          isSpinning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900'
        }`}
        whileHover={!isSpinning ? { scale: 1.05 } : {}}
        whileTap={!isSpinning ? { scale: 0.95 } : {}}
      >
        {isSpinning ? (
          <div className="flex items-center gap-2">
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Spinning...
          </div>
        ) : (
          'SPIN THE WHEEL!'
        )}
      </motion.button>

      {/* Result Display */}
      {meal && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            🎉 You got: {meal.name}!
          </h2>
          <p className="text-gray-300">
            Prep time: {meal.prep_time} min • Cook time: {meal.cook_time} min
          </p>
        </motion.div>
      )}
    </div>
  );
}