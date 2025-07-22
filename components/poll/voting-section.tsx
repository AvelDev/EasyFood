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
import {
  calculateVoteCounts,
  getVoteDetails,
  getVotersByRestaurant,
  normalizeRestaurantOptions,
  getRestaurantName,
} from "@/lib/firestore";

interface VotingSectionProps {
  poll: Poll;
  canVote: boolean;
  userVote: Vote | null;
  votes: Vote[];
  onVote: (restaurants: string[]) => Promise<void>; // Changed to accept array of restaurants
  voting: boolean;
  userId?: string;
  userName?: string;
  userRole?: "admin" | "user";
}

export default function VotingSection({
  poll,
  canVote,
  userVote,
  votes,
  onVote,
  voting,
  userId,
  userName,
  userRole,
}: VotingSectionProps) {
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(
    userVote?.restaurants || [],
  );

  // Normalize restaurant options for consistent handling
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);
  const restaurantNames = normalizedOptions.map((option: any) => option.name);

  // Voting proposals hook
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
    pollId: poll.id,
    userId,
    userName,
    userRole,
  });

  // Update selected restaurants when userVote changes
  useEffect(() => {
    setSelectedRestaurants(userVote?.restaurants || []);
  }, [userVote?.restaurants]);

  const voteCounts = calculateVoteCounts(votes);
  const voteDetails = getVoteDetails(votes);
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

  const handleVote = async () => {
    if (selectedRestaurants.length === 0) return;
    await onVote(selectedRestaurants);
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
                              className="flex items-center mt-1 text-xs text-blue-600 hover:text-blue-800 gap-1"
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
                  onClick={handleVote}
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
              voteDetails={voteDetails}
              votersByRestaurant={votersByRestaurant}
            />
          )}
        </CardContent>
      </Card>

      {/* Propose new option form - only for authenticated users during active voting */}
      {canVote && userId && userName && (
        <ProposeOptionForm
          onSubmit={submitProposal}
          submitting={submitting}
          existingOptions={restaurantNames}
          userProposals={userProposals}
        />
      )}

      {/* Admin management panel - only for admins */}
      {userRole === "admin" && proposals.length > 0 && (
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
  voteDetails: Array<{
    userId: string;
    userName: string;
    restaurants: string[];
  }>;
  votersByRestaurant: Record<string, string[]>;
}

function VotingResults({
  poll,
  userVote,
  voteCounts,
  voteDetails,
  votersByRestaurant,
}: VotingResultsProps) {
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);
  const userVotedRestaurants = userVote?.restaurants || [];

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {/* Voting summary */}
        <div className="p-3 border rounded-lg bg-slate-50 border-slate-200">
          <h4 className="mb-2 font-medium text-slate-800">
            Podsumowanie głosowania:
          </h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Łączna liczba osób głosujących: {voteDetails.length}</p>
            <p>
              Łączna liczba oddanych głosów:{" "}
              {Object.values(voteCounts).reduce((sum, count) => sum + count, 0)}
            </p>
            {voteDetails.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Szczegóły głosowania:</p>
                <div className="mt-1 overflow-y-auto max-h-32 space-y-1">
                  {voteDetails.map((detail, index) => (
                    <div
                      key={detail.userId}
                      className="p-2 text-xs bg-white border rounded"
                    >
                      <span className="font-medium">{detail.userName}:</span>{" "}
                      {detail.restaurants.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Restaurant results */}
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
                        className="flex items-center mt-1 text-xs text-blue-600 hover:text-blue-800 gap-1"
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

                {/* Lista użytkowników którzy głosowali na tę restaurację */}
                {votersByRestaurant[option.name] &&
                  votersByRestaurant[option.name].length > 0 && (
                    <div className="pt-3 mt-3 border-t border-slate-200">
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        Głosowali ({votersByRestaurant[option.name].length}):
                      </p>
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
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
}
