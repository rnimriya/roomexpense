"use client";

import { Home, PlusCircle, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  // Hide on expense creation flows
  if (pathname.startsWith("/expense/new")) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] bg-background border-t border-border pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors",
            pathname === "/dashboard" && "text-foreground font-medium"
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-[10px] uppercase tracking-wider">Dashboard</span>
        </Link>
        <Link
          href="/expense/new"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors",
            pathname === "/expense/new" && "text-foreground font-medium"
          )}
        >
          <PlusCircle className="h-5 w-5 mb-1" />
          <span className="text-[10px] uppercase tracking-wider">Add</span>
        </Link>
        <Link
          href="/activity"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors",
            pathname === "/activity" && "text-foreground font-medium"
          )}
        >
          <Activity className="h-5 w-5 mb-1" />
          <span className="text-[10px] uppercase tracking-wider">Activity</span>
        </Link>
      </div>
    </nav>
  );
}
