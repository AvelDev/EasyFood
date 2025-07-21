"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { MicrosoftClarity, clarityAPI } from "./microsoft-clarity";
import { useAuthContext } from "@/contexts/auth-context";

interface AnalyticsConfig {
  clarityProjectId?: string;
  enableClarity?: boolean;
}

interface AnalyticsContextType {
  config: AnalyticsConfig;
  clarity: typeof clarityAPI;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

interface AnalyticsProviderProps {
  children: ReactNode;
  config: AnalyticsConfig;
}

export function AnalyticsProvider({
  children,
  config,
}: AnalyticsProviderProps) {
  const { user } = useAuthContext();

  useEffect(() => {
    // Identyfikuj użytkownika w Clarity gdy się zaloguje
    if (user && config.enableClarity) {
      clarityAPI.identify(
        user.uid,
        undefined,
        undefined,
        user.email || undefined
      );

      // Ustaw dodatkowe tagi
      clarityAPI.set("user_authenticated", "true");
      if (user.email) {
        clarityAPI.set("user_email_domain", user.email.split("@")[1]);
      }
    }
  }, [user, config.enableClarity]);

  return (
    <AnalyticsContext.Provider value={{ config, clarity: clarityAPI }}>
      {children}
      {config.enableClarity && config.clarityProjectId && (
        <MicrosoftClarity
          projectId={config.clarityProjectId}
          enabled={config.enableClarity}
        />
      )}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

// Hook do łatwego śledzenia zdarzeń
export function useAnalyticsEvents() {
  const { clarity } = useAnalytics();

  return {
    // Śledzenie akcji związanych z głosowaniem
    trackPollCreated: () => clarity.event("poll_created"),
    trackPollVoted: (pollId: string) => {
      clarity.set("last_voted_poll", pollId);
      clarity.event("poll_voted");
    },
    trackPollShared: () => clarity.event("poll_shared"),

    // Śledzenie akcji związanych z zamówieniami
    trackOrderPlaced: (restaurantName: string) => {
      clarity.set("last_order_restaurant", restaurantName);
      clarity.event("order_placed");
    },
    trackOrderCancelled: () => clarity.event("order_cancelled"),

    // Śledzenie akcji związanych z ustawieniami
    trackSettingsOpened: (section: string) => {
      clarity.set("settings_section", section);
      clarity.event("settings_opened");
    },
    trackWebhookConfigured: () => clarity.event("webhook_configured"),

    // Śledzenie błędów
    trackError: (errorType: string, errorMessage?: string) => {
      clarity.set("error_type", errorType);
      if (errorMessage) {
        clarity.set("error_message", errorMessage.substring(0, 100)); // Ograniczenie długości
      }
      clarity.event("error_occurred");
    },

    // Śledzenie ważnych momentów w sesji
    trackImportantAction: (action: string) => {
      clarity.upgrade(`Important action: ${action}`);
      clarity.event(`important_${action}`);
    },
  };
}
