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
import { normalizeRestaurantOptions, getRestaurantName } from "@/lib/firestore";

interface VotingSectionProps {
  poll: Poll;
  canVote: boolean;
  userVote: Vote | null;
  votes: Vote[];
  onVote: (restaurant: string) => Promise<void>;
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
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(
    userVote?.restaurant || ""
  );

  // Normalize restaurant options for consistent handling
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);
  const restaurantNames = normalizedOptions.map((option) => option.name);

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

  // Update selected restaurant when userVote changes
  useEffect(() => {
    setSelectedRestaurant(userVote?.restaurant || "");
  }, [userVote?.restaurant]);

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleVote = async () => {
    if (!selectedRestaurant) return;
    await onVote(selectedRestaurant);
  };

  return (
    <div className="space-y-6">
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
              {userVote && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Aktualny głos:</strong> {userVote.restaurant}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Możesz zmienić swój głos wybierając inną opcję poniżej
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {normalizedOptions.map((option, index) => (
                  <motion.div
                    key={option.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedRestaurant(option.name)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedRestaurant === option.name
                        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md"
                    }`}
                    whileHover={{
                      scale: selectedRestaurant === option.name ? 1.02 : 1.01,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Custom radio indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedRestaurant === option.name
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selectedRestaurant === option.name && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                              className="w-2 h-2 bg-white rounded-full"
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
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Zobacz menu
                            </a>
                          )}
                        </div>
                      </div>

                      {selectedRestaurant === option.name && (
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
                      {userVote ? "Aktualizowanie..." : "Głosowanie..."}
                    </div>
                  ) : userVote ? (
                    "Zmień głos"
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
}

function VotingResults({ poll, userVote, voteCounts }: VotingResultsProps) {
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);

  return (
    <AnimatePresence>
      <div className="space-y-3">
        {normalizedOptions.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              poll.selectedRestaurant === option.name
                ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                : userVote?.restaurant === option.name
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
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
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

                  {userVote?.restaurant === option.name && (
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
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
