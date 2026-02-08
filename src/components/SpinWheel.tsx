'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Utensils, Pizza, Sandwich, Cookie, Apple } from 'lucide-react';
import { Meal } from '@/lib/db';

interface SpinWheelProps {
  isSpinning: boolean;
  onSpin: () => void;
  meal: Meal | null;
}

const wheelIcons = [ChefHat, Utensils, Pizza, Sandwich, Cookie, Apple, ChefHat, Utensils];
const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#6366f1', '#f97316'];

export default function SpinWheel({ isSpinning, onSpin, meal }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  
  useEffect(() => {
    if (isSpinning) {
      // Set a fixed random target when spinning starts
      setTargetRotation(rotation + 1440 + Math.floor(Math.random() * 360));
    }
  }, [isSpinning]);

  useEffect(() => {
    if (!isSpinning && targetRotation > 0) {
      setRotation(targetRotation % 360);
    }
  }, [isSpinning, targetRotation]);

  const segmentCount = 8;
  const segmentAngle = 360 / segmentCount;

  return (
    <div className="flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative mb-8">
        {/* Pointer - points DOWN at the wheel */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <motion.div
          className="w-72 h-72 sm:w-80 sm:h-80 rounded-full relative shadow-2xl border-8 border-yellow-400"
          style={{ background: 'conic-gradient(from 0deg, ' + colors.map((c, i) => `${c} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ') + ')' }}
          animate={{
            rotate: isSpinning ? targetRotation : rotation,
          }}
          transition={{
            duration: isSpinning ? 3 : 0,
            ease: [0.2, 0.8, 0.3, 1],
          }}
        >
          {/* Icons on segments */}
          {wheelIcons.map((Icon, index) => {
            const angle = segmentAngle * index + segmentAngle / 2;
            const radians = (angle - 90) * (Math.PI / 180);
            const radius = 90;
            const x = Math.cos(radians) * radius;
            const y = Math.sin(radians) * radius;
            
            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md" />
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-full border-4 border-yellow-400 flex items-center justify-center z-10 shadow-lg">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
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
            Prep: {meal.prep_time} mins • Cook: {meal.cook_time} mins • Total: {meal.prep_time + meal.cook_time} mins
          </p>
        </motion.div>
      )}
    </div>
  );
}