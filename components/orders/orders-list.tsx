"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock } from "lucide-react";
import { Order } from "@/types";

interface OrdersListProps {
  orders: Order[];
  currentUserId?: string;
  totalCost: number;
}

export function OrdersList({
  orders,
  currentUserId,
  totalCost,
}: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Wszystkie zamówienia (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">
            Brak zamówień. Bądź pierwszy i złóż zamówienie!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Wszystkie zamówienia ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-colors ${
                order.userId === currentUserId
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800">{order.dish}</h3>
                <Badge variant="outline" className="text-green-600">
                  {order.cost.toFixed(2)} zł
                </Badge>
              </div>

              {order.notes && (
                <p className="text-sm text-slate-600 mb-2">{order.notes}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>
                  {order.createdAt.toLocaleDateString("pl-PL")} o{" "}
                  {order.createdAt.toLocaleTimeString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {order.userId === currentUserId && (
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
              <span className="text-green-600">{totalCost.toFixed(2)} zł</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Średnio na osobę:{" "}
              {(totalCost / Math.max(orders.length, 1)).toFixed(2)} zł
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
