"use client";

import { useMemo } from "react";
import { Poll, Vote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedCounter from "@/components/animated-counter";
import AnimatedProgressBar from "@/components/animated-progress-bar";

interface ResultsSectionProps {
  poll: Poll;
  votes: Vote[];
}

export default function ResultsSection({ poll, votes }: ResultsSectionProps) {
  const router = useRouter();

  const voteCounts = useMemo(() => {
    return votes.reduce((acc, vote) => {
      acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [votes]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Wyniki głosowania</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poll.restaurantOptions.map((restaurant, index) => {
            const count = voteCounts[restaurant] || 0;
            const percentage =
              votes.length > 0 ? (count / votes.length) * 100 : 0;
            const isWinner = poll.selectedRestaurant === restaurant;

            return (
              <motion.div
                key={restaurant}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        isWinner ? "text-green-700" : ""
                      }`}
                    >
                      {restaurant}
                    </span>
                    {isWinner && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          delay: 0.5,
                        }}
                      >
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-1">
                    <AnimatedCounter
                      value={count}
                      suffix=" głosów"
                      className="font-semibold"
                    />
                    <span>
                      (
                      <AnimatedCounter
                        value={Math.round(percentage * 10) / 10}
                        suffix="%"
                      />
                      )
                    </span>
                  </div>
                </div>

                <AnimatedProgressBar
                  percentage={percentage}
                  isWinner={isWinner}
                  color={
                    isWinner
                      ? "from-green-500 to-emerald-500"
                      : "from-blue-500 to-purple-500"
                  }
                />
              </motion.div>
            );
          })}
        </div>

        {poll.closed && (
          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={() => router.push(`/poll/${poll.id}/orders`)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              Zobacz zamówienia
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
