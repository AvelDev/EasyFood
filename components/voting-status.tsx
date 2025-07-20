"use client";

import { memo } from "react";
import { Badge } from "./ui/badge";
import { Clock, CheckCircle, Lock } from "lucide-react";

interface VotingStatusProps {
  poll: {
    closed: boolean;
    votingEndsAt: Date;
  };
  onTimeExpired?: () => void;
  className?: string;
}

const VotingStatus = memo(function VotingStatus({
  poll,
  onTimeExpired,
  className = "",
}: VotingStatusProps) {
  const isActive = !poll.closed && poll.votingEndsAt > new Date();

  return (
    <div className={className}>
      {poll.closed ? (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1">
          <CheckCircle className="w-3 h-3 mr-1" />
          Zamknięte
        </Badge>
      ) : isActive ? (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
          <Clock className="w-3 h-3 mr-1" />
          Aktywne
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 px-3 py-1">
          <Lock className="w-3 h-3 mr-1" />
          Zakończone
        </Badge>
      )}
    </div>
  );
});

export default VotingStatus;
