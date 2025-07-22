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
      <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl py-8 mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="w-1/3 h-8 rounded bg-slate-200"></div>
            <div className="w-2/3 h-4 rounded bg-slate-200"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-lg bg-slate-200"></div>
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-4xl py-8 mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Ustawienia
            </h1>
            <p className="text-slate-600">
              Zarządzaj swoim kontem i preferencjami aplikacji
            </p>
          </div>

          <Separator />

          {/* Settings Sections */}
          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
                <CardDescription>
                  Zarządzaj informacjami o swoim profilu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettings user={user} />
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Konto</CardTitle>
                <CardDescription>
                  Ustawienia związane z Twoim kontem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountSettings user={user} />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Bezpieczeństwo</CardTitle>
                <CardDescription>
                  Zarządzaj bezpieczeństwem swojego konta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecuritySettings user={user} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
