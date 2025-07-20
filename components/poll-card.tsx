"use client";

import { useMemo } from "react";
import { Poll } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AnimatedCounter from "./animated-counter";
import CountdownTimer from "./countdown-timer";
import VotingStatus from "./voting-status";
import DateDisplay from "./date-display";
import DeletePollDialog from "./delete-poll-dialog";
import { useAuthContext } from "@/contexts/auth-context";

interface PollCardProps {
  poll: Poll;
  onPollDeleted?: () => void;
}

export default function PollCard({ poll, onPollDeleted }: PollCardProps) {
  const router = useRouter();
  const { user } = useAuthContext();

  const { isActive, isEnded } = useMemo(() => {
    const now = new Date();
    const active = !poll.closed && poll.votingEndsAt > now;
    const ended = poll.votingEndsAt <= now;
    return { isActive: active, isEnded: ended };
  }, [poll.closed, poll.votingEndsAt]);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-semibold text-slate-800">
              {poll.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <VotingStatus poll={poll} />
              {user?.role === "admin" && (
                <DeletePollDialog
                  poll={poll}
                  onPollDeleted={onPollDeleted}
                  className="h-auto p-2"
                />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-sm text-slate-600 mb-2">Opcje restauracji:</p>
              <div className="flex flex-wrap gap-2">
                {poll.restaurantOptions.map((restaurant, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`${
                      poll.selectedRestaurant === restaurant
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {restaurant}
                    {poll.selectedRestaurant === restaurant && (
                      <CheckCircle className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <AnimatedCounter
                  value={poll.restaurantOptions.length}
                  suffix=" opcji"
                  showPulse={false}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {isActive ? (
                  <div className="flex flex-col gap-2">
                    <CountdownTimer
                      endTime={poll.votingEndsAt}
                      className="text-sm"
                    />
                    <DateDisplay date={poll.votingEndsAt} className="text-sm" />
                  </div>
                ) : (
                  <DateDisplay date={poll.votingEndsAt} className="text-sm" />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              onClick={() => router.push(`/poll/${poll.id}`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isActive
                ? "Głosuj teraz"
                : poll.closed
                ? "Zobacz wyniki"
                : "Zobacz głosowanie"}
            </Button>
            {poll.closed && (
              <Button
                onClick={() => router.push(`/poll/${poll.id}/orders`)}
                variant="outline"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm whitespace-nowrap overflow-hidden"
              >
                <span className="block sm:hidden">Zamówienia</span>
                <span className="hidden sm:block">Zobacz zamówienia</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
