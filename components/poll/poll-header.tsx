"use client";

import { Poll } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedCounter from "@/components/animated-counter";
import CountdownTimer from "@/components/countdown-timer";
import VotingStatus from "@/components/voting-status";
import DeletePollDialog from "@/components/delete-poll-dialog";

interface PollHeaderProps {
  poll: Poll;
  votesCount: number;
  isActive: boolean;
  userRole?: string;
  onTimeExpired: () => void;
  onClosePoll: () => void;
  onPollDeleted: () => void;
}

export default function PollHeader({
  poll,
  votesCount,
  isActive,
  userRole,
  onTimeExpired,
  onClosePoll,
  onPollDeleted,
}: PollHeaderProps) {
  const router = useRouter();

  return (
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
                  onTimeExpired={onTimeExpired}
                  className="font-medium"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Kończy się {poll.votingEndsAt.toLocaleDateString("pl-PL")} o{" "}
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
                  value={votesCount}
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
            onTimeExpired={onTimeExpired}
            className="flex items-center gap-2"
          />

          {userRole === "admin" && (
            <div className="flex items-center gap-2">
              {isActive && (
                <Button variant="outline" size="sm" onClick={onClosePoll}>
                  Zamknij głosowanie
                </Button>
              )}
              <DeletePollDialog poll={poll} onPollDeleted={onPollDeleted} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
