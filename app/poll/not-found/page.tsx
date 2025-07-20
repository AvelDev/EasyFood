"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function PollNotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Głosowanie nie zostało znalezione
        </h1>

        <p className="text-slate-600 mb-6 leading-relaxed">
          Głosowanie, którego szukasz, mogło zostać usunięte lub link może być
          nieprawidłowy.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Przejdź do strony głównej
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do poprzedniej strony
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Wskazówka:</strong> Upewnij się, że używasz aktualnego linku
            do głosowania. Możesz poprosić o nowy link od osoby, która utworzyła
            głosowanie.
          </p>
        </div>
      </div>
    </div>
  );
}
