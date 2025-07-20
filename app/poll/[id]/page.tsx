"use client";

import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { usePoll } from "@/hooks/use-poll";
import { Button } from "@/components/ui/button";
import { PollHeader, VotingSection, ResultsSection } from "@/components/poll";

interface PollPageProps {
  params: {
    id: string;
  };
}

export default function PollPage({ params }: PollPageProps) {
  const { user, loading: authLoading, isProtected } = usePrivacyProtection();
  const router = useRouter();

  const {
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
  } = usePoll({
    pollId: params.id,
    userId: user?.uid,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-600 mb-4">
          Głosowanie nie zostało znalezione
        </h2>
        <Button onClick={() => router.push("/")}>
          Powrót do strony głównej
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PollHeader
        poll={poll}
        votesCount={votes.length}
        isActive={isActive}
        userRole={user?.role}
        onTimeExpired={handleTimeExpired}
        onClosePoll={handleClosePoll}
        onPollDeleted={() => router.push("/")}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <VotingSection
          poll={poll}
          canVote={canVote}
          userVote={userVote}
          votes={votes}
          onVote={handleVote}
          voting={voting}
        />

        <ResultsSection poll={poll} votes={votes} />
      </div>
    </div>
  );
}
