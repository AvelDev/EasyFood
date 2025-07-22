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
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
        <div className="flex-1">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
            Zamówienia dla {poll.title}
          </h1>
          <div className="flex flex-col gap-2 text-slate-600 sm:flex-row sm:items-center sm:gap-4">
            {poll.orderingEndsAt && poll.orderingEndsAt instanceof Date && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm sm:text-base">
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

        {/* Admin controls */}
        {children && (
          <div className="flex justify-start lg:justify-end">
            {children}
          </div>
        )}
      </div>

      {/* Status and info section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="text-green-700 bg-green-100 text-xs sm:text-sm">
            {ordersCount} zamówień
          </Badge>
          {orderingEnded ? (
            <Badge className="text-red-700 bg-red-100 text-xs sm:text-sm">
              Zamówienia zakończone
            </Badge>
          ) : (
            <Badge className="text-blue-700 bg-blue-100 text-xs sm:text-sm">
              Można składać zamówienia
            </Badge>
          )}
        </div>

        {/* Restaurant and total cost */}
        <div className="flex flex-col gap-2 text-sm sm:text-base sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              Restauracja: {poll.selectedRestaurant}
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-green-600">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>Łącznie: {totalCost.toFixed(2)} zł</span>
          </div>
        </div>
      </div>
    </div>
  );
}
