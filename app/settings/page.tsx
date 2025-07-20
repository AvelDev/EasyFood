"use client";

import { useAuthContext } from "@/contexts/auth-context";
import { redirect } from "next/navigation";
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
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl py-8">
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

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
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
