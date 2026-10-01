"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const CUISINES = ["All", "American", "Japanese", "Italian", "Indian", "Healthy"];

export const dynamic = "force-dynamic";

export default function RestaurantsPage() {
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [search, setSearch] = useState("");

  const restaurants = useQuery(api.restaurants.list, {
    cuisine: selectedCuisine === "All" ? undefined : selectedCuisine,
  });

  const filtered = restaurants?.filter((r: any) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-4xl mb-2">Restaurants</h1>
        <p className="text-muted-foreground mb-8">Discover amazing food near you</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search restaurants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CUISINES.map(c => (
              <Button key={c} variant={selectedCuisine === c ? "default" : "outline"} size="sm" onClick={() => setSelectedCuisine(c)}>
                {c}
              </Button>
            ))}
          </div>
        </div>

        {filtered === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 glass rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No restaurants found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r: any) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
