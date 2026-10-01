"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface MenuItem {
  _id: Id<"menuItems">;
  restaurantId: Id<"restaurants">;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular?: boolean;
  calories?: number;
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  const convexAuth = useConvexAuth();
  const isAuthenticated = convexAuth?.isAuthenticated;
  const addToCart = useMutation(api.cart.addItem);
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!isAuthenticated) { router.push("/auth/sign-in"); return; }
    setAdding(true);
    try {
      await addToCart({
        restaurantId: item.restaurantId,
        item: { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, image: item.image },
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="glass rounded-xl p-4 flex gap-4 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        {item.isPopular && (
          <div className="absolute top-1 left-1 w-5 h-5 gradient-flame rounded-full flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {item.isPopular && <Badge variant="default" className="text-xs mt-1">Popular</Badge>}
          </div>
          <span className="font-display font-bold text-primary text-lg flex-shrink-0">{formatPrice(item.price)}</span>
        </div>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          {item.calories && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="w-3 h-3" />
              <span>{item.calories} cal</span>
            </div>
          )}
          <Button size="sm" onClick={handleAdd} disabled={adding || !item.isAvailable} className="ml-auto">
            <Plus className="w-3.5 h-3.5" />
            {adding ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
