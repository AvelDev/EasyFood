"use client";

import { useAuthContext } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Poll } from "@/types";
import { getPolls, subscribeToPolls } from "@/lib/firestore";
import PollCard from "@/components/poll-card";
import CreatePollDialog from "@/components/create-poll-dialog";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PollsByDateGrouping from "@/components/polls-by-date-grouping";
import LandingPage from "@/components/landing-page";

export default function Home() {
  const { user, loading: authLoading } = useAuthContext();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const pollsData = await getPolls();
      setPolls(pollsData);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.privacyPolicyAccepted) {
      // Initial load
      fetchPolls();

      // Set up real-time listener
      const unsubscribe = subscribeToPolls((pollsData) => {
        setPolls(pollsData);
        setLoading(false);
      });

      // Cleanup function
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const handlePollCreated = () => {
    // Odśwież listę głosowań po utworzeniu nowego
    fetchPolls();
  };

  const handlePollDeleted = () => {
    // Odśwież listę głosowań po usunięciu
    fetchPolls();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !user.privacyPolicyAccepted) {
    return <LandingPage />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Głosowania na restauracje
          </h1>
          <p className="mt-1 text-slate-600">
            Głosuj na restauracje i składaj swoje zamówienia
          </p>
        </div>
        {user.role === "admin" && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            <CreatePollDialog onPollCreated={handlePollCreated} />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : polls.length === 0 ? (
        <div className="py-12 text-center">
          <Vote className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="mb-2 text-2xl font-semibold text-slate-600">
            Brak głosowań
          </h2>
          <p className="text-slate-500">
            {user.role === "admin"
              ? "Utwórz swoje pierwsze głosowanie aby rozpocząć!"
              : "Poproś administratora o utworzenie głosowania."}
          </p>
        </div>
      ) : (
        <PollsByDateGrouping polls={polls} onPollDeleted={handlePollDeleted} />
      )}
    </div>
  );
}
