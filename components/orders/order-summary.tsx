"use client";

import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, Clock } from "lucide-react";
import { Poll } from "@/types";
import { ReactNode } from "react";

interface OrderSummaryProps {
  poll: Poll;
  ordersCount: number;
  totalCost: number;
  orderingEnded: boolean;
  children?: ReactNode;
}

export function OrderSummary({
  poll,
  ordersCount,
  totalCost,
  orderingEnded,
  children,
}: OrderSummaryProps) {
  return (
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
          {poll.orderingEndsAt && poll.orderingEndsAt instanceof Date && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Zamówienia do {poll.orderingEndsAt.toLocaleDateString("pl-PL")}{" "}
                o{" "}
                {poll.orderingEndsAt.toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge className="bg-green-100 text-green-700">
          {ordersCount} zamówień
        </Badge>
        {orderingEnded ? (
          <Badge className="bg-red-100 text-red-700">
            Zamówienia zakończone
          </Badge>
        ) : (
          <Badge className="bg-blue-100 text-blue-700">
            Można składać zamówienia
          </Badge>
        )}
        {children}
      </div>
    </div>
  );
}
