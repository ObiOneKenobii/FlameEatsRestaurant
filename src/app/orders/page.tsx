"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLOR: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "warning", confirmed: "default", preparing: "default",
  ready: "default", picked_up: "default", delivering: "default",
  delivered: "success", cancelled: "destructive",
};

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const orders = useQuery(api.orders.getMyOrders);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl mb-8">My Orders</h1>

        {orders === null ? (
          <div className="text-center py-10 text-muted-foreground">Please sign in</div>
        ) : orders === undefined ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 glass rounded-xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-border/50">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/restaurants"><Button>Order Now</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Link key={order._id} href={`/track/${order._id}`}>
                <div className="glass rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-colors flex items-center gap-4 group">
                  <div className="w-12 h-12 gradient-flame rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={STATUS_COLOR[order.status] ?? "secondary"} className="capitalize text-xs">
                        {order.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""} · <span className="gradient-text font-bold">{formatPrice(order.total)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(order._creationTime)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
