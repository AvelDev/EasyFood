"use client";

import { Button } from "@/components/ui/button";

interface PollStillActiveProps {
  pollId: string;
  onGoToPoll: () => void;
}

export function PollStillActive({ pollId, onGoToPoll }: PollStillActiveProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-slate-600 mb-4">
        Głosowanie jest nadal aktywne
      </h2>
      <p className="text-slate-500 mb-6">
        Poczekaj na zakończenie głosowania przed składaniem zamówień
      </p>
      <Button onClick={onGoToPoll}>Przejdź do głosowania</Button>
    </div>
  );
}
