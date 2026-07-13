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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[432px] bg-[#1a1a1c]/80 backdrop-blur-xl border border-[#2c2c2e]/60 shadow-xl rounded-full px-2 py-1.5 z-50 select-none">
      <div className="flex justify-around items-center h-12">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center w-12 h-11 rounded-full text-zinc-500 hover:text-zinc-200 transition-all",
            pathname === "/dashboard" && "text-white bg-white/5 border border-white/5"
          )}
        >
          <Home className="h-4.5 w-4.5" />
        </Link>
        <Link
          href="/expense/new"
          className={cn(
            "flex flex-col items-center justify-center w-12 h-11 rounded-full text-zinc-500 hover:text-zinc-200 transition-all",
            pathname === "/expense/new" && "text-white bg-white/5 border border-white/5"
          )}
        >
          <PlusCircle className="h-4.5 w-4.5" />
        </Link>
        <Link
          href="/activity"
          className={cn(
            "flex flex-col items-center justify-center w-12 h-11 rounded-full text-zinc-500 hover:text-zinc-200 transition-all",
            pathname === "/activity" && "text-white bg-white/5 border border-white/5"
          )}
        >
          <Activity className="h-4.5 w-4.5" />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center justify-center w-12 h-11 rounded-full text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
