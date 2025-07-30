"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { addPasswordToAccount } from "@/lib/auth";

interface AddPasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddPasswordForm({
  onSuccess,
  onCancel,
}: AddPasswordFormProps) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): string | null => {
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
    setSuccess(null);

    try {
      await addPasswordToAccount(formData.password);
      setSuccess("Hasło zostało pomyślnie dodane do Twojego konta!");

      // Po 2 sekundach wywołaj onSuccess
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas dodawania hasła");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="w-12 h-12 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">
          Dodaj hasło do konta
        </CardTitle>
        <p className="text-slate-600">
          Zwiększ bezpieczeństwo swojego konta dodając hasło
        </p>
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

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Dlaczego warto dodać hasło?</strong>
          </p>
          <ul className="mt-2 text-sm text-blue-700 space-y-1">
            <li>• Możliwość logowania bez zewnętrznych providerów</li>
            <li>• Dodatkowa warstwa bezpieczeństwa</li>
            <li>• Backup w przypadku problemów z OAuth</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Wprowadź hasło (min. 6 znaków)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isSubmitting}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Anuluj
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Dodawanie..." : "Dodaj hasło"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-xs text-center text-slate-500">
          <p>
            Po dodaniu hasła będziesz mógł logować się używając email i hasło
            lub dalej korzystać z OAuth providerów.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
