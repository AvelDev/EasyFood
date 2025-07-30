"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { createUserWithEmail } from "@/lib/auth";
import { User as FirebaseUser } from "firebase/auth";

interface EmailSignupFormProps {
  onSuccess: (user: FirebaseUser, needsPrivacyConsent: boolean) => void;
  onSwitchToSignIn: () => void;
  isLoading?: boolean;
}

export default function EmailSignupForm({
  onSuccess,
  onSwitchToSignIn,
  isLoading = false,
}: EmailSignupFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) {
      return "Email jest wymagany";
    }

    if (!formData.email.includes("@")) {
      return "Podaj prawidłowy adres email";
    }

    if (!formData.displayName.trim()) {
      return "Imię jest wymagane";
    }

    if (formData.password.length < 6) {
      return "Hasło musi mieć co najmniej 6 znaków";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Hasła nie są identyczne";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createUserWithEmail(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim()
      );

      onSuccess(result.user, result.needsPrivacyConsent);
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas tworzenia konta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">
          Utwórz konto
        </CardTitle>
        <p className="text-slate-600">
          Wprowadź swoje dane, aby utworzyć nowe konto
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Imię</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="displayName"
                type="text"
                placeholder="Wprowadź swoje imię"
                value={formData.displayName}
                onChange={(e) =>
                  handleInputChange("displayName", e.target.value)
                }
                disabled={disabled}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="Wprowadź swój email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={disabled}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Wprowadź hasło (min. 6 znaków)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={disabled}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Wprowadź hasło ponownie"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={disabled}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={disabled}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={disabled}>
            {isSubmitting ? "Tworzenie konta..." : "Utwórz konto"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Masz już konto?{" "}
            <button
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={disabled}
            >
              Zaloguj się
            </button>
          </p>
        </div>

        <div className="mt-4 text-xs text-center text-slate-500">
          <p>
            Po utworzeniu konta, wyślemy Ci email weryfikacyjny. Sprawdź swoją
            skrzynkę pocztową.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
