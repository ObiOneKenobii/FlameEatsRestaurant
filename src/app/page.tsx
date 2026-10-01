"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight, Star, Clock, Shield, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featured = useQuery(api.restaurants.getFeatured);
  const seed = useMutation(api.restaurants.seed);

  useEffect(() => { seed(); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/10" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-primary" />
            <span>Fast delivery from top restaurants</span>
          </div>
          <h1 className="font-display font-extrabold text-6xl md:text-8xl mb-6 leading-none">
            Food that <span className="gradient-text">Ignites</span>
            <br />your Cravings
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Order from the best local restaurants with real-time order tracking and lightning-fast delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button size="lg" className="gap-2">
                Order Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Average delivery in under 30 minutes from top restaurants near you" },
            { icon: Star, title: "Top Rated", desc: "Only the best restaurants curated by thousands of happy customers" },
            { icon: Shield, title: "Secure Payments", desc: "Your payments are protected by bank-level Stripe encryption" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 border border-border/50">
              <div className="w-12 h-12 gradient-flame rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-3xl">Featured Restaurants</h2>
          <Link href="/restaurants">
            <Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        {featured === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 glass rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((r: any) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-flame rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold gradient-text">FlameEats</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2025 FlameEats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
