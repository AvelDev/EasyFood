"use client";

import { useAuthContext } from "@/contexts/auth-context";
import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useEffect, useState } from "react";
import { Poll } from "@/types";
import { getPolls } from "@/lib/firestore";
import PollCard from "@/components/poll-card";
import CreatePollDialog from "@/components/create-poll-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, Clock, Users } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading, isProtected } = usePrivacyProtection();
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
    if (user && isProtected) {
      fetchPolls();
    }
  }, [user, isProtected]);

  const handlePollCreated = () => {
    // Odśwież listę głosowań po utworzeniu nowego
    fetchPolls();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isProtected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <Vote className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Witaj w systemie głosowania na restauracje
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Głosuj na restauracje i składaj zamówienia ze swoim zespołem
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <Vote className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">
                  Głosuj na restauracje
                </h3>
                <p className="text-sm text-slate-600">
                  Wybierz spośród wielu opcji restauracji w głosowaniach
                  zespołowych
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">
                  Składaj zamówienia
                </h3>
                <p className="text-sm text-slate-600">
                  Dodaj swoje zamówienia po zakończeniu głosowania
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-orange-600 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">
                  Aktualizacje na żywo
                </h3>
                <p className="text-sm text-slate-600">
                  Zobacz wyniki głosowania i status zamówień w czasie
                  rzeczywistym
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Głosowania na restauracje
          </h1>
          <p className="text-slate-600 mt-1">
            Głosuj na restauracje i składaj swoje zamówienia
          </p>
        </div>
        {user.role === "admin" && (
          <CreatePollDialog onPollCreated={handlePollCreated} />
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-600 mb-2">
            Brak głosowań
          </h2>
          <p className="text-slate-500">
            {user.role === "admin"
              ? "Utwórz swoje pierwsze głosowanie aby rozpocząć!"
              : "Poproś administratora o utworzenie głosowania."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
