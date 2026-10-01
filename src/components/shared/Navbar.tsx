"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Flame, User, LogOut, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const convexAuth = useConvexAuth();
  const isAuthenticated = convexAuth?.isAuthenticated;
  const authActions = useAuthActions();
  const signOut = authActions?.signOut;
  const router = useRouter();
  const pathname = usePathname();
  const cart = useQuery(api.cart.get, isAuthenticated ? {} : "skip");

  const cartCount = cart?.items.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0;

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
      router.push("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-flame rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">FlameEats</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/restaurants" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/restaurants" ? "text-primary" : "text-muted-foreground")}>
              Restaurants
            </Link>
            {isAuthenticated && (
              <Link href="/orders" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/orders" ? "text-primary" : "text-muted-foreground")}>
                My Orders
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/checkout">
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 gradient-flame rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
