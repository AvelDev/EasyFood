import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useEffect } from "react";

export const usePrivacyProtection = () => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Brak uwierzytelnionego użytkownika - przekieruj na stronę logowania
        router.push("/auth/signin");
      } else if (!user.privacyPolicyAccepted) {
        // Użytkownik nie zaakceptował polityki prywatności - wyloguj go
        router.push("/auth/signin");
      }
    }
  }, [user, loading, router]);

  return { user, loading, isProtected: !!user?.privacyPolicyAccepted };
};
