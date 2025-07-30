"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { changePassword } from "@/lib/auth";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ChangePasswordForm({
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): string | null => {
    if (!formData.currentPassword.trim()) {
      return "Obecne hasło jest wymagane";
    }

    if (formData.newPassword.length < 6) {
      return "Nowe hasło musi mieć co najmniej 6 znaków";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return "Nowe hasła nie są identyczne";
    }

    if (formData.currentPassword === formData.newPassword) {
      return "Nowe hasło musi być różne od obecnego";
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
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess("Hasło zostało pomyślnie zmienione!");

      // Wyczyść formularz
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Po 2 sekundach wywołaj onSuccess
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas zmiany hasła");
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
          Zmień hasło
        </CardTitle>
        <p className="text-slate-600">Aktualizuj hasło swojego konta</p>
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
            <Label htmlFor="currentPassword">Obecne hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Wprowadź obecne hasło"
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                disabled={isSubmitting}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={isSubmitting}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nowe hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Wprowadź nowe hasło (min. 6 znaków)"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                disabled={isSubmitting}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={isSubmitting}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Wprowadź nowe hasło ponownie"
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
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                disabled={isSubmitting}
              >
                {showPasswords.confirm ? (
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
              {isSubmitting ? "Zmienianie..." : "Zmień hasło"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-xs text-center text-slate-500">
          <p>
            Po zmianie hasła będziesz mógł logować się używając nowego hasła.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
