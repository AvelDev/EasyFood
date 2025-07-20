"use client";

import { usePrivacyProtection } from "@/hooks/use-privacy-protection";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import {
  OrderForm,
  OrdersList,
  OrderSummary,
  AdminControls,
  AdminOrderManagement,
  PollNotFound,
  PollStillActive,
  LoadingSpinner,
} from "@/components/orders";

interface OrdersPageProps {
  params: {
    id: string;
  };
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const router = useRouter();
  const currentUrl = `/poll/${params.id}/orders`;
  const {
    user,
    loading: authLoading,
    isProtected,
  } = usePrivacyProtection(currentUrl);

  const {
    poll,
    orders,
    userOrder,
    loading,
    submitting,
    orderingEnded,
    totalCost,
    submitOrder,
    closeOrdering,
    deleteOrder,
    updateOrder,
  } = useOrders(params.id, user?.uid);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!poll) {
    return <PollNotFound onGoHome={() => router.push("/")} />;
  }

  if (!poll.closed) {
    return (
      <PollStillActive
        pollId={poll.id}
        onGoToPoll={() => router.push(`/poll/${poll.id}`)}
      />
    );
  }

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

        <OrderSummary
          poll={poll}
          ordersCount={orders.length}
          totalCost={totalCost}
          orderingEnded={orderingEnded}
        >
          <AdminControls
            isAdmin={user?.role === "admin"}
            orderingEnded={orderingEnded}
            onCloseOrdering={closeOrdering}
          />
        </OrderSummary>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <OrderForm
          userOrder={userOrder}
          orderingEnded={orderingEnded}
          submitting={submitting}
          onSubmit={submitOrder}
          onDelete={deleteOrder}
        />

        <OrdersList
          orders={orders}
          currentUserId={user?.uid}
          totalCost={totalCost}
        />
      </div>

      {/* Admin Order Management Panel */}
      {user?.role === "admin" && orderingEnded && (
        <div className="mt-8">
          <AdminOrderManagement
            orders={orders}
            isAdmin={user?.role === "admin"}
            orderingEnded={orderingEnded}
            onUpdateOrder={updateOrder}
          />
        </div>
      )}
    </div>
  );
}
