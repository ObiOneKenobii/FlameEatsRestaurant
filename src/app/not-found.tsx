"use client";

import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
        <div className="w-20 h-20 gradient-flame rounded-3xl flex items-center justify-center mb-8 rotate-12">
          <Flame className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display font-bold text-6xl mb-4">404</h1>
        <h2 className="font-display font-semibold text-2xl mb-6">Page not found</h2>
        <p className="text-muted-foreground max-w-md mb-10">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="px-8">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
