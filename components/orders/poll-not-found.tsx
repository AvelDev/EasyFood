"use client";

import { Button } from "@/components/ui/button";

interface PollNotFoundProps {
  onGoHome: () => void;
}

export function PollNotFound({ onGoHome }: PollNotFoundProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-slate-600 mb-4">
        Głosowanie nie zostało znalezione
      </h2>
      <Button onClick={onGoHome}>Powrót do strony głównej</Button>
    </div>
  );
}
