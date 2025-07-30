"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, User, Save, AlertCircle } from "lucide-react";
import { AuthUser } from "@/hooks/use-auth";
import { updateUserProfile } from "@/lib/user-settings";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileSettingsProps {
  user: AuthUser;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleNameChange = (value: string) => {
    setDisplayName(value);
    setHasChanges(value !== user.displayName);
  };

  const handleSave = async () => {
    if (!hasChanges || !displayName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, { name: displayName.trim() });
      setHasChanges(false);
      toast({
        title: "Profil zaktualizowany",
        description: "Twoje dane zostały pomyślnie zapisane.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować profilu. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDisplayName(user.displayName || "");
    setHasChanges(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Current User Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 lg:p-6 rounded-lg gap-3 sm:gap-4 lg:gap-6 bg-slate-50">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full">
            <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-1 gap-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 break-words">
              {user.displayName || "Użytkownik"}
            </h3>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className={
                user.role === "admin"
                  ? "bg-yellow-100 text-yellow-800 self-start sm:self-auto text-sm"
                  : "self-start sm:self-auto text-sm"
              }
            >
              {user.role === "admin" && <Crown className="w-3 h-3 mr-1" />}
              {user.role === "admin" ? "Administrator" : "Użytkownik"}
            </Badge>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 break-all">
            {user.email}
          </p>
        </div>
      </div>

      {/* Name Editor */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <Label
            htmlFor="displayName"
            className="text-sm sm:text-base font-medium"
          >
            Nazwa wyświetlana
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Wprowadź swoją nazwę"
            className="w-full sm:max-w-md lg:max-w-lg text-sm sm:text-base"
          />
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">
            Ta nazwa będzie widoczna dla innych użytkowników w aplikacji.
          </p>
        </div>

        {hasChanges && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm sm:text-base text-amber-800">
              Masz niezapisane zmiany. Kliknij &ldquo;Zapisz&rdquo;, aby je
              zachować.
            </AlertDescription>
          </Alert>
        )}

        {hasChanges && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !displayName.trim()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px] h-10 sm:h-11"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[100px] h-10 sm:h-11"
            >
              Anuluj
            </Button>
          </div>
        )}
      </div>

      {/* Role Information */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-sm sm:text-base font-medium">Twoja rola</Label>
        <div className="p-4 sm:p-5 lg:p-6 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2 sm:gap-3">
            {user.role === "admin" && (
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
            )}
            <span className="font-medium text-sm sm:text-base lg:text-lg">
              {user.role === "admin" ? "Administrator" : "Użytkownik"}
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-600">
            {user.role === "admin"
              ? "Masz pełne uprawnienia do zarządzania aplikacją."
              : "Możesz tworzyć i uczestniczyć w głosowaniach na jedzenie."}
          </p>
        </div>
      </div>
    </div>
  );
}
