"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { AnalyticsProvider } from "@/components/analytics";

interface ProvidersProps {
  children: ReactNode;
}

// Konfiguracja analityki - możesz przenieść to do zmiennych środowiskowych
const analyticsConfig = {
  clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  enableClarity: process.env.NEXT_PUBLIC_ENABLE_CLARITY === "true",
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AnalyticsProvider config={analyticsConfig}>{children}</AnalyticsProvider>
    </AuthProvider>
  );
}
