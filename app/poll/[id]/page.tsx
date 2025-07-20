"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { Poll, Vote } from "@/types";
import {
  getPoll,
  getVotes,
  getUserVote,
  addVote,
  updatePoll,
  subscribeToPoll,
  subscribeToVotes,
} from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Users, CheckCircle, Crown } from "lucide-react";
import AnimatedCounter from "@/components/animated-counter";
import AnimatedProgressBar from "@/components/animated-progress-bar";
import CountdownTimer from "@/components/countdown-timer";
import VotingStatus from "@/components/voting-status";
import DeletePollDialog from "@/components/delete-poll-dialog";
import { pollAutoCloser } from "@/lib/poll-auto-closer";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface PollPageProps {
  params: {
    id: string;
  };
}

export default function PollPage({ params }: PollPageProps) {
  const { user, loading: authLoading, isProtected } = usePrivacyProtection();
  const router = useRouter();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!user?.uid || !params.id) return;

    setLoading(true);

    // Set up real-time poll listener
    const unsubscribePoll = subscribeToPoll(params.id, (pollData) => {
      if (pollData === null) {
        // Głosowanie zostało usunięte
        toast({
          title: "Głosowanie usunięte",
          description: "To głosowanie zostało usunięte przez administratora.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      setPoll(pollData);

      // Schedule auto-close for active polls
      if (pollData && !pollData.closed) {
        pollAutoCloser.schedulePollClosure(
          pollData.id,
          pollData.votingEndsAt,
          () => {
            // This callback will be called when poll is auto-closed
            console.log("Poll was automatically closed by timer");
          }
        );
      }
    });

    // Set up real-time votes listener
    const unsubscribeVotes = subscribeToVotes(params.id, (votesData) => {
      setVotes(votesData);
      setLoading(false);
    });

    // Get initial user vote
    const fetchUserVote = async () => {
      try {
        const userVoteData = await getUserVote(params.id, user.uid);
        setUserVote(userVoteData);
        if (userVoteData) {
          setSelectedRestaurant(userVoteData.restaurant);
        }
      } catch (error) {
        console.error("Error fetching user vote:", error);
      }
    };

    fetchUserVote();

    // Cleanup function
    return () => {
      unsubscribePoll();
      unsubscribeVotes();
      // Cancel auto-close timer when component unmounts
      pollAutoCloser.cancelPollClosure(params.id);
    };
  }, [params.id, user?.uid, router, toast]);

  const handleVote = async () => {
    if (!user?.uid || !poll || !selectedRestaurant) return;

    setVoting(true);
    try {
      const voteData: Vote = {
        userId: user.uid,
        restaurant: selectedRestaurant,
        createdAt: new Date(),
      };

      await addVote(params.id, voteData);
      setUserVote(voteData);

      // Votes will be updated automatically via the real-time listener
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!poll || user?.role !== "admin") return;

    try {
      await closePollAutomatically();
    } catch (error) {
      console.error("Error closing poll:", error);
    }
  };

  const closePollAutomatically = useCallback(async () => {
    if (!poll) return;

    try {
      // Calculate the winner
      const voteCounts = votes.reduce((acc, vote) => {
        acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const winner = Object.entries(voteCounts).reduce((a, b) =>
        voteCounts[a[0]] > voteCounts[b[0]] ? a : b
      )[0];

      await updatePoll(params.id, {
        closed: true,
        selectedRestaurant: winner,
      });

      setPoll({ ...poll, closed: true, selectedRestaurant: winner });
    } catch (error) {
      console.error("Error closing poll automatically:", error);
    }
  }, [poll, votes, params.id]);

  const handleTimeExpired = useCallback(() => {
    // Auto-close poll when countdown reaches zero
    if (!poll?.closed) {
      closePollAutomatically();
    }
  }, [poll?.closed, closePollAutomatically]);

  // Memoized calculations
  const voteCounts = useMemo(() => {
    return votes.reduce((acc, vote) => {
      acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [votes]);

  const isActive = poll
    ? !poll.closed && poll.votingEndsAt > new Date()
    : false;
  const canVote = poll ? isActive && !userVote : false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-600 mb-4">
          Głosowanie nie zostało znalezione
        </h2>
        <Button onClick={() => router.push("/")}>
          Powrót do strony głównej
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-slate-600"
        >
          ← Powrót do głosowań
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {poll.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-600">
              <div className="flex items-center gap-4">
                {isActive ? (
                  <CountdownTimer
                    endTime={poll.votingEndsAt}
                    onTimeExpired={handleTimeExpired}
                    className="font-medium"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Kończy się {poll.votingEndsAt.toLocaleDateString("pl-PL")}{" "}
                      o{" "}
                      {poll.votingEndsAt.toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <AnimatedCounter
                    value={votes.length}
                    suffix=" głosów"
                    className="font-medium"
                  />
                </div>
              </div>
              {poll.orderingEndsAt && poll.orderingEndsAt instanceof Date && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Zamówienia do{" "}
                    {poll.orderingEndsAt.toLocaleDateString("pl-PL")} o{" "}
                    {poll.orderingEndsAt.toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VotingStatus
              poll={poll}
              onTimeExpired={handleTimeExpired}
              className="flex items-center gap-2"
            />

            {user?.role === "admin" && (
              <div className="flex items-center gap-2">
                {isActive && (
                  <Button variant="outline" size="sm" onClick={handleClosePoll}>
                    Zamknij głosowanie
                  </Button>
                )}
                <DeletePollDialog
                  poll={poll}
                  onPollDeleted={() => router.push("/")}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
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
            )}
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
