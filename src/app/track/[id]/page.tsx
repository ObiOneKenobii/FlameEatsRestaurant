"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Navbar } from "@/components/shared/Navbar";
import { OrderTracker } from "@/components/tracking/OrderTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

// Demo: simulate status progression
const STATUS_SEQUENCE = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivering", "delivered"] as const;
const STATUS_MESSAGES: Record<string, string> = {
  confirmed: "Restaurant has confirmed your order",
  preparing: "Your food is being prepared",
  ready: "Your order is ready for pickup",
  picked_up: "Driver has picked up your order",
  delivering: "Driver is on the way to you",
  delivered: "Your order has been delivered. Enjoy!",
};

export const dynamic = "force-dynamic";

export default function TrackPage() {
  const { id } = useParams();
  const order = useQuery(api.orders.getById, { orderId: id as Id<"orders"> });
  const updateStatus = useMutation(api.orders.updateStatus);

  const advanceStatus = async () => {
    if (!order) return;
    const idx = STATUS_SEQUENCE.indexOf(order.status as typeof STATUS_SEQUENCE[number]);
    if (idx < STATUS_SEQUENCE.length - 1) {
      const next = STATUS_SEQUENCE[idx + 1];
      await updateStatus({ orderId: order._id, status: next, message: STATUS_MESSAGES[next] ?? `Status updated to ${next}` });
    }
  };

  if (order === undefined) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="h-96 glass rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="py-20 text-center text-muted-foreground">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl">Track Order</h1>
            <p className="text-muted-foreground text-sm mt-1">Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <Badge variant={order.status === "delivered" ? "success" : "default"} className="text-sm px-3 py-1 capitalize">
            {order.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="glass rounded-2xl p-6 border border-border/50 mb-6">
          <OrderTracker status={order.status} trackingUpdates={order.trackingUpdates} estimatedDelivery={order.estimatedDelivery} />
        </div>

        <div className="glass rounded-2xl p-6 border border-border/50 mb-6">
          <h2 className="font-display font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span className="gradient-text">{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="glass rounded-2xl p-4 border border-orange-500/20 mb-6">
            <p className="text-sm text-muted-foreground mb-3 text-center">Demo: Simulate order progress</p>
            <Button onClick={advanceStatus} variant="outline" className="w-full">
              Advance Order Status →
            </Button>
          </div>
        )}

        <Link href="/dashboard">
          <Button variant="ghost" className="w-full">← Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
