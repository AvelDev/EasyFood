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
import { AdminManagement } from "@/components/settings/admin-management";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getAllUsers } from "@/lib/admin-settings";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function GeneralSettingsPage() {
  const { user, loading } = usePrivacyProtection("/settings/general");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się załadować listy użytkowników.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadUsers();
    }
  }, [user, loadUsers]);

  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-7xl py-4 sm:py-6 lg:py-8 mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <div className="w-1/2 sm:w-1/3 h-5 sm:h-6 lg:h-7 rounded bg-slate-200"></div>
              <div className="w-3/4 sm:w-2/3 h-3 sm:h-3 lg:h-4 rounded bg-slate-200"></div>
            </div>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 sm:h-80 lg:h-96 lg:col-span-2 xl:col-span-1 2xl:col-span-2 rounded-lg bg-slate-200"
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
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl py-4 sm:py-6 lg:py-8 mx-auto">
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            <AlertDescription className="text-xs sm:text-sm lg:text-sm text-red-800">
              Nie masz uprawnień do dostępu do ustawień ogólnych. Ta sekcja jest
              dostępna tylko dla administratorów.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-7xl py-4 sm:py-6 lg:py-8 mx-auto">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Ustawienia Aplikacji
            </h1>
            <p className="text-sm sm:text-sm lg:text-sm text-slate-600">
              Zarządzaj szablonami głosowań i użytkownikami
            </p>
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Settings Sections */}
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1">
            {/* Admin Management */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6 lg:p-8">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Zarządzanie administratorami
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-sm">
                  Nadawaj i odbieraj rangi administratora konkretnym
                  użytkownikom
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 pt-0">
                {isLoadingUsers ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-slate-200 rounded"></div>
                    <div className="h-16 bg-slate-200 rounded"></div>
                  </div>
                ) : (
                  <AdminManagement users={users} onUserUpdate={loadUsers} />
                )}
              </CardContent>
            </Card>

            {/* Poll Templates */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6 lg:p-8">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Szablony głosowań
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-sm">
                  Zarządzaj szablonami z predefiniowanymi restauracjami i
                  godzinami
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 pt-0">
                <PollTemplateSettings />
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6 lg:p-8">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Zarządzanie użytkownikami
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-sm">
                  Przegląd wszystkich użytkowników aplikacji
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 pt-0">
                {isLoadingUsers ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-slate-200 rounded"></div>
                    <div className="h-64 bg-slate-200 rounded"></div>
                  </div>
                ) : (
                  <UserManagement />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
