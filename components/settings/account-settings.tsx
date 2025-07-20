"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, User, Calendar, CheckCircle } from "lucide-react";
import { AuthUser } from "@/hooks/use-auth";
import UserProviderInfo from "@/components/user-provider-info";

interface AccountSettingsProps {
  user: AuthUser;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date: string | null) => {
    if (!date) return "Nieznana";
    try {
      return new Date(date).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Nieprawidłowa data";
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Informacje o koncie
        </h3>

        <div className="grid gap-4">
          {/* User ID */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">ID użytkownika</p>
                <p className="text-sm text-slate-600">
                  Unikalny identyfikator konta
                </p>
              </div>
            </div>
            <code className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">
              {user.uid.substring(0, 8)}...
            </code>
          </div>

          {/* Role */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {user.role === "admin" ? (
                <Crown className="w-5 h-5 text-yellow-600" />
              ) : (
                <User className="w-5 h-5 text-slate-600" />
              )}
              <div>
                <p className="font-medium text-slate-900">Rola w systemie</p>
                <p className="text-sm text-slate-600">
                  {user.role === "admin"
                    ? "Pełne uprawnienia administratora"
                    : "Standardowe uprawnienia użytkownika"}
                </p>
              </div>
            </div>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className={
                user.role === "admin" ? "bg-yellow-100 text-yellow-800" : ""
              }
            >
              {user.role === "admin" ? "Administrator" : "Użytkownik"}
            </Badge>
          </div>

          {/* Privacy Policy Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-slate-900">
                  Polityka prywatności
                </p>
                <p className="text-sm text-slate-600">
                  Status akceptacji polityki prywatności
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Zaakceptowana
            </Badge>
          </div>

          {/* Creation Date */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">
                  Data utworzenia konta
                </p>
                <p className="text-sm text-slate-600">
                  Kiedy zostało utworzone Twoje konto
                </p>
              </div>
            </div>
            <span className="text-sm text-slate-600">
              {formatDate(user.metadata?.creationTime || null)}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Metody logowania
        </h3>

        <div className="p-4 bg-slate-50 rounded-lg">
          <UserProviderInfo user={user} />
        </div>
      </div>

      {/* Additional Details Toggle */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? "Ukryj szczegóły" : "Pokaż szczegóły techniczne"}
        </Button>

        {showDetails && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900">Szczegóły techniczne</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Pełne ID:</span>
                <code className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">
                  {user.uid}
                </code>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Email zweryfikowany:</span>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Tak" : "Nie"}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Ostatnie logowanie:</span>
                <span>{formatDate(user.metadata?.lastSignInTime || null)}</span>
              </div>

              {user.providerData && user.providerData.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Szczegóły providera:</span>
                  <div className="mt-1 space-y-1">
                    {user.providerData.map((provider, index) => (
                      <div key={index} className="text-xs">
                        <code className="bg-slate-200 px-2 py-1 rounded">
                          {provider.providerId}: {provider.uid}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
