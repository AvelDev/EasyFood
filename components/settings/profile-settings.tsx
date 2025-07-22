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
    <div className="space-y-6">
      {/* Current User Info */}
      <div className="flex items-center p-4 rounded-lg gap-4 bg-slate-50">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1 gap-2">
            <h3 className="text-lg font-semibold truncate text-slate-900">
              {user.displayName || "Użytkownik"}
            </h3>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className={
                user.role === "admin" ? "bg-yellow-100 text-yellow-800" : ""
              }
            >
              {user.role === "admin" && <Crown className="w-3 h-3 mr-1" />}
              {user.role === "admin" ? "Administrator" : "Użytkownik"}
            </Badge>
          </div>
          <p className="text-sm truncate text-slate-600">{user.email}</p>
        </div>
      </div>

      {/* Name Editor */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nazwa wyświetlana</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Wprowadź swoją nazwę"
            className="max-w-md"
          />
          <p className="text-sm text-slate-600">
            Ta nazwa będzie widoczna dla innych użytkowników w aplikacji.
          </p>
        </div>

        {hasChanges && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Masz niezapisane zmiany. Kliknij &ldquo;Zapisz&rdquo;, aby je
              zachować.
            </AlertDescription>
          </Alert>
        )}

        {hasChanges && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !displayName.trim()}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Anuluj
            </Button>
          </div>
        )}
      </div>

      {/* Role Information */}
      <div className="space-y-2">
        <Label>Twoja rola</Label>
        <div className="p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Crown className="w-4 h-4 text-yellow-600" />
            )}
            <span className="font-medium">
              {user.role === "admin" ? "Administrator" : "Użytkownik"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {user.role === "admin"
              ? "Masz pełne uprawnienia do zarządzania aplikacją."
              : "Możesz tworzyć i uczestniczyć w głosowaniach na jedzenie."}
          </p>
        </div>
      </div>
    </div>
  );
}
