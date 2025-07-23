"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Poll, Vote } from "@/types";
import { AuthUser } from "@/hooks/use-auth";

interface PollContextType {
  // Poll data
  poll: Poll | null;
  votes: Vote[];
  userVote: Vote | null;

  // User data
  user: AuthUser | null;

  // State
  loading: boolean;
  voting: boolean;
  isActive: boolean;
  canVote: boolean;

  // Actions
  handleVote: (restaurants: string[]) => Promise<void>;
  handleClosePoll: () => Promise<void>;
  handleTimeExpired: () => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

interface PollProviderProps {
  children: ReactNode;
  value: PollContextType;
}

export function PollProvider({ children, value }: PollProviderProps) {
  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

export function usePollContext(): PollContextType {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error("usePollContext must be used within a PollProvider");
  }
  return context;
}
