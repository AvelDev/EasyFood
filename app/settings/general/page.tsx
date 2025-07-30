"use client";

import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PollTemplateSettings } from "@/components/settings/poll-template-settings";
import { UserManagement } from "@/components/settings/user-management";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function GeneralSettingsPage() {
  const { user, loading } = usePrivacyProtection("/settings/general");

  if (loading) {
    return (
      <div className="min-h-screen p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-7xl py-4 sm:py-6 lg:py-8 mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="w-1/2 sm:w-1/3 h-6 sm:h-8 rounded bg-slate-200"></div>
            <div className="w-3/4 sm:w-2/3 h-3 sm:h-4 rounded bg-slate-200"></div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-48 sm:h-64 lg:col-span-2 xl:col-span-1 2xl:col-span-2 rounded-lg bg-slate-200"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hook usePrivacyProtection już obsługuje przekierowanie na logowanie
  if (!user) {
    return null; // Component will be unmounted anyway by usePrivacyProtection redirect
  }

  // Sprawdź czy użytkownik jest administratorem
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl py-4 sm:py-6 lg:py-8 mx-auto">
          <Alert variant="destructive">
            <Shield className="w-4 h-4" />
            <AlertDescription className="text-sm sm:text-base">
              Nie masz uprawnień do dostępu do ustawień ogólnych. Ta sekcja jest
              dostępna tylko dla administratorów.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-7xl py-4 sm:py-6 lg:py-8 mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Ustawienia ogólne
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Zarządzaj szablonami głosowań i użytkownikami
            </p>
          </div>

          <Separator />

          {/* Settings Sections */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {/* Poll Templates */}
            <Card className="lg:col-span-2 xl:col-span-1 2xl:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Szablony głosowań
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Zarządzaj szablonami z predefiniowanymi restauracjami i
                  godzinami
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <PollTemplateSettings />
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="lg:col-span-2 xl:col-span-1 2xl:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Zarządzanie użytkownikami
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Przegląd wszystkich użytkowników aplikacji
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <UserManagement />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
