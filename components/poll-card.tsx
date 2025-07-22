"use client";

import { useMemo, useState } from "react";
import { Poll } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  CheckCircle,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AnimatedCounter from "./animated-counter";
import CountdownTimer from "./countdown-timer";
import VotingStatus from "./voting-status";
import DateDisplay from "./date-display";
import DeletePollDialog from "./delete-poll-dialog";
import { useAuthContext } from "@/contexts/auth-context";
import { normalizeRestaurantOptions } from "@/lib/firestore";

interface PollCardProps {
  poll: Poll;
  onPollDeleted?: () => void;
}

export default function PollCard({ poll, onPollDeleted }: PollCardProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const normalizedOptions = normalizeRestaurantOptions(poll.restaurantOptions);

  const { isActive, isEnded } = useMemo(() => {
    const now = new Date();
    const active = !poll.closed && poll.votingEndsAt > now;
    const ended = poll.votingEndsAt <= now;
    return { isActive: active, isEnded: ended };
  }, [poll.closed, poll.votingEndsAt]);

  const handleShareLink = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to poll page
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
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full transition-all duration-300 border-0 shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm">
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

        <CardContent className="flex flex-col flex-1 pt-0">
          <div className="flex-1 space-y-4">
            <div>
              <p className="mb-2 text-sm text-slate-600">Opcje restauracji:</p>
              <div className="flex flex-wrap gap-2">
                {normalizedOptions.map((option, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`${
                      poll.selectedRestaurant === option.name
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {option.name}
                      {option.url && <ExternalLink className="w-3 h-3" />}
                      {poll.selectedRestaurant === option.name && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                    </div>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Poll description */}
            {poll.description && (
              <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                <p className="text-sm text-slate-700">{poll.description}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between text-slate-600">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {isActive ? (
                  <div className="flex flex-col gap-2">
                    <CountdownTimer
                      endTime={poll.votingEndsAt}
                      className="text-sm"
                    />
                    <DateDisplay date={poll.votingEndsAt} className="text-sm" />
                    {poll.orderingEndsAt &&
                      poll.orderingEndsAt instanceof Date && (
                        <div className="text-xs text-slate-500">
                          Zamówienia do:{" "}
                          {poll.orderingEndsAt.toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <DateDisplay date={poll.votingEndsAt} className="text-sm" />
                    {poll.orderingEndsAt &&
                      poll.orderingEndsAt instanceof Date && (
                        <div className="text-xs text-slate-500">
                          Zamówienia do:{" "}
                          {poll.orderingEndsAt.toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 sm:flex-row">
            <Button
              onClick={() => router.push(`/poll/${poll.id}`)}
              className="flex-1 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isActive
                ? "Głosuj teraz"
                : poll.closed
                ? "Zobacz"
                : "Głosowanie"}
            </Button>

            {poll.closed && (
              <Button
                onClick={() => router.push(`/poll/${poll.id}/orders`)}
                variant="outline"
                className="flex-1 overflow-hidden text-xs text-green-700 border-green-200 hover:bg-green-50 sm:text-sm whitespace-nowrap"
              >
                <span className="block">Zamówienia</span>
              </Button>
            )}

            <Button
              onClick={handleShareLink}
              variant="outline"
              size="icon"
              className="shrink-0"
              title={linkCopied ? "Skopiowano!" : "Udostępnij link"}
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
