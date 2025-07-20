"use client";

import { useEffect, useState } from "react";
import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { Poll, Vote } from "@/types";
import {
  getPoll,
  getVotes,
  getUserVote,
  addVote,
  updatePoll,
} from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Users, CheckCircle, Crown } from "lucide-react";

interface PollPageProps {
  params: {
    id: string;
  };
}

export default function PollPage({ params }: PollPageProps) {
  const { user, loading: authLoading, isProtected } = usePrivacyProtection();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const pollData = await getPoll(params.id);
        if (pollData) {
          setPoll(pollData);
          const votesData = await getVotes(params.id);
          setVotes(votesData);

          if (user?.uid) {
            const userVoteData = await getUserVote(params.id, user.uid);
            setUserVote(userVoteData);
            if (userVoteData) {
              setSelectedRestaurant(userVoteData.restaurant);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching poll data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      fetchPollData();
    }
  }, [params.id, user]);

  const handleVote = async () => {
    if (!user?.uid || !poll || !selectedRestaurant) return;

    setVoting(true);
    try {
      const voteData: Vote = {
        userId: user.uid,
        restaurant: selectedRestaurant,
        createdAt: new Date(),
      };

      await addVote(params.id, voteData);
      setUserVote(voteData);

      // Refresh votes
      const updatedVotes = await getVotes(params.id);
      setVotes(updatedVotes);
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!poll || user?.role !== "admin") return;

    try {
      // Calculate the winner
      const voteCounts = votes.reduce((acc, vote) => {
        acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const winner = Object.entries(voteCounts).reduce((a, b) =>
        voteCounts[a[0]] > voteCounts[b[0]] ? a : b
      )[0];

      await updatePoll(params.id, {
        closed: true,
        selectedRestaurant: winner,
      });

      setPoll({ ...poll, closed: true, selectedRestaurant: winner });
    } catch (error) {
      console.error("Error closing poll:", error);
    }
  };

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

  const isActive = !poll.closed && poll.votingEndsAt > new Date();
  const canVote = isActive && !userVote;
  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.restaurant] = (acc[vote.restaurant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-slate-600"
        >
          ← Powrót do głosowań
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {poll.title}
            </h1>
            <div className="flex items-center gap-4 text-slate-600">
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
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{votes.length} głosów</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {poll.closed ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Zamknięte
              </Badge>
            ) : isActive ? (
              <Badge className="bg-blue-100 text-blue-700">
                <Clock className="w-3 h-3 mr-1" />
                Aktywne
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-700">
                <Clock className="w-3 h-3 mr-1" />
                Zakończone
              </Badge>
            )}

            {user?.role === "admin" && isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClosePoll}
                className="ml-2"
              >
                Zamknij głosowanie
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Opcje restauracji
              {poll.selectedRestaurant && (
                <Badge className="bg-green-100 text-green-700">
                  Zwycięzca: {poll.selectedRestaurant}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canVote ? (
              <div className="space-y-4">
                <RadioGroup
                  value={selectedRestaurant}
                  onValueChange={setSelectedRestaurant}
                >
                  {poll.restaurantOptions.map((restaurant) => (
                    <div
                      key={restaurant}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={restaurant} id={restaurant} />
                      <Label
                        htmlFor={restaurant}
                        className="flex-1 cursor-pointer"
                      >
                        {restaurant}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  onClick={handleVote}
                  disabled={!selectedRestaurant || voting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {voting ? "Głosowanie..." : "Oddaj głos"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {poll.restaurantOptions.map((restaurant) => (
                  <div
                    key={restaurant}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      poll.selectedRestaurant === restaurant
                        ? "border-green-500 bg-green-50"
                        : userVote?.restaurant === restaurant
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{restaurant}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {voteCounts[restaurant] || 0} głosów
                        </Badge>
                        {poll.selectedRestaurant === restaurant && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {userVote?.restaurant === restaurant && (
                          <Badge className="bg-blue-100 text-blue-700">
                            Twój głos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Wyniki głosowania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poll.restaurantOptions.map((restaurant) => {
                const count = voteCounts[restaurant] || 0;
                const percentage =
                  votes.length > 0 ? (count / votes.length) * 100 : 0;

                return (
                  <div key={restaurant} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{restaurant}</span>
                      <span className="text-sm text-slate-600">
                        {count} głosów ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {poll.closed && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => router.push(`/poll/${poll.id}/orders`)}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  Zobacz zamówienia
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
