import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { cuisine: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.cuisine) {
      return await ctx.db.query("restaurants").withIndex("by_cuisine", q => q.eq("cuisine", args.cuisine!)).collect();
    }
    return await ctx.db.query("restaurants").collect();
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("restaurants").collect();
    return all.filter(r => r.featured);
  },
});

export const getById = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMenu = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.query("menuItems")
      .withIndex("by_restaurant", q => q.eq("restaurantId", args.restaurantId))
      .collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("restaurants").collect();
    if (existing.length > 0) return;

    const restaurants = [
      {
        name: "Burger Palace",
        description: "Gourmet burgers crafted with love and the finest ingredients",
        cuisine: "American",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        coverImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
        rating: 4.8, reviewCount: 342, deliveryTime: "20-30 min",
        deliveryFee: 2.99, minimumOrder: 15, isOpen: true,
        address: "123 Main St", tags: ["Burgers", "American", "Fast Food"], featured: true,
      },
      {
        name: "Sakura Sushi",
        description: "Authentic Japanese cuisine with the freshest fish flown in daily",
        cuisine: "Japanese",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
        coverImage: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
        rating: 4.9, reviewCount: 218, deliveryTime: "30-45 min",
        deliveryFee: 3.99, minimumOrder: 25, isOpen: true,
        address: "456 Oak Ave", tags: ["Sushi", "Japanese", "Healthy"], featured: true,
      },
      {
        name: "Spice Garden",
        description: "Rich, aromatic Indian curries and tandoor specialties",
        cuisine: "Indian",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
        coverImage: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800",
        rating: 4.7, reviewCount: 189, deliveryTime: "35-50 min",
        deliveryFee: 1.99, minimumOrder: 20, isOpen: true,
        address: "789 Curry Ln", tags: ["Indian", "Spicy", "Vegetarian"], featured: false,
      },
      {
        name: "La Bella Italia",
        description: "Traditional Italian pasta, pizza, and more from Nonna's recipes",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        rating: 4.6, reviewCount: 276, deliveryTime: "25-40 min",
        deliveryFee: 2.49, minimumOrder: 18, isOpen: true,
        address: "321 Pasta Pl", tags: ["Italian", "Pizza", "Pasta"], featured: true,
      },
      {
        name: "Green Bowl",
        description: "Healthy bowls, salads, and smoothies for a vibrant lifestyle",
        cuisine: "Healthy",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
        rating: 4.5, reviewCount: 134, deliveryTime: "15-25 min",
        deliveryFee: 1.49, minimumOrder: 12, isOpen: true,
        address: "654 Wellness Way", tags: ["Healthy", "Vegan", "Salads"], featured: false,
      },
    ];

    for (const r of restaurants) {
      const rId = await ctx.db.insert("restaurants", r);

      if (r.name === "Burger Palace") {
        const items = [
          { name: "Classic Smash Burger", description: "Double smashed patty, American cheese, special sauce", price: 14.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", category: "Burgers", isAvailable: true, isPopular: true, calories: 680 },
          { name: "BBQ Bacon Burger", description: "Crispy bacon, BBQ sauce, cheddar, caramelized onions", price: 16.99, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300", category: "Burgers", isAvailable: true, calories: 820 },
          { name: "Crispy Chicken Sandwich", description: "Buttermilk fried chicken, pickles, honey mustard", price: 13.99, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300", category: "Chicken", isAvailable: true, isPopular: true, calories: 590 },
          { name: "Loaded Fries", description: "Crispy fries, cheese sauce, jalapeños, sour cream", price: 8.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300", category: "Sides", isAvailable: true, calories: 450 },
          { name: "Chocolate Milkshake", description: "Thick and creamy hand-spun chocolate shake", price: 6.99, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300", category: "Drinks", isAvailable: true, calories: 560 },
        ];
        for (const item of items) await ctx.db.insert("menuItems", { ...item, restaurantId: rId });
      }

      if (r.name === "Sakura Sushi") {
        const items = [
          { name: "Dragon Roll", description: "Shrimp tempura, avocado, cucumber topped with tuna", price: 18.99, image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300", category: "Rolls", isAvailable: true, isPopular: true, calories: 420 },
          { name: "Salmon Sashimi (8pc)", description: "Fresh Atlantic salmon, premium cut", price: 22.99, image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=300", category: "Sashimi", isAvailable: true, calories: 280 },
          { name: "Miso Ramen", description: "Rich miso broth, chashu pork, soft egg, nori", price: 16.99, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300", category: "Ramen", isAvailable: true, isPopular: true, calories: 620 },
          { name: "Edamame", description: "Steamed salted soybeans", price: 5.99, image: "https://images.unsplash.com/photo-1626107716781-7f7a6db7c344?w=300", category: "Starters", isAvailable: true, calories: 120 },
        ];
        for (const item of items) await ctx.db.insert("menuItems", { ...item, restaurantId: rId });
      }

      if (r.name === "La Bella Italia") {
        const items = [
          { name: "Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella, basil", price: 17.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", category: "Pizza", isAvailable: true, isPopular: true, calories: 680 },
          { name: "Truffle Pasta", description: "Tagliatelle, black truffle, parmesan, butter", price: 21.99, image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=300", category: "Pasta", isAvailable: true, calories: 740 },
          { name: "Tiramisu", description: "Classic espresso-soaked ladyfingers, mascarpone cream", price: 8.99, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300", category: "Desserts", isAvailable: true, calories: 380 },
        ];
        for (const item of items) await ctx.db.insert("menuItems", { ...item, restaurantId: rId });
      }
    }
  },
});
