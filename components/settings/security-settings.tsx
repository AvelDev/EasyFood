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
} from "lucide-react";
import { AuthUser } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { deleteUserAccount } from "@/lib/user-settings";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecuritySettingsProps {
  user: AuthUser;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
    <div className="space-y-6">
      {/* Security Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Status bezpieczeństwa
        </h3>

        <div className="grid gap-3">
          {/* Email Verification */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {user.emailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium text-slate-900">
                  Email zweryfikowany
                </p>
                <p className="text-sm text-slate-600">
                  {user.emailVerified
                    ? "Twój adres email został potwierdzony"
                    : "Email wymaga weryfikacji"}
                </p>
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                user.emailVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {user.emailVerified ? "Zweryfikowany" : "Niezweryfikowany"}
            </div>
          </div>

          {/* Account Security */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">
                  Bezpieczeństwo konta
                </p>
                <p className="text-sm text-slate-600">
                  Konto zabezpieczone przez{" "}
                  {user.providerData?.[0]?.providerId?.includes("google")
                    ? "Google"
                    : "Discord"}
                </p>
              </div>
            </div>
            <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Zabezpieczone
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Zarządzanie sesją
        </h3>

        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-start gap-3">
            <LogOut className="w-5 h-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">Wyloguj się</h4>
              <p className="text-sm text-slate-600 mt-1">
                Zakończ bieżącą sesję i wyloguj się z aplikacji na tym
                urządzeniu.
              </p>
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                variant="outline"
                className="mt-3"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isSigningOut ? "Wylogowywanie..." : "Wyloguj się"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-red-600">
          Strefa niebezpieczna
        </h3>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Operacje w tej sekcji są nieodwracalne. Upewnij się, że rozumiesz
            konsekwencje przed kontynuowaniem.
          </AlertDescription>
        </Alert>

        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Usuń konto</h4>
              <p className="text-sm text-red-700 mt-1">
                Trwale usuwa Twoje konto i wszystkie powiązane dane. Ta operacja
                jest nieodwracalna.
              </p>
              <div className="mt-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeletingAccount}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Usuń konto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Czy na pewno chcesz usunąć konto?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta operacja jest nieodwracalna. Wszystkie Twoje dane, w
                        tym głosy i utworzone ankiety, zostaną trwale usunięte.
                        Po usunięciu konta nie będzie możliwości jego
                        odzyskania.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-red-600 hover:bg-red-700"
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
