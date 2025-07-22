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
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
      {/* Navigation Buttons */}
      <motion.div
        className="mb-8 flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Home className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Powrót do menu</span>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push(`/poll/${poll.id}`)}
            className="group flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium">Powrót do głosowania</span>
          </Button>
        </motion.div>
      </motion.div>

      <div className="mb-8">
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
