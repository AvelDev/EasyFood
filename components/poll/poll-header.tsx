"use client";

import { Poll } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Share2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/poll/${poll.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="mb-4 text-slate-600"
      >
        ← Powrót do głosowań
      </Button>

      <div className="grid-cols-2">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">
            {poll.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              className="flex items-center gap-2"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Skopiowano!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Udostępnij</span>
                </>
              )}
            </Button>

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

        <div className="flex flex-col col-span-2 gap-4 sm:flex-row sm:items-center text-slate-600">
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
                Zamówienia do {poll.orderingEndsAt.toLocaleDateString("pl-PL")}{" "}
                o{" "}
                {poll.orderingEndsAt.toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
