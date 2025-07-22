"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { VotingOptionProposal } from "@/types";

interface ProposeOptionFormProps {
  onSubmit: (restaurantName: string) => Promise<void>;
  submitting: boolean;
  existingOptions: string[];
  userProposals: VotingOptionProposal[];
}

export default function ProposeOptionForm({
  onSubmit,
  submitting,
  existingOptions,
  userProposals,
}: ProposeOptionFormProps) {
  const [restaurantName, setRestaurantName] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Check if user has any pending proposals
  const hasPendingProposal = userProposals.some((p) => p.status === "pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) return;

    // Check if restaurant already exists
    if (existingOptions.includes(restaurantName.trim())) {
      return;
    }

    // Check if user already has a pending proposal
    if (hasPendingProposal) {
      return;
    }

    await onSubmit(restaurantName.trim());
    setRestaurantName("");
    setShowForm(false);
  };

  const isInvalid = () => {
    const trimmed = restaurantName.trim();
    if (!trimmed) return false;

    // Check if already exists
    if (existingOptions.includes(trimmed)) return true;

    // Check if user has pending proposal
    if (hasPendingProposal) return true;

    return false;
  };

  const getErrorMessage = () => {
    const trimmed = restaurantName.trim();
    if (!trimmed) return "";

    if (existingOptions.includes(trimmed)) {
      return "Ta restauracja już istnieje w opcjach głosowania";
    }

    if (hasPendingProposal) {
      return "Możesz mieć tylko jedną oczekującą propozycję naraz";
    }

    return "";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Zaproponuj nową opcję</span>
          {!showForm && !hasPendingProposal && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Dodaj propozycję
            </Button>
          )}
          {hasPendingProposal && (
            <Badge variant="secondary" className="text-xs">
              Oczekuje na zatwierdzenie
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <AnimatePresence>
        {showForm && !hasPendingProposal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Nazwa restauracji</Label>
                  <Input
                    id="restaurant"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="np. Pizza Express"
                    className={
                      isInvalid() ? "border-red-300 focus:border-red-500" : ""
                    }
                  />
                  {getErrorMessage() && (
                    <p className="text-sm text-red-600">{getErrorMessage()}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={
                      !restaurantName.trim() || isInvalid() || submitting
                    }
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                      />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitting ? "Wysyłanie..." : "Wyślij propozycję"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setRestaurantName("");
                    }}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's existing proposals */}
      {userProposals.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Twoje propozycje:</Label>
            <div className="flex flex-wrap gap-2">
              {userProposals.map((proposal) => (
                <Badge
                  key={proposal.id}
                  variant={
                    proposal.status === "approved"
                      ? "default"
                      : proposal.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  {proposal.restaurantName}
                  <span className="text-xs">
                    (
                    {proposal.status === "pending"
                      ? "oczekuje"
                      : proposal.status === "approved"
                        ? "zatwierdzona"
                        : "odrzucona"}
                    )
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
