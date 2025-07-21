"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, TestTube, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/auth-context";
import { useAnalyticsEvents } from "@/components/analytics";
import {
  getAppSettings,
  updateAppSettings,
  testDiscordWebhook,
} from "@/lib/admin-settings";

export function WebhookSettings() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { trackSettingsOpened, trackWebhookConfigured, trackError } =
    useAnalyticsEvents();

  useEffect(() => {
    // Śledź otwarcie ustawień webhook
    trackSettingsOpened("webhook");
  }, [trackSettingsOpened]);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const settings = await getAppSettings();
      setWebhookUrl(settings?.discordWebhookUrl || "");
    } catch (error) {
      console.error("Error loading settings:", error);
      trackError(
        "webhook_settings_load",
        error instanceof Error ? error.message : "Unknown error"
      );
      toast({
        title: "Błąd",
        description: "Nie udało się załadować ustawień.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, trackError]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleWebhookUrlChange = (value: string) => {
    setWebhookUrl(value);
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      await updateAppSettings(
        {
          discordWebhookUrl: webhookUrl.trim() || undefined,
        },
        user.uid
      );

      setHasChanges(false);
      trackWebhookConfigured();
      toast({
        title: "Sukces",
        description: "Ustawienia zostały zapisane.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      trackError(
        "webhook_settings_save",
        error instanceof Error ? error.message : "Unknown error"
      );
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź URL webhook przed testem.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTesting(true);

      await testDiscordWebhook(webhookUrl.trim());

      toast({
        title: "Sukces",
        description: "Webhook działa poprawnie!",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      trackError(
        "webhook_test",
        error instanceof Error ? error.message : "Unknown error"
      );
      toast({
        title: "Błąd",
        description: "Webhook nie działa. Sprawdź URL i uprawnienia.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isValidWebhookUrl = (url: string) => {
    return (
      url.startsWith("https://discord.com/api/webhooks/") ||
      url.startsWith("https://discordapp.com/api/webhooks/")
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-slate-200 rounded mb-4"></div>
          <div className="h-8 bg-slate-200 rounded w-1/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Webhook Discord</h3>
        <p className="text-sm text-slate-600 mb-4">
          Konfiguruj webhook Discord, aby otrzymywać powiadomienia o nowych
          głosowaniach i zamówieniach.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">URL Webhook Discord</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => handleWebhookUrlChange(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className={
                  webhookUrl && !isValidWebhookUrl(webhookUrl)
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {webhookUrl && !isValidWebhookUrl(webhookUrl) && (
                <p className="text-sm text-red-600 mt-1">
                  URL musi zaczynać się od https://discord.com/api/webhooks/ lub
                  https://discordapp.com/api/webhooks/
                </p>
              )}
            </div>

            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                Aby utworzyć webhook Discord:
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Wejdź na swój serwer Discord</li>
                  <li>Kliknij prawym przyciskiem na kanał</li>
                  <li>
                    Wybierz &quot;Edytuj kanał&quot; → &quot;Integracje&quot; →
                    &quot;Webhooks&quot;
                  </li>
                  <li>Kliknij &quot;Nowy webhook&quot; i skopiuj URL</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveSettings}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Zapisywanie..." : "Zapisz ustawienia"}
              </Button>

              <Button
                variant="outline"
                onClick={handleTestWebhook}
                disabled={
                  !webhookUrl.trim() ||
                  !isValidWebhookUrl(webhookUrl) ||
                  isTesting
                }
                className="gap-2"
              >
                <TestTube className="w-4 h-4" />
                {isTesting ? "Testowanie..." : "Testuj webhook"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
