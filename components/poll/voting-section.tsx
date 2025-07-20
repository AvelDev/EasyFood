"use client";

import { useState } from "react";
import { Poll, Vote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/animated-counter";

interface VotingSectionProps {
  poll: Poll;
  canVote: boolean;
  userVote: Vote | null;
  votes: Vote[];
  onVote: (restaurant: string) => Promise<void>;
  voting: boolean;
}

export default function VotingSection({
  poll,
  canVote,
  userVote,
  votes,
  onVote,
  voting,
}: VotingSectionProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(
    userVote?.restaurant || ""
  );

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleVote = async () => {
    if (!selectedRestaurant) return;
    await onVote(selectedRestaurant);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Opcje restauracji
          {poll.selectedRestaurant && (
            <Badge className="bg-green-100 text-green-700">
              Zwycięzca: {poll.selectedRestaurant}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {canVote ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {poll.restaurantOptions.map((restaurant, index) => (
                <motion.div
                  key={restaurant}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedRestaurant === restaurant
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md"
                  }`}
                  whileHover={{
                    scale: selectedRestaurant === restaurant ? 1.02 : 1.01,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Custom radio indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedRestaurant === restaurant
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selectedRestaurant === restaurant && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                      <span className="font-medium text-slate-800">
                        {restaurant}
                      </span>
                    </div>

                    {selectedRestaurant === restaurant && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="text-blue-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleVote}
                disabled={!selectedRestaurant || voting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {voting ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Głosowanie...
                  </div>
                ) : (
                  "Oddaj głos"
                )}
              </Button>
            </motion.div>
          </div>
        ) : (
          <VotingResults
            poll={poll}
            userVote={userVote}
            voteCounts={voteCounts}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface VotingResultsProps {
  poll: Poll;
  userVote: Vote | null;
  voteCounts: Record<string, number>;
}

function VotingResults({ poll, userVote, voteCounts }: VotingResultsProps) {
  return (
    <AnimatePresence>
      <div className="space-y-3">
        {poll.restaurantOptions.map((restaurant, index) => (
          <motion.div
            key={restaurant}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              poll.selectedRestaurant === restaurant
                ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                : userVote?.restaurant === restaurant
                ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{restaurant}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="relative">
                  <AnimatedCounter
                    value={voteCounts[restaurant] || 0}
                    suffix=" głosów"
                    className="font-semibold"
                  />
                </Badge>

                <AnimatePresence>
                  {poll.selectedRestaurant === restaurant && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {userVote?.restaurant === restaurant && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      delay: 0.2,
                    }}
                  >
                    <Badge className="bg-blue-100 text-blue-700">
                      Twój głos
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
