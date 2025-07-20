import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useEffect } from "react";

export const usePrivacyProtection = (redirectAfterLogin?: string) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Brak uwierzytelnionego użytkownika - przekieruj na stronę logowania
        const loginUrl = redirectAfterLogin
          ? `/auth/signin?redirect=${encodeURIComponent(redirectAfterLogin)}`
          : "/auth/signin";
        router.push(loginUrl);
      } else if (!user.privacyPolicyAccepted) {
        // Użytkownik nie zaakceptował polityki prywatności - wyloguj go
        const loginUrl = redirectAfterLogin
          ? `/auth/signin?redirect=${encodeURIComponent(redirectAfterLogin)}`
          : "/auth/signin";
        router.push(loginUrl);
      }
    }
  }, [user, loading, router, redirectAfterLogin]);

  return { user, loading, isProtected: !!user?.privacyPolicyAccepted };
};
