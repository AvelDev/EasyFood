"use client";

import { useEffect } from "react";
import Script from "next/script";

interface MicrosoftClarityProps {
  projectId: string;
  enabled?: boolean;
}

export function MicrosoftClarity({
  projectId,
  enabled = true,
}: MicrosoftClarityProps) {
  useEffect(() => {
    if (!enabled || !projectId || typeof window === "undefined") {
      return;
    }

    // Sprawdź czy Clarity już nie jest załadowana
    if ((window as any).clarity) {
      return;
    }

    // Inicjalizacja Microsoft Clarity
    const clarityScript = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");
    `;

    const script = document.createElement("script");
    script.innerHTML = clarityScript;
    document.head.appendChild(script);

    return () => {
      // Cleanup - usunięcie skryptu gdy komponent jest demontowany
      const existingScript = document.querySelector(
        `script[src*="clarity.ms/tag/${projectId}"]`,
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [projectId, enabled]);

  if (!enabled || !projectId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `,
      }}
    />
  );
}

// Funkcje pomocnicze do korzystania z Clarity API
export const clarityAPI = {
  // Identyfikowanie użytkownika
  identify: (
    userId: string,
    sessionId?: string,
    pageId?: string,
    userHint?: string,
  ) => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("identify", userId, sessionId, pageId, userHint);
    }
  },

  // Ustawianie tagów
  set: (key: string, value: string) => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("set", key, value);
    }
  },

  // Zgoda na wykorzystanie danych
  consent: () => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("consent");
    }
  },

  // Rozpoczęcie nagrywania
  start: () => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("start");
    }
  },

  // Zatrzymanie nagrywania
  stop: () => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("stop");
    }
  },

  // Śledzenie niestandardowych zdarzeń
  event: (name: string) => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("event", name);
    }
  },

  // Upgrade sesji (zwiększenie priorytet nagrywania)
  upgrade: (reason: string) => {
    if (typeof window !== "undefined" && (window as any).clarity) {
      (window as any).clarity("upgrade", reason);
    }
  },
};

// Hook dla łatwiejszego wykorzystania w komponentach React
export function useClarity() {
  return clarityAPI;
}
