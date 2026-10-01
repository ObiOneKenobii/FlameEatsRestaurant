import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("orders")
      .withIndex("by_customer", q => q.eq("customerId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const order = await ctx.db.get(args.orderId);
    if (!order || order.customerId !== userId) return null;
    return order;
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      image: v.string(),
    })),
    deliveryAddress: v.string(),
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const orderId = await ctx.db.insert("orders", {
      customerId: userId,
      restaurantId: args.restaurantId,
      items: args.items,
      status: "pending",
      subtotal: args.subtotal,
      deliveryFee: args.deliveryFee,
      total: args.total,
      deliveryAddress: args.deliveryAddress,
      paymentStatus: "pending",
      notes: args.notes,
      trackingUpdates: [{
        status: "pending",
        message: "Order placed — awaiting payment",
        timestamp: Date.now(),
      }],
    });

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"), v.literal("confirmed"), v.literal("preparing"),
      v.literal("ready"), v.literal("picked_up"), v.literal("delivering"),
      v.literal("delivered"), v.literal("cancelled")
    ),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const updates = order.trackingUpdates || [];
    updates.push({ status: args.status, message: args.message, timestamp: Date.now() });

    await ctx.db.patch(args.orderId, {
      status: args.status,
      trackingUpdates: updates,
    });
  },
});

export const updatePayment = mutation({
  args: {
    orderId: v.id("orders"),
    paymentIntentId: v.string(),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("refunded")),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const updates = order.trackingUpdates || [];
    if (args.paymentStatus === "paid") {
      updates.push({ status: "confirmed", message: "Payment confirmed via Paystack", timestamp: Date.now() });
    }

    await ctx.db.patch(args.orderId, {
      stripePaymentIntentId: args.paymentIntentId, // reusing field to store Paystack reference
      paymentStatus: args.paymentStatus,
      status: args.paymentStatus === "paid" ? "confirmed" : "pending",
      trackingUpdates: updates,
    });
  },
});
