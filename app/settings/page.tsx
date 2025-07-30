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
import { ProfileSettings } from "@/components/settings/profile-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { SecuritySettings } from "@/components/settings/security-settings";

export default function SettingsPage() {
  const { user, loading } = usePrivacyProtection("/settings");

  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl py-4 sm:py-6 lg:py-8 mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="space-y-2">
              <div className="w-1/3 h-5 sm:h-6 lg:h-7 rounded bg-slate-200"></div>
              <div className="w-2/3 h-3 sm:h-3 lg:h-4 rounded bg-slate-200"></div>
            </div>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="grid gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-slate-200 h-48 sm:h-64 lg:h-80"
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

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-4xl py-4 sm:py-6 lg:py-8 mx-auto">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Ustawienia Konta
            </h1>
            <p className="text-sm sm:text-sm lg:text-sm text-slate-600">
              Zarządzaj swoim kontem i preferencjami aplikacji
            </p>
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Settings Sections */}
          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            {/* Profile Settings */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Profil
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-sm">
                  Zarządzaj informacjami o swoim profilu
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <ProfileSettings user={user} />
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Konto
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-sm">
                  Ustawienia związane z Twoim kontem
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <AccountSettings user={user} />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Bezpieczeństwo
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-sm">
                  Zarządzaj bezpieczeństwem swojego konta
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <SecuritySettings user={user} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
