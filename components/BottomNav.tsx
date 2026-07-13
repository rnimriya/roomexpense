"use client";

import { Home, Receipt, Users, User, LogOut } from "lucide-react";
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

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/activity", label: "Activity", icon: Receipt },
    { href: "/roommates", label: "Roommates", icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0c0e0e] border-t border-zinc-900/60 shadow-2xl px-3 py-2.5 z-50 select-none pb-safe">
      <div className="flex justify-around items-end h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-20 text-center transition-all group"
            >
              <div className={cn(
                "h-7 w-14 rounded-full flex items-center justify-center transition-all duration-250",
                isActive 
                  ? "bg-[#82d0ad] text-zinc-950" 
                  : "text-zinc-500 group-hover:text-zinc-350"
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider mt-1.5",
                isActive ? "text-[#82d0ad]" : "text-zinc-550"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Log Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center justify-center w-20 text-center transition-all group cursor-pointer"
        >
          <div className="h-7 w-14 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-red-400 transition-all duration-250">
            <LogOut className="h-4.5 w-4.5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1.5 text-zinc-550">
            Exit
          </span>
        </button>
      </div>
    </div>
  );
}
