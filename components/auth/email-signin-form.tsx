"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { signInWithEmail, resetPassword } from "@/lib/auth";
import { User as FirebaseUser } from "firebase/auth";

interface EmailSigninFormProps {
  onSuccess: (user: FirebaseUser, needsPrivacyConsent: boolean) => void;
  onSwitchToSignUp: () => void;
  isLoading?: boolean;
}

export default function EmailSigninForm({
  onSuccess,
  onSwitchToSignUp,
  isLoading = false,
}: EmailSigninFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email i hasło są wymagane");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signInWithEmail(
        formData.email.trim(),
        formData.password
      );

      onSuccess(result.user, result.needsPrivacyConsent);
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas logowania");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError("Wprowadź adres email, aby zresetować hasło");
      return;
    }

    setIsResettingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      await resetPassword(formData.email.trim());
      setSuccess(
        "Wysłano email z instrukcjami resetowania hasła. Sprawdź swoją skrzynkę pocztową."
      );
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas resetowania hasła");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const disabled = isLoading || isSubmitting || isResettingPassword;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">
          Zaloguj się
        </CardTitle>
        <p className="text-slate-600">Wprowadź swoje dane logowania</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Wprowadź swoje hasło"
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

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={disabled}
            >
              {isResettingPassword ? "Wysyłanie..." : "Zapomniałeś hasła?"}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={disabled}>
            {isSubmitting ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Nie masz konta?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={disabled}
            >
              Utwórz konto
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
