"use client";

import { motion } from "framer-motion";

interface AnimatedProgressBarProps {
  percentage: number;
  className?: string;
  color?: string;
  isWinner?: boolean;
}

export default function AnimatedProgressBar({
  percentage,
  className = "",
  color = "from-blue-500 to-purple-500",
  isWinner = false,
}: AnimatedProgressBarProps) {
  return (
    <div
      className={`w-full bg-slate-200 rounded-full h-3 overflow-hidden ${className}`}
    >
      <motion.div
        className={`h-full bg-gradient-to-r ${color} rounded-full relative ${
          isWinner ? "shadow-lg shadow-green-300" : ""
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.1,
        }}
      >
        {isWinner && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />
        )}

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      </motion.div>
    </div>
  );
}
