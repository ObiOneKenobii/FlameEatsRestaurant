import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("cart").withIndex("by_user", q => q.eq("userId", userId)).first();
  },
});

export const addItem = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    item: v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      image: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const existing = await ctx.db.query("cart").withIndex("by_user", q => q.eq("userId", userId)).first();

    if (existing) {
      if (existing.restaurantId !== args.restaurantId) {
        await ctx.db.patch(existing._id, { restaurantId: args.restaurantId, items: [args.item] });
        return;
      }
      const items = [...existing.items];
      const idx = items.findIndex(i => i.menuItemId === args.item.menuItemId);
      if (idx >= 0) {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + args.item.quantity };
      } else {
        items.push(args.item);
      }
      await ctx.db.patch(existing._id, { items });
    } else {
      await ctx.db.insert("cart", { userId, restaurantId: args.restaurantId, items: [args.item] });
    }
  },
});

export const updateQuantity = mutation({
  args: { menuItemId: v.id("menuItems"), quantity: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const cart = await ctx.db.query("cart").withIndex("by_user", q => q.eq("userId", userId)).first();
    if (!cart) return;
    const items = args.quantity === 0
      ? cart.items.filter(i => i.menuItemId !== args.menuItemId)
      : cart.items.map(i => i.menuItemId === args.menuItemId ? { ...i, quantity: args.quantity } : i);
    await ctx.db.patch(cart._id, { items });
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const cart = await ctx.db.query("cart").withIndex("by_user", q => q.eq("userId", userId)).first();
    if (cart) await ctx.db.delete(cart._id);
  },
});
