"use client";

import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { usePoll } from "@/hooks/use-poll";
import { Button } from "@/components/ui/button";
import { PollHeader, VotingSection, ResultsSection } from "@/components/poll";
import AdminPollEditor from "@/components/admin-poll-editor";
import { PollProvider } from "@/contexts/poll-context";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

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

  const pollData = usePoll({
    pollId: params.id,
    userId: user?.uid,
    userName: user?.displayName || user?.email || "Nieznany użytkownik",
  });

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
  } = pollData;

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md py-12 mx-auto text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
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
          <h2 className="mb-3 text-2xl font-semibold text-slate-700">
            Głosowanie nie zostało znalezione
          </h2>
          <p className="mb-6 text-slate-500">
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
      </div>
    );
  }

  return (
    <PollProvider
      value={{
        poll,
        votes,
        userVote,
        user,
        loading,
        voting,
        isActive,
        canVote,
        handleVote,
        handleClosePoll,
        handleTimeExpired,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 text-blue-700 transition-all duration-300 bg-white border-2 border-blue-200 shadow-sm group hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 hover:shadow-md"
              >
                <Home className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">Powrót do menu</span>
              </Button>
            </motion.div>
          </motion.div>

          <PollHeader onPollDeleted={() => router.push("/")} />

          {/* Poll description */}
          {poll?.description && (
            <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
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

          <div className="grid gap-8 lg:grid-cols-2">
            <VotingSection />
            <ResultsSection />
          </div>
        </div>
      </div>
    </PollProvider>
  );
}
