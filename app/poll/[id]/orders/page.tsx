"use client";

import { useEffect, useState } from "react";
import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Poll, Order } from "@/types";
import { getPoll, getOrders, getUserOrder, addOrder } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, User, Clock } from "lucide-react";

const orderSchema = z.object({
  dish: z.string().min(1, "Nazwa dania jest wymagana"),
  notes: z.string().optional(),
  cost: z.number().min(0, "Koszt musi być dodatni"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrdersPageProps {
  params: {
    id: string;
  };
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const { user, loading: authLoading, isProtected } = usePrivacyProtection();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrder, setUserOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pollData = await getPoll(params.id);
        if (pollData) {
          setPoll(pollData);
          const ordersData = await getOrders(params.id);
          setOrders(ordersData);

          if (user?.uid) {
            const userOrderData = await getUserOrder(params.id, user.uid);
            setUserOrder(userOrderData);

            if (userOrderData) {
              setValue("dish", userOrderData.dish);
              setValue("notes", userOrderData.notes);
              setValue("cost", userOrderData.cost);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      fetchData();
    }
  }, [params.id, user, setValue]);

  const onSubmit = async (data: OrderFormData) => {
    if (!user?.uid || !poll) return;

    setSubmitting(true);
    try {
      const orderData: Order = {
        userId: user.uid,
        dish: data.dish,
        notes: data.notes || "",
        cost: data.cost,
        createdAt: new Date(),
      };

      await addOrder(params.id, orderData);
      setUserOrder(orderData);

      // Refresh orders
      const updatedOrders = await getOrders(params.id);
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-600 mb-4">
          Głosowanie nie zostało znalezione
        </h2>
        <Button onClick={() => router.push("/")}>Powrót do strony głównej</Button>
      </div>
    );
  }

  if (!poll.closed) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-600 mb-4">
          Głosowanie jest nadal aktywne
        </h2>
        <p className="text-slate-500 mb-6">
          Poczekaj na zakończenie głosowania przed składaniem zamówień
        </p>
        <Button onClick={() => router.push(`/poll/${poll.id}`)}>
          Przejdź do głosowania
        </Button>
      </div>
    );
  }

  const totalCost = orders.reduce((sum, order) => sum + order.cost, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/poll/${poll.id}`)}
          className="mb-4 text-slate-600"
        >
          ← Powrót do głosowania
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Zamówienia dla {poll.title}
            </h1>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Restauracja: {poll.selectedRestaurant}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Łącznie: {totalCost.toFixed(2)} zł</span>
              </div>
            </div>
          </div>

          <Badge className="bg-green-100 text-green-700">
            {orders.length} zamówień
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {userOrder ? "Twoje zamówienie" : "Złóż zamówienie"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userOrder ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Zamówienie złożone!
                  </h3>
                  <div className="space-y-2 text-sm">
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
                        Zamówione {userOrder.createdAt.toLocaleDateString('pl-PL')} o{" "}
                        {userOrder.createdAt.toLocaleTimeString('pl-PL', {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  Skontaktuj się z administratorem, jeśli chcesz zmodyfikować swoje zamówienie.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dish">Nazwa dania</Label>
                  <Input
                    id="dish"
                    placeholder="np. Kurczak Teriyaki"
                    {...register("dish")}
                  />
                  {errors.dish && (
                    <p className="text-sm text-red-600">
                      {errors.dish.message}
                    </p>
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
                    <p className="text-sm text-red-600">
                      {errors.cost.message}
                    </p>
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

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {submitting ? "Wysyłanie..." : "Złóż zamówienie"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Wszystkie zamówienia ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Brak zamówień. Bądź pierwszy i złóż zamówienie!
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      order.userId === user?.uid
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800">
                        {order.dish}
                      </h3>
                      <Badge variant="outline" className="text-green-600">
                        {order.cost.toFixed(2)} zł
                      </Badge>
                    </div>

                    {order.notes && (
                      <p className="text-sm text-slate-600 mb-2">
                        {order.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {order.createdAt.toLocaleDateString('pl-PL')} o{" "}
                        {order.createdAt.toLocaleTimeString('pl-PL', {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {order.userId === user?.uid && (
                        <Badge className="bg-blue-100 text-blue-700 ml-auto">
                          Twoje zamówienie
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Łączny koszt:</span>
                    <span className="text-green-600">
                      {totalCost.toFixed(2)} zł
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Średnio na osobę: {(totalCost / Math.max(orders.length, 1)).toFixed(2)} zł
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
