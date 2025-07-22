"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Clock, Edit, Trash2 } from "lucide-react";
import { Order } from "@/types";

const orderSchema = z.object({
  dish: z.string().min(1, "Nazwa dania jest wymagana"),
  notes: z.string().optional(),
  cost: z.number().min(0, "Koszt musi być dodatni"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  userOrder: Order | null;
  orderingEnded: boolean;
  submitting: boolean;
  onSubmit: (data: OrderFormData) => void;
  onDelete?: () => void;
}

export function OrderForm({
  userOrder,
  orderingEnded,
  submitting,
  onSubmit,
  onDelete,
}: OrderFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: userOrder
      ? {
          dish: userOrder.dish,
          notes: userOrder.notes,
          cost: userOrder.cost,
        }
      : undefined,
  });

  // Update form when userOrder changes
  useEffect(() => {
    if (userOrder) {
      reset({
        dish: userOrder.dish,
        notes: userOrder.notes,
        cost: userOrder.cost,
      });
    }
  }, [userOrder, reset]);

  const handleFormSubmit = (data: OrderFormData) => {
    onSubmit(data);
    if (!userOrder) {
      // Only reset form for new orders, not updates
      reset();
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (userOrder) {
      reset({
        dish: userOrder.dish,
        notes: userOrder.notes,
        cost: userOrder.cost,
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  if (orderingEnded && !userOrder) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Złóż zamówienie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-700">
              Czas na składanie zamówień minął
            </h3>
            <p className="text-slate-500">
              Nie można już składać nowych zamówień dla tego głosowania.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userOrder && !isEditing) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Twoje zamówienie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h3 className="mb-2 font-semibold text-green-800">
                Zamówienie złożone!
              </h3>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Danie:</strong> {userOrder.dish}
                </div>
                <div>
                  <strong>Koszt:</strong> {userOrder.cost.toFixed(2)} zł
                </div>
                {userOrder.notes && (
                  <div>
                    <strong>Uwagi:</strong> {userOrder.notes}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Zamówione {userOrder.createdAt.toLocaleDateString("pl-PL")}{" "}
                    o{" "}
                    {userOrder.createdAt.toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {!orderingEnded && (
              <div className="flex gap-2">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edytuj zamówienie
                </Button>
                {onDelete && (
                  <Button
                    onClick={onDelete}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń zamówienie
                  </Button>
                )}
              </div>
            )}

            {orderingEnded && (
              <p className="text-sm text-slate-600">
                Czas na modyfikację zamówień minął.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {userOrder ? "Edytuj zamówienie" : "Złóż zamówienie"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className={`space-y-4 ${
            orderingEnded ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {orderingEnded && (
            <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-700">
                Czas na składanie zamówień minął. Nie można już składać nowych
                zamówień.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dish">Nazwa dania</Label>
            <Input
              id="dish"
              placeholder="np. Kurczak Teriyaki"
              {...register("dish")}
            />
            {errors.dish && (
              <p className="text-sm text-red-600">{errors.dish.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Koszt (zł)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("cost", { valueAsNumber: true })}
            />
            {errors.cost && (
              <p className="text-sm text-red-600">{errors.cost.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Uwagi (opcjonalne)</Label>
            <Textarea
              id="notes"
              placeholder="Specjalne instrukcje lub modyfikacje..."
              {...register("notes")}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting || orderingEnded}
              className="flex-1 text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? userOrder
                  ? "Aktualizowanie..."
                  : "Wysyłanie..."
                : orderingEnded
                  ? "Czas składania zamówień minął"
                  : userOrder
                    ? "Zaktualizuj zamówienie"
                    : "Złóż zamówienie"}
            </Button>

            {userOrder && isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
