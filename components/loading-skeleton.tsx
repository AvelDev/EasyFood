"use client";

import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
        >
          <div className="animate-pulse">
            <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded mb-4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
              <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded w-3/4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
              <div className="h-6 w-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
            </div>
            <div className="h-10 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
