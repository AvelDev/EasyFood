"use client";

import { useState, useEffect } from "react";
import { Poll, Vote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/animated-counter";
import ProposeOptionForm from "@/components/propose-option-form";
import AdminProposalsManagement from "@/components/admin-proposals-management";
import { useVotingProposals } from "@/hooks/use-voting-proposals";
import { usePollContext } from "@/contexts/poll-context";
import {
  calculateVoteCounts,
  getVotersByRestaurant,
  normalizeRestaurantOptions,
  getRestaurantName,
} from "@/lib/firestore";

export default function VotingSection() {
  const { poll, canVote, userVote, votes, handleVote, voting, user } =
    usePollContext();

  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  // Voting proposals hook - must be called unconditionally
  const {
    proposals,
    userProposals,
    pendingProposals,
    submitting,
    submitProposal,
    approveProposal,
    rejectProposal,
    deleteProposal,
  } = useVotingProposals({
    pollId: poll?.id || "",
    userId: user?.uid,
    userName: user?.displayName || user?.email || "Użytkownik",
    userRole: user?.role,
  });

  // Update selected restaurants when userVote changes
  useEffect(() => {
    setSelectedRestaurants(userVote?.restaurants || []);
  }, [userVote?.restaurants]);

  if (!poll) return null;

  // Normalize restaurant options for consistent handling
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);
  const restaurantNames = normalizedOptions.map((option: any) => option.name);

  const voteCounts = calculateVoteCounts(votes);
  const votersByRestaurant = getVotersByRestaurant(votes);

  const handleRestaurantToggle = (restaurantName: string) => {
    setSelectedRestaurants((prev) => {
      if (prev.includes(restaurantName)) {
        // Remove if already selected
        return prev.filter((name) => name !== restaurantName);
      } else {
        // Add if not selected
        return [...prev, restaurantName];
      }
    });
  };

  const handleVoteClick = async () => {
    // Always call handleVote, even if no restaurants selected (for deletion)
    await handleVote(selectedRestaurants);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Opcje restauracji
            {poll.selectedRestaurant && (
              <Badge className="text-green-700 bg-green-100">
                Zwycięzca: {poll.selectedRestaurant}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canVote ? (
            <div className="space-y-4">
              {userVote &&
                userVote.restaurants &&
                userVote.restaurants.length > 0 && (
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-700">
                      <strong>Aktualne głosy:</strong>{" "}
                      {userVote.restaurants.join(", ")}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      Możesz zmienić swoje głosy wybierając inne opcje poniżej.
                      Możesz głosować na kilka restauracji.
                    </p>
                  </div>
                )}
              <div className="space-y-3">
                {normalizedOptions.map((option: any, index: number) => (
                  <motion.div
                    key={option.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleRestaurantToggle(option.name)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedRestaurants.includes(option.name)
                        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md"
                    }`}
                    whileHover={{
                      scale: selectedRestaurants.includes(option.name)
                        ? 1.02
                        : 1.01,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Checkbox indicator for multiple selection */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedRestaurants.includes(option.name)
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selectedRestaurants.includes(option.name) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                              className="w-2 h-2 bg-white rounded-sm"
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {option.name}
                          </span>
                          {option.url && (
                            <a
                              href={option.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Zobacz menu
                            </a>
                          )}
                        </div>
                      </div>

                      {selectedRestaurants.includes(option.name) && (
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
                  onClick={handleVoteClick}
                  disabled={voting}
                  className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                    userVote && selectedRestaurants.length === 0
                      ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  }`}
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
                        className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                      />
                      {userVote ? "Aktualizowanie..." : "Głosowanie..."}
                    </div>
                  ) : userVote ? (
                    selectedRestaurants.length === 0 ? (
                      "Usuń głos"
                    ) : (
                      `Zmień głos${
                        selectedRestaurants.length > 1 ? "y" : ""
                      } (${selectedRestaurants.length} wybrane)`
                    )
                  ) : selectedRestaurants.length === 0 ? (
                    "Wybierz restauracje do głosowania"
                  ) : (
                    `Oddaj głos${selectedRestaurants.length > 1 ? "y" : ""} (${
                      selectedRestaurants.length
                    } wybrane)`
                  )}
                </Button>
              </motion.div>
            </div>
          ) : (
            <VotingResults
              poll={poll}
              userVote={userVote}
              voteCounts={voteCounts}
              votersByRestaurant={votersByRestaurant}
            />
          )}
        </CardContent>
      </Card>

      {/* Propose new option form - only for authenticated users during active voting */}
      {canVote && user?.uid && (user?.displayName || user?.email) && (
        <ProposeOptionForm
          onSubmit={submitProposal}
          submitting={submitting}
          existingOptions={restaurantNames}
          userProposals={userProposals}
        />
      )}

      {/* Admin management panel - only for admins */}
      {user?.role === "admin" && proposals.length > 0 && (
        <AdminProposalsManagement
          proposals={proposals}
          onApprove={approveProposal}
          onReject={rejectProposal}
          onDelete={deleteProposal}
        />
      )}
    </div>
  );
}

interface VotingResultsProps {
  poll: Poll;
  userVote: Vote | null;
  voteCounts: Record<string, number>;
  votersByRestaurant: Record<string, string[]>;
}

function VotingResults({
  poll,
  userVote,
  voteCounts,
  votersByRestaurant,
}: VotingResultsProps) {
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);
  const userVotedRestaurants = userVote?.restaurants || [];

  return (
    <AnimatePresence>
      <div className="space-y-3">
        {normalizedOptions.map((option: any, index: number) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              poll.selectedRestaurant === option.name
                ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                : userVotedRestaurants.includes(option.name)
                ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{option.name}</span>
                  {option.url && (
                    <a
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Zobacz menu
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="relative">
                    <AnimatedCounter
                      value={voteCounts[option.name] || 0}
                      suffix=" głosów"
                      className="font-semibold"
                    />
                  </Badge>

                  <AnimatePresence>
                    {poll.selectedRestaurant === option.name && (
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

                  {userVotedRestaurants.includes(option.name) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        delay: 0.2,
                      }}
                    >
                      <Badge className="text-blue-700 bg-blue-100">
                        Twój głos
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
