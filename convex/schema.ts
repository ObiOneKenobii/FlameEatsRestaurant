import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("customer"), v.literal("restaurant_owner"), v.literal("driver"))),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  }).index("by_email", ["email"]),

  restaurants: defineTable({
    name: v.string(),
    description: v.string(),
    cuisine: v.string(),
    image: v.string(),
    coverImage: v.string(),
    rating: v.number(),
    reviewCount: v.number(),
    deliveryTime: v.string(),
    deliveryFee: v.number(),
    minimumOrder: v.number(),
    isOpen: v.boolean(),
    ownerId: v.optional(v.id("users")),
    address: v.string(),
    tags: v.array(v.string()),
    featured: v.optional(v.boolean()),
  }).index("by_owner", ["ownerId"]).index("by_cuisine", ["cuisine"]),

  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
    isAvailable: v.boolean(),
    isPopular: v.optional(v.boolean()),
    allergens: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
  }).index("by_restaurant", ["restaurantId"]).index("by_category", ["restaurantId", "category"]),

  orders: defineTable({
    customerId: v.id("users"),
    restaurantId: v.id("restaurants"),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      image: v.string(),
    })),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("delivering"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    deliveryAddress: v.string(),
    estimatedDelivery: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("refunded")),
    driverId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    trackingUpdates: v.optional(v.array(v.object({
      status: v.string(),
      message: v.string(),
      timestamp: v.number(),
    }))),
  }).index("by_customer", ["customerId"]).index("by_restaurant", ["restaurantId"]).index("by_status", ["status"]),

  cart: defineTable({
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      image: v.string(),
    })),
  }).index("by_user", ["userId"]),

  reviews: defineTable({
    orderId: v.id("orders"),
    customerId: v.id("users"),
    restaurantId: v.id("restaurants"),
    rating: v.number(),
    comment: v.optional(v.string()),
  }).index("by_restaurant", ["restaurantId"]).index("by_customer", ["customerId"]),
});
