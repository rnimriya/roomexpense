"use client";

import { Home, PlusCircle, Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth, creation, and invite flows
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/expense/new") ||
    pathname.startsWith("/apartment/new") ||
    pathname.startsWith("/invite")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-900/60 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-zinc-200 transition-colors",
            pathname === "/dashboard" && "text-green-500 font-bold"
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-semibold">Dashboard</span>
        </Link>
        <Link
          href="/expense/new"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-zinc-200 transition-colors",
            pathname === "/expense/new" && "text-green-500 font-bold"
          )}
        >
          <PlusCircle className="h-5 w-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-semibold">Add</span>
        </Link>
        <Link
          href="/activity"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-zinc-200 transition-colors",
            pathname === "/activity" && "text-green-500 font-bold"
          )}
        >
          <Activity className="h-5 w-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-semibold">Activity</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-semibold">Log Out</span>
        </button>
      </div>
    </nav>
  );
}
