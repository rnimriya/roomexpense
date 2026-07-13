"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public landing page is full-width (website style)
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <div className="w-full min-h-screen bg-[#0c0e0e] relative flex flex-col">
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  // App pages are centered in a mobile-framed wrapper
  return (
    <div className="flex justify-center min-h-screen bg-black">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0c0e0e] border-x border-zinc-900/50 shadow-2xl relative flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
