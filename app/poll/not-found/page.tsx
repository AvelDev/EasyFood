"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function PollNotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md py-12 mx-auto text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full">
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-800">
          Głosowanie nie zostało znalezione
        </h1>

        <p className="mb-6 leading-relaxed text-slate-600">
          Głosowanie, którego szukasz, mogło zostać usunięte lub link może być
          nieprawidłowy.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="flex items-center justify-center w-full gap-2"
          >
            <Home className="w-4 h-4" />
            Przejdź do strony głównej
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center justify-center w-full gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do poprzedniej strony
          </Button>
        </div>

        <div className="p-4 mt-8 rounded-lg bg-blue-50">
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
