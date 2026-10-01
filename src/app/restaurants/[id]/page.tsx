"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Navbar } from "@/components/shared/Navbar";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Bike, MapPin, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function RestaurantPage() {
  const { id } = useParams();
  const restaurant = useQuery(api.restaurants.getById, { id: id as Id<"restaurants"> });
  const menuItems = useQuery(api.restaurants.getMenu, { restaurantId: id as Id<"restaurants"> });

  if (restaurant === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="h-64 glass rounded-2xl animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 glass rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return <div className="min-h-screen"><Navbar /><div className="p-10 text-center text-muted-foreground">Restaurant not found</div></div>;

  const categories = [...new Set(menuItems?.map((i: any) => i.category) ?? [])];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative h-64 overflow-hidden">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative pb-20">
        <div className="glass rounded-2xl p-6 border border-border/50 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-3xl mb-1">{restaurant.name}</h1>
              <p className="text-muted-foreground mb-3">{restaurant.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.tags.map((tag: any) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold text-foreground">{restaurant.rating}</span>
                  <span className="text-muted-foreground">({restaurant.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" /><span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bike className="w-4 h-4" /><span>{formatPrice(restaurant.deliveryFee)} delivery</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" /><span>{restaurant.address}</span>
                </div>
              </div>
            </div>
            <Badge variant={restaurant.isOpen ? "success" : "destructive"} className="text-sm px-3 py-1">
              {restaurant.isOpen ? "Open Now" : "Closed"}
            </Badge>
          </div>
        </div>

        {menuItems === undefined ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 glass rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-10">
            {categories.map((cat: any) => (
              <div key={cat}>
                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-primary" />{cat}
                </h2>
                <div className="space-y-3">
                  {menuItems.filter((i: any) => i.category === cat).map((item: any) => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
