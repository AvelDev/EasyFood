"use client";

import { useMemo } from "react";
import { Poll, Vote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedCounter from "@/components/animated-counter";
import AnimatedProgressBar from "@/components/animated-progress-bar";
import { usePollContext } from "@/contexts/poll-context";
import {
  normalizeRestaurantOptions,
  calculateVoteCounts,
  getVotersByRestaurant,
} from "@/lib/firestore";

export default function ResultsSection() {
  const { poll, votes } = usePollContext();
  const router = useRouter();

  const voteCounts = useMemo(() => {
    return votes ? calculateVoteCounts(votes) : {};
  }, [votes]);

  const totalVotes = useMemo(() => {
    return Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
  }, [voteCounts]);

  const votersByRestaurant = useMemo(() => {
    return votes ? getVotersByRestaurant(votes) : {};
  }, [votes]);

  if (!poll) return null;

  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Wyniki głosowania</CardTitle>
        <div className="space-y-1 text-sm text-slate-600">
          <p>Liczba głosujących: {votes.length}</p>
          <p>Łączna liczba głosów: {totalVotes}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {normalizedOptions.map((option, index) => {
            const count = voteCounts[option.name] || 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isWinner = poll.selectedRestaurant === option.name;

            return (
              <motion.div
                key={option.name}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span
                        className={`font-medium ${
                          isWinner ? "text-green-700" : ""
                        }`}
                      >
                        {option.name}
                      </span>
                      {option.url && (
                        <a
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Zobacz menu
                        </a>
                      )}
                    </div>
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
                  <div className="flex items-center gap-1 text-sm text-slate-600">
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

                {/* Lista użytkowników którzy głosowali na tę restaurację */}
                {votersByRestaurant[option.name] &&
                  votersByRestaurant[option.name].length > 0 && (
                    <div className="pb-3 mt-3">
                      <div className="flex flex-wrap gap-1">
                        {votersByRestaurant[option.name].map(
                          (voterName, voterIndex) => (
                            <Badge
                              key={`${option.name}-${voterIndex}`}
                              variant="secondary"
                              className="px-2 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              {voterName}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </motion.div>
            );
          })}
        </div>

        {poll.closed && (
          <div className="pt-6 mt-6 border-t">
            <Button
              onClick={() => router.push(`/poll/${poll.id}/orders`)}
              className="w-full text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Zobacz zamówienia
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
