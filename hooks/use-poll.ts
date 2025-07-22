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
  calculateVoteCounts,
  determineWinnerWithTieBreaking,
} from "@/lib/firestore";
import { pollAutoCloser } from "@/lib/poll-auto-closer";
import { useToast } from "@/hooks/use-toast";

interface UsePollProps {
  pollId: string;
  userId?: string;
  userName?: string;
}

export function usePoll({ pollId, userId, userName }: UsePollProps) {
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
          },
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

  const handleVote = async (restaurants: string[]) => {
    if (!userId || !poll) return;

    // Check if poll is still active
    if (poll.closed || poll.votingEndsAt <= new Date()) {
      toast({
        title: "Głosowanie zakończone",
        description:
          "Nie można już oddawać ani zmieniać głosów - czas głosowania minął.",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      if (userVote) {
        if (restaurants.length === 0) {
          // Delete vote if no restaurants selected
          await deleteUserVote(pollId, userId);
          setUserVote(null);

          toast({
            title: "Głos usunięty",
            description: "Twój głos został usunięty.",
          });
        } else {
          // Update existing vote
          await updateUserVote(pollId, userId, restaurants, userName);
          setUserVote({
            ...userVote,
            restaurants,
            userName: userName || "Nieznany użytkownik",
            createdAt: new Date(),
            // Keep backward compatibility
            restaurant: restaurants[0],
          });

          toast({
            title: "Głos zaktualizowany",
            description: `Twój głos został pomyślnie zaktualizowany. Wybrane restauracje: ${restaurants.join(
              ", ",
            )}.`,
          });
        }
      } else if (restaurants.length > 0) {
        // Add new vote
        const voteData: Vote = {
          userId,
          restaurants,
          userName: userName || "Nieznany użytkownik",
          createdAt: new Date(),
          // Backward compatibility
          restaurant: restaurants[0],
        };

        await addVote(pollId, voteData);
        setUserVote(voteData);

        toast({
          title: "Głos oddany",
          description: `Twój głos został pomyślnie oddany. Wybrane restauracje: ${restaurants.join(
            ", ",
          )}.`,
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
      // Calculate the winner using new multi-vote logic with tie-breaking
      const voteCounts = calculateVoteCounts(votes);
      const winner = determineWinnerWithTieBreaking(voteCounts);

      await updatePoll(pollId, {
        closed: true,
        selectedRestaurant: winner,
      });

      setPoll({ ...poll, closed: true, selectedRestaurant: winner });

      if (winner) {
        toast({
          title: "Głosowanie zakończone",
          description: `Zwycięska restauracja: ${winner}`,
        });
      }
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
