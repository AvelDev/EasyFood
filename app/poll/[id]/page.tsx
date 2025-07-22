"use client";

import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { usePoll } from "@/hooks/use-poll";
import { Button } from "@/components/ui/button";
import { PollHeader, VotingSection, ResultsSection } from "@/components/poll";
import AdminPollEditor from "@/components/admin-poll-editor";

interface PollPageProps {
  params: {
    id: string;
  };
}

export default function PollPage({ params }: PollPageProps) {
  const router = useRouter();
  const currentUrl = `/poll/${params.id}`;
  const {
    user,
    loading: authLoading,
    isProtected,
  } = usePrivacyProtection(currentUrl);

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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44.988-5.922 2.572"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-700 mb-3">
          Głosowanie nie zostało znalezione
        </h2>
        <p className="text-slate-500 mb-6">
          Głosowanie o ID &quot;{params.id}&quot; nie istnieje lub zostało
          usunięte.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push("/")} className="w-full">
            Powrót do strony głównej
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Wróć do poprzedniej strony
          </Button>
        </div>
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

      {/* Poll description */}
      {poll.description && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-slate-700">{poll.description}</p>
        </div>
      )}

      {/* Admin poll editor */}
      <AdminPollEditor
        poll={poll}
        isAdmin={user?.role === "admin"}
        onPollUpdated={() => {
          // Refresh poll data after update
          router.refresh();
        }}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <VotingSection
          poll={poll}
          canVote={canVote}
          userVote={userVote}
          votes={votes}
          onVote={handleVote}
          voting={voting}
          userId={user?.uid}
          userName={user?.displayName || user?.email || "Użytkownik"}
          userRole={user?.role}
        />

        <ResultsSection poll={poll} votes={votes} />
      </div>
    </div>
  );
}
