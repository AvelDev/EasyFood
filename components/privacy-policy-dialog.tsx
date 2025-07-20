"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PrivacyPolicyDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyPolicyDialog({
  isOpen,
  onAccept,
  onDecline,
}: PrivacyPolicyDialogProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
    }
  };

  const handleDecline = () => {
    setIsAccepted(false);
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Polityka Prywatności
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-semibold mb-2">1. Wprowadzenie</h3>
              <p className="text-sm text-gray-600">
                Niniejsza Polityka Prywatności opisuje, w jaki sposób zbieramy,
                używamy i chronimy Twoje dane osobowe podczas korzystania z
                aplikacji EasyFood.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-2">2. Zbierane dane</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Zbieramy następujące dane osobowe:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Imię i nazwisko</li>
                  <li>Adres e-mail</li>
                  <li>
                    Zdjęcie profilowe (jeśli udostępnione przez dostawcę
                    logowania)
                  </li>
                  <li>Dane dotyczące Twoich głosów i zamówień</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-2">
                3. Cel przetwarzania danych
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Twoje dane wykorzystujemy w celu:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Umożliwienia korzystania z funkcji aplikacji</li>
                  <li>Organizacji głosowań na restauracje</li>
                  <li>Koordynacji zespołowych zamówień</li>
                  <li>Komunikacji związanej z zamówieniami</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-2">
                4. Udostępnianie danych
              </h3>
              <p className="text-sm text-gray-600">
                Twoje dane są udostępniane wyłącznie członkom Twojego zespołu w
                zakresie niezbędnym do funkcjonowania aplikacji (np.
                wyświetlanie głosów, lista zamówień).
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-2">
                5. Przechowywanie danych
              </h3>
              <p className="text-sm text-gray-600">
                Dane są przechowywane w bezpiecznej bazie danych Firebase i są
                chronione zgodnie z najlepszymi praktykami bezpieczeństwa.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-2">6. Twoje prawa</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Masz prawo do:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dostępu do swoich danych</li>
                  <li>Sprostowania nieprawidłowych danych</li>
                  <li>Usunięcia swoich danych</li>
                  <li>Ograniczenia przetwarzania</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-2">7. Kontakt</h3>
              <p className="text-sm text-gray-600">
                W przypadku pytań dotyczących polityki prywatności, skontaktuj
                się z administratorem aplikacji.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="privacy-accept"
            checked={isAccepted}
            onCheckedChange={(checked) => setIsAccepted(checked as boolean)}
            className="border-2"
          />
          <label
            htmlFor="privacy-accept"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Przeczytałem/am i akceptuję Politykę Prywatności
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDecline} className="mr-2">
            Odrzuć
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!isAccepted}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Akceptuję i kontynuuję
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
