"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  LogOut,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Mail,
  RefreshCw,
  Key,
} from "lucide-react";
import { AuthUser } from "@/hooks/use-auth";
import {
  signOut,
  isEmailEffectivelyVerified,
  sendEmailVerificationToUser,
  reloadUserData,
  isTrustedProvider,
  hasPasswordProvider,
} from "@/lib/auth";
import { deleteUserAccount } from "@/lib/user-settings";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AddPasswordForm from "@/components/auth/add-password-form";
import ChangePasswordForm from "@/components/auth/change-password-form";

interface SecuritySettingsProps {
  user: AuthUser;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isReloadingData, setIsReloadingData] = useState(false);
  const [showAddPasswordForm, setShowAddPasswordForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Sprawdź, czy email jest efektywnie zweryfikowany
  const emailVerified = isEmailEffectivelyVerified(user);

  // Sprawdź, czy użytkownik ma hasło
  const userHasPassword = hasPasswordProvider(user);

  // Sprawdź, czy użytkownik używa tylko zaufanych providerów
  const onlyTrustedProviders =
    user.providerData?.every((provider) =>
      isTrustedProvider(provider.providerId)
    ) || false;

  const handleSendEmailVerification = async () => {
    setIsSendingVerification(true);
    try {
      await sendEmailVerificationToUser();
      toast({
        title: "Email weryfikacyjny wysłany",
        description:
          "Sprawdź swoją skrzynkę pocztową i kliknij link weryfikacyjny.",
      });
    } catch (error: any) {
      console.error("Error sending email verification:", error);
      toast({
        title: "Błąd wysyłania emaila",
        description:
          error.message || "Nie udało się wysłać emaila weryfikacyjnego.",
        variant: "destructive",
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleReloadUserData = async () => {
    setIsReloadingData(true);
    try {
      await reloadUserData();
      toast({
        title: "Dane odświeżone",
        description: "Status weryfikacji został zaktualizowany.",
      });
      // Przeładuj stronę, aby zaktualizować interfejs
      window.location.reload();
    } catch (error: any) {
      console.error("Error reloading user data:", error);
      toast({
        title: "Błąd odświeżania",
        description: error.message || "Nie udało się odświeżyć danych.",
        variant: "destructive",
      });
    } finally {
      setIsReloadingData(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Wylogowano pomyślnie",
        description: "Zostałeś wylogowany z aplikacji.",
      });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Błąd wylogowania",
        description: "Nie udało się wylogować. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(user.uid);
      toast({
        title: "Konto zostało usunięte",
        description: "Twoje konto zostało trwale usunięte.",
      });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Błąd usuwania konta",
        description: "Nie udało się usunąć konta. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Security Status */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
          Status bezpieczeństwa
        </h3>

        <div className="grid gap-3 sm:gap-4">
          {/* Email Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 lg:p-6 rounded-lg gap-3 sm:gap-4 lg:gap-6 bg-slate-50">
            <div className="flex items-center gap-3 sm:gap-4">
              {emailVerified ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-600 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                  Email zweryfikowany
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                  {emailVerified
                    ? onlyTrustedProviders
                      ? "Zweryfikowany przez zaufanego dostawcę uwierzytelniania"
                      : "Twój adres email został potwierdzony"
                    : "Email wymaga weryfikacji"}
                </p>
                {!emailVerified && !onlyTrustedProviders && (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendEmailVerification}
                      disabled={isSendingVerification}
                      className="text-xs"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {isSendingVerification
                        ? "Wysyłanie..."
                        : "Wyślij email weryfikacyjny"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReloadUserData}
                      disabled={isReloadingData}
                      className="text-xs"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {isReloadingData ? "Odświeżanie..." : "Odśwież status"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`px-3 py-2 rounded text-xs sm:text-sm font-medium self-start sm:self-auto ${
                emailVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {emailVerified ? "Zweryfikowany" : "Niezweryfikowany"}
            </div>
          </div>

          {/* Account Security */}
        </div>
      </div>

      {/* Password Management */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
          Zarządzanie hasłem
        </h3>

        <div className="p-4 sm:p-5 lg:p-6 border rounded-lg border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 lg:gap-6">
            <Key className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                {userHasPassword ? "Hasło konta" : "Dodaj hasło"}
              </h4>
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-600">
                {userHasPassword
                  ? "Twoje konto ma ustawione hasło. Możesz je zmienić w ustawieniach bezpieczeństwa."
                  : "Dodaj hasło do swojego konta, aby móc logować się bez external providerów i zwiększyć bezpieczeństwo."}
              </p>

              {!userHasPassword && (
                <>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-800">
                      <strong>Korzyści z dodania hasła:</strong>
                    </p>
                    <ul className="mt-1 text-xs sm:text-sm text-blue-700 space-y-1">
                      <li>
                        • Możliwość logowania bez Google/Microsoft/Discord
                      </li>
                      <li>• Dodatkowa warstwa bezpieczeństwa</li>
                      <li>• Backup w przypadku problemów z OAuth</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setShowAddPasswordForm(true)}
                    variant="outline"
                    className="mt-4 w-full sm:w-auto min-w-[160px] h-10 sm:h-11"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Dodaj hasło
                  </Button>
                </>
              )}

              {userHasPassword && (
                <>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-green-800">
                        Hasło jest skonfigurowane
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowChangePasswordForm(true)}
                    variant="outline"
                    className="mt-4 w-full sm:w-auto min-w-[160px] h-10 sm:h-11"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Zmień hasło
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show Add Password Form */}
      {showAddPasswordForm && (
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <AddPasswordForm
            onSuccess={() => {
              setShowAddPasswordForm(false);
              toast({
                title: "Hasło dodane pomyślnie",
                description: "Możesz teraz logować się używając email i hasło.",
              });
              // Przeładuj stronę, aby zaktualizować status
              setTimeout(() => window.location.reload(), 2000);
            }}
            onCancel={() => setShowAddPasswordForm(false)}
          />
        </div>
      )}

      {/* Show Change Password Form */}
      {showChangePasswordForm && (
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <ChangePasswordForm
            onSuccess={() => {
              setShowChangePasswordForm(false);
              toast({
                title: "Hasło zmienione pomyślnie",
                description: "Twoje hasło zostało zaktualizowane.",
              });
            }}
            onCancel={() => setShowChangePasswordForm(false)}
          />
        </div>
      )}

      {/* Session Management */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
          Zarządzanie sesją
        </h3>

        <div className="p-4 sm:p-5 lg:p-6 border rounded-lg border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 lg:gap-6">
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm sm:text-base lg:text-lg text-slate-900">
                Wyloguj się
              </h4>
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-600">
                Zakończ bieżącą sesję i wyloguj się z aplikacji na tym
                urządzeniu.
              </p>
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                variant="outline"
                className="mt-4 w-full sm:w-auto min-w-[160px] h-10 sm:h-11"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isSigningOut ? "Wylogowywanie..." : "Wyloguj się"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-red-600">
          Strefa niebezpieczna
        </h3>

        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          <AlertDescription className="text-sm sm:text-base text-red-800">
            Operacje w tej sekcji są nieodwracalne. Upewnij się, że rozumiesz
            konsekwencje przed kontynuowaniem.
          </AlertDescription>
        </Alert>

        <div className="p-4 sm:p-5 lg:p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 lg:gap-6">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm sm:text-base lg:text-lg text-red-900">
                Usuń konto
              </h4>
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-red-700">
                Trwale usuwa Twoje konto i wszystkie powiązane dane. Ta operacja
                jest nieodwracalna.
              </p>
              <div className="mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isDeletingAccount}
                      className="w-full sm:w-auto min-w-[140px] h-10 sm:h-11"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Usuń konto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 sm:mx-6 lg:mx-auto max-w-lg lg:max-w-xl">
                    <AlertDialogHeader className="space-y-3">
                      <AlertDialogTitle className="text-base sm:text-lg lg:text-xl">
                        Czy na pewno chcesz usunąć konto?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm sm:text-base text-slate-600">
                        Ta operacja jest nieodwracalna. Wszystkie Twoje dane, w
                        tym głosy i utworzone ankiety, zostaną trwale usunięte.
                        Po usunięciu konta nie będzie możliwości jego
                        odzyskania.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 pt-4">
                      <AlertDialogCancel className="w-full sm:w-auto min-w-[100px] h-10 sm:h-11">
                        Anuluj
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-red-600 hover:bg-red-700 w-full sm:w-auto min-w-[140px] h-10 sm:h-11"
                      >
                        {isDeletingAccount ? "Usuwanie..." : "Tak, usuń konto"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
