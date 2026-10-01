"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, MapPin, CreditCard, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Paystack InlineJS V2 type declaration
declare global {
  interface Window {
    PaystackPop: {
      resumeTransaction: (accessCode: string) => void;
    };
  }
}

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const router = useRouter();
  const convexAuth = useConvexAuth();
  const isAuthenticated = convexAuth?.isAuthenticated;
  const authActions = useAuthActions();
  const signIn = authActions?.signIn;
  const user = useQuery(api.users.getMe);
  const cart = useQuery(api.cart.get);
  const restaurant = useQuery(
    api.restaurants.getById,
    cart?.restaurantId ? { id: cart.restaurantId } : "skip"
  );
  const updateQty = useMutation(api.cart.updateQuantity);
  const clearCart = useMutation(api.cart.clear);
  const createOrder = useMutation(api.orders.create);
  const updatePayment = useMutation(api.orders.updatePayment);

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);

  // Load Paystack InlineJS V2 script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.onload = () => setPaystackReady(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const subtotal = cart?.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0) ?? 0;
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  const handlePayWithPaystack = async () => {
    if (!cart || !address.trim() || !user?.email) return;
    setLoading(true);

    let orderId: string | null = null;

    try {
      // Step 1: Create the order in Convex (pending payment)
      const newOrderId = await createOrder({
        restaurantId: cart.restaurantId,
        items: cart.items,
        deliveryAddress: address,
        subtotal,
        deliveryFee,
        total,
        notes: notes || undefined,
      });
      orderId = newOrderId;

      // Step 2: Initialize transaction on our backend (keeps secret key safe)
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: total,
          orderId: newOrderId,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.access_code) {
        throw new Error(initData.error ?? "Failed to initialize payment");
      }

      const { access_code, reference } = initData;

      // Step 3: Open Paystack Popup V2 using resumeTransaction (official method)
      // This uses the access_code from the backend, not the public key directly
      window.PaystackPop.resumeTransaction(access_code);

      // Step 4: Poll for verification after popup closes
      // In production you'd rely on the webhook. This is a client-side fallback.
      const poll = setInterval(async () => {
        const verifyRes = await fetch(`/api/paystack/verify?reference=${reference}`);
        const verifyData = await verifyRes.json();

        if (verifyData.verified) {
          clearInterval(poll);
          // Update order payment status in Convex
          await updatePayment({
            orderId: newOrderId,
            paymentIntentId: reference,
            paymentStatus: "paid",
          });
          await clearCart();
          router.push(`/track/${newOrderId}`);
          setLoading(false);
        }
      }, 3000);

      // Stop polling after 10 minutes
      setTimeout(() => clearInterval(poll), 600000);

    } catch (e) {
      console.error("Payment error:", e);
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items from a restaurant to get started</p>
          <Button onClick={() => router.push("/restaurants")}>Browse Restaurants</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Cart Items */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-border/50">
              <h2 className="font-display font-semibold text-lg mb-4">Your Order</h2>
              {restaurant && <p className="text-muted-foreground text-sm mb-4">From {restaurant.name}</p>}
              <div className="space-y-3">
                {cart.items.map((item: any) => (
                  <div key={item.menuItemId} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty({ menuItemId: item.menuItemId, quantity: item.quantity - 1 })}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty({ menuItemId: item.menuItemId, quantity: item.quantity + 1 })}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold w-16 text-right">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-border/50">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Address
              </h2>
              <Input
                placeholder="Enter your delivery address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="mb-3"
              />
              <Input
                placeholder="Special instructions (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="glass rounded-2xl p-6 border border-border/50">
              <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handlePayWithPaystack}
                disabled={loading || !address.trim() || !paystackReady || !user?.email}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pay with Paystack · {formatPrice(total)}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3">
                <img src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png" alt="Paystack" className="h-4 opacity-60" />
                <p className="text-xs text-muted-foreground">Secured by Paystack</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
