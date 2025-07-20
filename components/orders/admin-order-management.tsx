"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/types";
import {
  Edit,
  Save,
  X,
  Check,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AdminOrderManagementProps {
  orders: Order[];
  isAdmin: boolean;
  orderingEnded: boolean;
  onUpdateOrder: (orderIndex: number, updates: Partial<Order>) => Promise<void>;
}

export function AdminOrderManagement({
  orders,
  isAdmin,
  orderingEnded,
  onUpdateOrder,
}: AdminOrderManagementProps) {
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [costAdjustment, setCostAdjustment] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "unpaid"
  >("pending");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!isAdmin || !orderingEnded) {
    return null;
  }

  const handleEditOrder = (orderIndex: number, order: Order) => {
    setEditingOrder(orderIndex);
    setAdminNotes(order.adminNotes || "");
    setCostAdjustment(order.costAdjustment?.toString() || "");
    setPaymentStatus(order.paymentStatus || "pending");
    setOrderConfirmed(order.orderConfirmed || false);
  };

  const handleSaveOrder = async (orderIndex: number) => {
    const updates: Partial<Order> = {
      adminNotes: adminNotes.trim() || undefined,
      costAdjustment: costAdjustment ? parseFloat(costAdjustment) : undefined,
      paymentStatus,
      orderConfirmed,
    };

    await onUpdateOrder(orderIndex, updates);
    setEditingOrder(null);
    setAdminNotes("");
    setCostAdjustment("");
    setPaymentStatus("pending");
    setOrderConfirmed(false);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setAdminNotes("");
    setCostAdjustment("");
    setPaymentStatus("pending");
    setOrderConfirmed(false);
  };

  const getTotalCostWithAdjustments = () => {
    return orders.reduce((sum, order) => {
      return sum + order.cost + (order.costAdjustment || 0);
    }, 0);
  };

  const getPaymentStatusBadge = (status?: "pending" | "paid" | "unpaid") => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Opłacone
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Nieopłacone
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Oczekuje
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Panel Administratora - Zarządzanie Zamówieniami
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Podsumowanie</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Zamówienia:</span>
                <div className="font-semibold">{orders.length}</div>
              </div>
              <div>
                <span className="text-slate-600">Koszt bazowy:</span>
                <div className="font-semibold">
                  {orders
                    .reduce((sum, order) => sum + order.cost, 0)
                    .toFixed(2)}{" "}
                  zł
                </div>
              </div>
              <div>
                <span className="text-slate-600">Z korektami:</span>
                <div className="font-semibold text-green-600">
                  {getTotalCostWithAdjustments().toFixed(2)} zł
                </div>
              </div>
              <div>
                <span className="text-slate-600">Potwierdzone:</span>
                <div className="font-semibold">
                  {orders.filter((order) => order.orderConfirmed).length}/
                  {orders.length}
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{order.dish}</h4>
                      {order.userName && (
                        <Badge variant="outline">{order.userName}</Badge>
                      )}
                      {getPaymentStatusBadge(order.paymentStatus)}
                      {order.orderConfirmed && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Potwierdzone
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-slate-600">
                      <div>Koszt bazowy: {order.cost.toFixed(2)} zł</div>
                      {order.costAdjustment && (
                        <div className="text-orange-600">
                          Korekta: {order.costAdjustment > 0 ? "+" : ""}
                          {order.costAdjustment.toFixed(2)} zł
                        </div>
                      )}
                      <div className="font-semibold">
                        Łącznie:{" "}
                        {(order.cost + (order.costAdjustment || 0)).toFixed(2)}{" "}
                        zł
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-slate-600">
                          Uwagi użytkownika:
                        </span>
                        <div className="italic">{order.notes}</div>
                      </div>
                    )}

                    {order.adminNotes && (
                      <div className="mt-2 text-sm">
                        <span className="text-slate-600">
                          Uwagi administratora:
                        </span>
                        <div className="text-blue-700">{order.adminNotes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingOrder === index ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveOrder(index)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOrder(index, order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {editingOrder === index && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Uwagi administratora
                        </label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Dodaj uwagi do zamówienia..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Korekta kosztów (zł)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={costAdjustment}
                          onChange={(e) => setCostAdjustment(e.target.value)}
                          placeholder="0.00"
                          className="mb-2"
                        />
                        <div className="text-xs text-slate-600">
                          Użyj wartości ujemnych dla zniżek
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Status płatności
                        </label>
                        <Select
                          value={paymentStatus}
                          onValueChange={(value) =>
                            setPaymentStatus(
                              value as "pending" | "paid" | "unpaid"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Oczekuje na płatność
                            </SelectItem>
                            <SelectItem value="paid">Opłacone</SelectItem>
                            <SelectItem value="unpaid">Nieopłacone</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Potwierdzenie zamówienia
                        </label>
                        <div className="flex items-center gap-3 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderConfirmed}
                              onChange={(e) =>
                                setOrderConfirmed(e.target.checked)
                              }
                              className="rounded"
                            />
                            <span className="text-sm">
                              Zamówienie zostało złożone
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
