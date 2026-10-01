"use client";

import { CheckCircle, Circle, Clock, Truck, ChefHat, PackageCheck, Home } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Circle, desc: "Your order has been received" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, desc: "Restaurant confirmed your order" },
  { key: "preparing", label: "Preparing", icon: ChefHat, desc: "Kitchen is preparing your food" },
  { key: "ready", label: "Ready", icon: PackageCheck, desc: "Food is ready for pickup" },
  { key: "picked_up", label: "Picked Up", icon: Truck, desc: "Driver has your order" },
  { key: "delivering", label: "On the Way", icon: Truck, desc: "Driver is heading to you" },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Enjoy your meal!" },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, preparing: 2, ready: 3, picked_up: 4, delivering: 5, delivered: 6,
};

interface TrackingUpdate {
  status: string;
  message: string;
  timestamp: number;
}

interface OrderTrackerProps {
  status: string;
  trackingUpdates?: TrackingUpdate[];
  estimatedDelivery?: string;
}

export function OrderTracker({ status, trackingUpdates, estimatedDelivery }: OrderTrackerProps) {
  const currentStep = STATUS_INDEX[status] ?? 0;

  return (
    <div className="space-y-6">
      {estimatedDelivery && (
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Estimated Delivery</p>
            <p className="font-semibold">{estimatedDelivery}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
        <div
          className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-orange-500 to-rose-500 transition-all duration-1000"
          style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isComplete = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-center gap-4 relative">
                <div className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isComplete ? "gradient-flame border-transparent" : "bg-card border-border",
                  isCurrent && "ring-4 ring-orange-500/20"
                )}>
                  <Icon className={cn("w-4 h-4", isComplete ? "text-white" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <p className={cn("font-semibold text-sm", isComplete ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                {isCurrent && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {trackingUpdates && trackingUpdates.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold mb-3">Activity Log</h3>
          <div className="space-y-2">
            {[...trackingUpdates].reverse().map((update, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm">{update.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(update.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
