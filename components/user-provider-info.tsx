"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, CheckCircle } from "lucide-react";
import {
  getProviderData,
  linkProviderToAccount,
  AuthProviderType,
} from "@/lib/auth";

interface UserProviderInfoProps {
  user: User;
}

export default function UserProviderInfo({ user }: UserProviderInfoProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const providers = getProviderData(user);
  const linkedProviderIds = providers.map((p) => p.providerId);

  const availableProviders: {
    id: AuthProviderType;
    name: string;
    providerId: string;
  }[] = [
    { id: "google", name: "Google", providerId: "google.com" },
    { id: "discord", name: "Discord", providerId: "oidc.discord" },
    { id: "microsoft", name: "Microsoft", providerId: "microsoft.com" },
  ];

  const unlinkedProviders = availableProviders.filter(
    (provider) => !linkedProviderIds.includes(provider.providerId)
  );

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case "google.com":
        return "Google";
      case "oidc.discord":
        return "Discord";
      case "microsoft.com":
        return "Microsoft";
      default:
        return providerId;
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "google.com":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case "oidc.discord":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z" />
          </svg>
        );
      case "microsoft.com":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleLinkProvider = async (providerType: AuthProviderType) => {
    try {
      setIsLinking(true);
      setLinkError(null);
      setLinkSuccess(null);

      await linkProviderToAccount(providerType);
      setLinkSuccess(
        `Pomyślnie połączono konto ${
          availableProviders.find((p) => p.id === providerType)?.name
        }`
      );

      // Odśwież stronę po krótkim czasie, aby zaktualizować dane
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setLinkError(error.message);
    } finally {
      setIsLinking(false);
    }
  };

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Połączone konta */}
      <div>
        <h4 className="text-sm font-medium text-slate-900 mb-3">
          Połączone konta
        </h4>
        <div className="space-y-2">
          {providers.map((provider) => (
            <div
              key={provider.providerId}
              className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-green-600">
                  {getProviderIcon(provider.providerId)}
                </div>
                <div>
                  <div className="text-sm font-medium text-green-900">
                    {getProviderName(provider.providerId)}
                  </div>
                  <div className="text-xs text-green-700">{provider.email}</div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-green-700 border-green-300 bg-green-100"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Połączone
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Dostępne do połączenia */}
      {unlinkedProviders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3">
            Dostępne do połączenia
          </h4>
          <div className="space-y-2">
            {unlinkedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-slate-600">
                    {getProviderIcon(provider.providerId)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {provider.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      Połącz konto {provider.name} z tym kontem
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkProvider(provider.id)}
                  disabled={isLinking}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {isLinking ? "Łączenie..." : "Połącz"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Komunikaty */}
      {linkError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{linkError}</AlertDescription>
        </Alert>
      )}

      {linkSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {linkSuccess}
          </AlertDescription>
        </Alert>
      )}

      {/* Informacje pomocne */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="text-xs text-blue-800">
          <strong>Dlaczego łączyć konta?</strong>
          <br />
          Połączenie wielu metod logowania pozwala na większą elastyczność -
          możesz zalogować się używając dowolnej z połączonych metod.
        </div>
      </div>
    </div>
  );
}
