"use client";

import { Button } from "@/components/ui/button";

interface PollStillActiveProps {
  pollId: string;
  onGoToPoll: () => void;
}

export function PollStillActive({ pollId, onGoToPoll }: PollStillActiveProps) {
  return (
    <div className="py-12 text-center">
      <h2 className="mb-4 text-2xl font-semibold text-slate-600">
        Głosowanie jest nadal aktywne
      </h2>
      <p className="mb-6 text-slate-500">
        Poczekaj na zakończenie głosowania przed składaniem zamówień
      </p>
      <Button onClick={onGoToPoll}>Przejdź do głosowania</Button>
    </div>
  );
}
