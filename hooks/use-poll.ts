import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Poll, Vote } from "@/types";
import {
  getPoll,
  getVotes,
  getUserVote,
  addVote,
  updateUserVote,
  deleteUserVote,
  updatePoll,
  subscribeToPoll,
  subscribeToVotes,
} from "@/lib/firestore";
import { pollAutoCloser } from "@/lib/poll-auto-closer";
import { useToast } from "@/hooks/use-toast";

interface UsePollProps {
  pollId: string;
  userId?: string;
}

export function usePoll({ pollId, userId }: UsePollProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!userId || !pollId) return;

    setLoading(true);

    // Set up real-time poll listener
    const unsubscribePoll = subscribeToPoll(pollId, (pollData) => {
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
    const unsubscribeVotes = subscribeToVotes(pollId, (votesData) => {
      setVotes(votesData);
      setLoading(false);
    });

    // Get initial user vote
    const fetchUserVote = async () => {
      try {
        const userVoteData = await getUserVote(pollId, userId);
        setUserVote(userVoteData);
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
      pollAutoCloser.cancelPollClosure(pollId);
    };
  }, [pollId, userId, router, toast]);

  const handleVote = async (restaurant: string) => {
    if (!userId || !poll) return;

    setVoting(true);
    try {
      if (userVote) {
        // Update existing vote
        await updateUserVote(pollId, userId, restaurant);
        setUserVote({ ...userVote, restaurant, createdAt: new Date() });

        toast({
          title: "Głos zaktualizowany",
          description: "Twój głos został pomyślnie zaktualizowany.",
        });
      } else {
        // Add new vote
        const voteData: Vote = {
          userId,
          restaurant,
          createdAt: new Date(),
        };

        await addVote(pollId, voteData);
        setUserVote(voteData);

        toast({
          title: "Głos oddany",
          description: "Twój głos został pomyślnie oddany.",
        });
      }

      // Votes will be updated automatically via the real-time listener
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Błąd głosowania",
        description:
          "Nie udało się oddać/zaktualizować głosu. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
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

      await updatePoll(pollId, {
        closed: true,
        selectedRestaurant: winner,
      });

      setPoll({ ...poll, closed: true, selectedRestaurant: winner });
    } catch (error) {
      console.error("Error closing poll automatically:", error);
      toast({
        title: "Błąd zamykania głosowania",
        description: "Nie udało się automatycznie zamknąć głosowania.",
        variant: "destructive",
      });
    }
  }, [poll, votes, pollId, toast]);

  const handleClosePoll = async () => {
    if (!poll) return;

    try {
      await closePollAutomatically();
      toast({
        title: "Głosowanie zamknięte",
        description: "Głosowanie zostało pomyślnie zamknięte.",
      });
    } catch (error) {
      console.error("Error closing poll:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zamknąć głosowania.",
        variant: "destructive",
      });
    }
  };

  const handleTimeExpired = useCallback(() => {
    // Auto-close poll when countdown reaches zero
    if (!poll?.closed) {
      closePollAutomatically();
    }
  }, [poll?.closed, closePollAutomatically]);

  const isActive = poll
    ? !poll.closed && poll.votingEndsAt > new Date()
    : false;
  const canVote = poll ? isActive : false; // Allow voting even if user already voted

  return {
    poll,
    votes,
    userVote,
    loading,
    voting,
    isActive,
    canVote,
    handleVote,
    handleClosePoll,
    handleTimeExpired,
  };
}
