"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
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
  const getTotalCostWithAdjustments = () => {
    return orders.reduce((sum, order) => {
      return sum + order.cost + (order.costAdjustment || 0);
    }, 0);
  };

  const getPaymentStatusBadge = (status?: "pending" | "paid" | "unpaid") => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
            Opłacone
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
            Nieopłacone
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
            Oczekuje
          </Badge>
        );
    }
  };

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
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">
                      {order.dish}
                    </h3>
                    <Badge variant="outline" className="text-green-600 text-xs">
                      {order.cost.toFixed(2)} zł
                    </Badge>
                    {order.costAdjustment && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 text-xs"
                      >
                        {order.costAdjustment > 0 ? "+" : ""}
                        {order.costAdjustment.toFixed(2)} zł
                      </Badge>
                    )}
                    {order.cost + (order.costAdjustment || 0) !==
                      order.cost && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {(order.cost + (order.costAdjustment || 0)).toFixed(
                          2
                        )}{" "}
                        zł
                      </Badge>
                    )}
                  </div>

                  {/* Show user name, payment status and confirmation status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.userName && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          order.userId === currentUserId
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.userName}
                      </Badge>
                    )}
                    {order.userId === currentUserId && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Twoje zamówienie
                      </Badge>
                    )}
                    {order.paymentStatus &&
                      getPaymentStatusBadge(order.paymentStatus)}
                    {order.orderConfirmed && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Potwierdzone
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {order.notes && (
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Uwagi:</span> {order.notes}
                </p>
              )}

              {order.adminNotes && (
                <p className="text-sm text-blue-700 mb-2">
                  <span className="font-medium">Uwagi administratora:</span>{" "}
                  {order.adminNotes}
                </p>
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
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Łączny koszt:</span>
              <span className="text-green-600">{totalCost.toFixed(2)} zł</span>
            </div>
            {getTotalCostWithAdjustments() !== totalCost && (
              <div className="flex justify-between items-center text-lg font-semibold mt-1">
                <span>Z korektami:</span>
                <span className="text-blue-600">
                  {getTotalCostWithAdjustments().toFixed(2)} zł
                </span>
              </div>
            )}
            <p className="text-sm text-slate-600 mt-1">
              Średnio na osobę:{" "}
              {(
                getTotalCostWithAdjustments() / Math.max(orders.length, 1)
              ).toFixed(2)}{" "}
              zł
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
