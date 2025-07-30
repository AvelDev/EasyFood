"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, User, Calendar, CheckCircle } from "lucide-react";
import { AuthUser } from "@/hooks/use-auth";
import { isEmailEffectivelyVerified } from "@/lib/auth";
import UserProviderInfo from "@/components/user-provider-info";

interface AccountSettingsProps {
  user: AuthUser;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Sprawdź, czy email jest efektywnie zweryfikowany (Firebase lub zaufany provider)
  const emailVerified = isEmailEffectivelyVerified(user);

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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Account Overview */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
          Informacje o koncie
        </h3>

        <div className="grid gap-3 sm:gap-4 lg:gap-5">
          {/* User ID */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 lg:p-6 rounded-lg gap-3 sm:gap-4 lg:gap-6 bg-slate-50">
            <div className="flex items-center gap-3 sm:gap-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                  ID użytkownika
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                  Unikalny identyfikator konta
                </p>
              </div>
            </div>
            <code className="px-3 py-2 font-mono text-xs sm:text-sm rounded bg-slate-200 self-start sm:self-auto break-all sm:break-normal">
              {user.uid.substring(0, 8)}...
            </code>
          </div>

          {/* Role */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 lg:p-6 rounded-lg gap-3 sm:gap-4 lg:gap-6 bg-slate-50">
            <div className="flex items-center gap-3 sm:gap-4">
              {user.role === "admin" ? (
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-600 flex-shrink-0" />
              ) : (
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                  Rola w systemie
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                  {user.role === "admin"
                    ? "Pełne uprawnienia administratora"
                    : "Standardowe uprawnienia użytkownika"}
                </p>
              </div>
            </div>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className={
                user.role === "admin"
                  ? "bg-yellow-100 text-yellow-800 self-start sm:self-auto text-sm"
                  : "self-start sm:self-auto text-sm"
              }
            >
              {user.role === "admin" ? "Administrator" : "Użytkownik"}
            </Badge>
          </div>

          {/* Privacy Policy Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 lg:p-6 rounded-lg gap-3 sm:gap-4 lg:gap-6 bg-slate-50">
            <div className="flex items-center gap-3 sm:gap-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                  Polityka prywatności
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                  Status akceptacji polityki prywatności
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-green-700 border-green-200 bg-green-50 self-start sm:self-auto text-sm"
            >
              Zaakceptowana
            </Badge>
          </div>

          {/* Creation Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 lg:p-6 rounded-lg gap-3 sm:gap-4 lg:gap-6 bg-slate-50">
            <div className="flex items-center gap-3 sm:gap-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                  Data utworzenia konta
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                  Kiedy zostało utworzone Twoje konto
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm lg:text-base text-slate-600 self-start sm:self-auto">
              {formatDate(user.metadata?.creationTime || null)}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Information */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
          Metody logowania
        </h3>

        <div className="p-4 sm:p-5 lg:p-6 rounded-lg bg-slate-50">
          <UserProviderInfo user={user} />
        </div>
      </div>

      {/* Additional Details Toggle */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
        >
          {showDetails ? "Ukryj szczegóły" : "Pokaż szczegóły techniczne"}
        </Button>

        {showDetails && (
          <div className="p-4 sm:p-5 lg:p-6 rounded-lg space-y-4 sm:space-y-5 lg:space-y-6 bg-slate-50">
            <h4 className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
              Szczegóły techniczne
            </h4>

            <div className="text-xs sm:text-sm lg:text-base space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                <span className="text-slate-600 font-medium">Pełne ID:</span>
                <code className="px-3 py-2 font-mono text-xs sm:text-sm rounded bg-slate-200 break-all block sm:inline-block">
                  {user.uid}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                <span className="text-slate-600 font-medium">
                  Email zweryfikowany:
                </span>
                <Badge
                  variant={emailVerified ? "default" : "secondary"}
                  className="self-start sm:self-auto text-xs sm:text-sm"
                >
                  {emailVerified ? "Tak" : "Nie"}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                <span className="text-slate-600 font-medium">
                  Ostatnie logowanie:
                </span>
                <span className="text-xs sm:text-sm lg:text-base text-slate-700">
                  {formatDate(user.metadata?.lastSignInTime || null)}
                </span>
              </div>

              {user.providerData && user.providerData.length > 0 && (
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <span className="text-slate-600 font-medium block mb-3 sm:mb-4">
                    Szczegóły providera:
                  </span>
                  <div className="space-y-3 sm:space-y-4">
                    {user.providerData.map((provider, index) => (
                      <div key={index} className="text-xs sm:text-sm">
                        <code className="px-3 py-2 rounded bg-slate-200 break-all block text-xs sm:text-sm">
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
