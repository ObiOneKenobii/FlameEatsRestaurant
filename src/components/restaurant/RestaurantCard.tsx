"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Clock, DollarSign, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface Restaurant {
  _id: Id<"restaurants">;
  name: string;
  description: string;
  cuisine: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  tags: string[];
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant._id}`}>
      <div className="group glass rounded-2xl overflow-hidden card-hover cursor-pointer border border-border/50">
        <div className="relative h-48 overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Closed</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {restaurant.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs glass">{tag}</Badge>
            ))}
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-display font-bold text-lg">{restaurant.name}</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{restaurant.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-muted-foreground">({restaurant.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bike className="w-3.5 h-3.5" />
              <span>{restaurant.deliveryFee === 0 ? "Free" : formatPrice(restaurant.deliveryFee)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
