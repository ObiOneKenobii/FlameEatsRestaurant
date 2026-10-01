"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, ChevronRight, ShoppingBag, User } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLOR: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "warning", confirmed: "default", preparing: "default",
  ready: "default", picked_up: "default", delivering: "default",
  delivered: "success", cancelled: "destructive",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const user = useQuery(api.users.getMe);
  const orders = useQuery(api.orders.getMyOrders);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass rounded-2xl p-6 border border-border/50 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 gradient-flame rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">{user?.name ?? "Welcome back"}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: orders?.length ?? 0, icon: ShoppingBag },
            { label: "Delivered", value: orders?.filter((o: any) => o.status === "delivered").length ?? 0, icon: Package },
            { label: "Active Orders", value: orders?.filter((o: any) => !["delivered", "cancelled"].includes(o.status)).length ?? 0, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-5 border border-border/50">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-display font-bold">{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display font-bold text-xl mb-4">Recent Orders</h2>
        {orders === null ? (
          <div className="text-center py-10 text-muted-foreground">Please sign in to view your orders</div>
        ) : orders === undefined ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 glass rounded-xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-border/50">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/restaurants"><Button>Order Now</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Link key={order._id} href={`/track/${order._id}`}>
                <div className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors flex items-center gap-4">
                  <div className="w-10 h-10 gradient-flame rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={STATUS_COLOR[order.status] ?? "secondary"} className="capitalize text-xs">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""} · {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(order._creationTime)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
