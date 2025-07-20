'use client';

import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
  showPulse?: boolean;
}

const AnimatedCounter = memo(function AnimatedCounter({ 
  value, 
  className = '', 
  suffix = '',
  showPulse = true 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value);
      
      if (showPulse) {
        setHasChanged(true);
        
        // Reset pulse effect after a brief moment
        const timer = setTimeout(() => setHasChanged(false), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [value, displayValue, showPulse]);

  return (
    <span className={`inline-block transition-all duration-200 ${className} ${
      hasChanged && showPulse ? 'text-blue-600 font-semibold' : ''
    }`}>
      <motion.span
        key={displayValue} // Only animate when value actually changes
        initial={showPulse ? { scale: 1.1 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {displayValue}{suffix}
      </motion.span>
    </span>
  );
});

export default AnimatedCounter;
