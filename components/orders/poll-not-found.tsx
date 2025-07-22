"use client";

import { Button } from "@/components/ui/button";

interface PollNotFoundProps {
  onGoHome: () => void;
}

export function PollNotFound({ onGoHome }: PollNotFoundProps) {
  return (
    <div className="py-12 text-center">
      <h2 className="mb-4 text-2xl font-semibold text-slate-600">
        Głosowanie nie zostało znalezione
      </h2>
      <Button onClick={onGoHome}>Powrót do strony głównej</Button>
    </div>
  );
}
