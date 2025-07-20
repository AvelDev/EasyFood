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
import { WebhookSettings } from "@/components/settings/webhook-settings";
import { UserManagement } from "@/components/settings/user-management";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function GeneralSettingsPage() {
  const { user, loading } = usePrivacyProtection("/settings/general");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Nie masz uprawnień do dostępu do ustawień ogólnych. Ta sekcja jest
              dostępna tylko dla administratorów.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Ustawienia ogólne
            </h1>
            <p className="text-slate-600">
              Zarządzaj ustawieniami aplikacji, szablonami głosowań i
              użytkownikami
            </p>
          </div>

          <Separator />

          {/* Settings Sections */}
          <div className="grid gap-6">
            {/* Poll Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Szablony głosowań</CardTitle>
                <CardDescription>
                  Zarządzaj szablonami z predefiniowanymi restauracjami i
                  godzinami
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PollTemplateSettings />
              </CardContent>
            </Card>

            {/* Webhook Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Integracje</CardTitle>
                <CardDescription>
                  Konfiguruj webhook Discord i inne integracje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookSettings />
              </CardContent>
            </Card>

            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle>Zarządzanie użytkownikami</CardTitle>
                <CardDescription>
                  Przegląd wszystkich użytkowników aplikacji
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
