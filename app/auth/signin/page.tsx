"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, AlertCircle } from "lucide-react";
import { signInWithProvider, acceptPrivacyPolicy } from "@/lib/auth";
import { useAuthContext } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrivacyPolicyDialog } from "@/components/privacy-policy-dialog";
import { User } from "firebase/auth";

export default function SignIn() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSignIn = async (provider: "google" | "discord") => {
    try {
      setIsSigningIn(true);
      setError(null);

      const result = await signInWithProvider(provider);

      if (result.needsPrivacyConsent) {
        // Użytkownik musi zaakceptować politykę prywatności
        setPendingUser(result.user);
        setShowPrivacyDialog(true);
      } else {
        // Użytkownik już zaakceptował politykę prywatności
        // useEffect obsłuży przekierowanie gdy kontekst auth zostanie zaktualizowany
      }
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(error.message || "Wystąpił błąd podczas logowania");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePrivacyAccept = async () => {
    if (!pendingUser) return;

    try {
      setIsSigningIn(true);
      await acceptPrivacyPolicy(pendingUser);
      setShowPrivacyDialog(false);
      setPendingUser(null);
      // Nie przekierowujemy tutaj - useEffect obsłuży przekierowanie
      // gdy kontekst auth zostanie zaktualizowany
    } catch (error: any) {
      console.error("Error accepting privacy policy:", error);
      setError("Wystąpił błąd podczas akceptacji polityki prywatności");
      setShowPrivacyDialog(false);
      setPendingUser(null);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePrivacyDecline = async () => {
    // Wyloguj użytkownika jeśli odrzuci politykę prywatności
    if (pendingUser) {
      try {
        const { signOut } = await import("@/lib/auth");
        await signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }

    setShowPrivacyDialog(false);
    setPendingUser(null);
    setError(
      "Akceptacja polityki prywatności jest wymagana do korzystania z aplikacji"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Vote className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Zaloguj się do Restaurant Voting
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Dołącz do swojego zespołu w głosowaniu na restauracje i składaniu
              zamówień
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                onClick={() => handleSignIn("google")}
                disabled={isSigningIn}
                className="w-full bg-[#4285f4] hover:bg-[#3367d6] text-white text-lg py-6"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                {isSigningIn ? "Logowanie..." : "Kontynuuj z Google"}
              </Button>

              <Button
                onClick={() => handleSignIn("discord")}
                disabled={isSigningIn}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white text-lg py-6"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z" />
                </svg>
                {isSigningIn ? "Logowanie..." : "Kontynuuj z Discord"}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-600">
              <p>
                Logując się, wyrażasz zgodę na uczestnictwo w głosowaniach na
                restauracje i koordynację zamówień zespołowych.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PrivacyPolicyDialog
        isOpen={showPrivacyDialog}
        onAccept={handlePrivacyAccept}
        onDecline={handlePrivacyDecline}
      />
    </>
  );
}
