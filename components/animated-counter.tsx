'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
  showPulse?: boolean;
}

export default function AnimatedCounter({ 
  value, 
  className = '', 
  suffix = '',
  showPulse = true 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [key, setKey] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setKey(prev => prev + 1);
      setDisplayValue(value);
      setHasChanged(true);
      
      // Reset pulse effect after animation
      setTimeout(() => setHasChanged(false), 600);
    }
  }, [value, displayValue]);

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={key}
          initial={{ y: 15, opacity: 0, scale: 0.8 }}
          animate={{ 
            y: 0, 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ y: -15, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 20,
            duration: 0.4
          }}
          className={`block ${hasChanged && showPulse ? 'animate-pulse' : ''}`}
          style={{
            filter: hasChanged ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
          }}
        >
          {displayValue}{suffix}
        </motion.span>
      </AnimatePresence>
      
      {/* Floating effect when value changes */}
      {hasChanged && (
        <motion.div
          initial={{ y: 0, opacity: 0.7, scale: 1 }}
          animate={{ y: -20, opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 text-blue-500 font-bold pointer-events-none"
        >
          +1
        </motion.div>
      )}
    </div>
  );
}
