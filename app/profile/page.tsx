import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Bell, HelpCircle, ChevronRight, User } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const currentUserId = (session.user as any).id || "u1";

  // Load user details and apartment
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: {
      apartmentMembers: {
        include: {
          apartment: true,
        },
      },
    },
  });

  const apartmentName = user?.apartmentMembers?.[0]?.apartment?.name || "Downtown Loft";
  const apartmentPlan = user?.apartmentMembers?.[0]?.apartment?.plan || "FREE";

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24 select-none">
      {/* Header - Mock 3 style */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-center border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-[#82d0ad]/20 overflow-hidden relative shrink-0">
            {user?.image && (
              <img src={user.image} alt={session.user.name || "User"} className="h-full w-full object-cover rounded-full" />
            )}
            <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-base font-black tracking-wide text-white">
            <span className="text-[#82d0ad]">Roomie</span>Pay
          </h1>
        </div>
        <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 tracking-wider flex items-center gap-1">
          <Bell className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-6 text-left">
          
          {/* User Profile Info Card */}
          <div className="bg-[#181a1b] border border-zinc-900 rounded-[28px] p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-4 relative z-10">
              <Avatar className="h-16 w-16 border-2 border-[#82d0ad]/30 overflow-hidden relative shrink-0">
                {user?.image && (
                  <img src={user.image} alt={session.user.name || "User"} className="h-full w-full object-cover rounded-full" />
                )}
                <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-extrabold text-lg">
                  {session.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">
                  {session.user.name || "Roommate User"}
                </h2>
                <p className="text-[11px] text-zinc-550 mt-1 font-medium">
                  {session.user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-[#82d0ad] bg-[#82d0ad]/10 border border-[#82d0ad]/20">
                    {apartmentPlan}
                  </span>
                  <span className="text-[10px] text-zinc-455 font-medium">
                    {apartmentName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section Categories */}
          <div className="space-y-4">
            <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
              settings preferences
            </h3>

            <div className="space-y-3">
              {/* Profile details */}
              <Link href="/profile/account" className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between hover:bg-[#1f2122] transition-colors cursor-pointer block">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Account Information</h4>
                    <p className="text-[9px] text-zinc-550 font-medium mt-0.5">Manage your personal email and name</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-550" />
              </Link>

              {/* Security */}
              <Link href="/profile/security" className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between hover:bg-[#1f2122] transition-colors cursor-pointer block">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                    <Shield className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Privacy & Security</h4>
                    <p className="text-[9px] text-zinc-550 font-medium mt-0.5">Password updates and session logs</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-550" />
              </Link>

              {/* Notifications */}
              <Link href="/profile/notifications" className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between hover:bg-[#1f2122] transition-colors cursor-pointer block">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                    <Bell className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Push Notifications</h4>
                    <p className="text-[9px] text-zinc-550 font-medium mt-0.5">Receive nudge and activity alerts</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-550" />
              </Link>

              {/* Help & Support */}
              <Link href="/profile/help" className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between hover:bg-[#1f2122] transition-colors cursor-pointer block">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                    <HelpCircle className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Help & Support</h4>
                    <p className="text-[9px] text-zinc-550 font-medium mt-0.5">Frequently asked questions and guides</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-550" />
              </Link>
            </div>
          </div>

          {/* Secure Trust Badge */}
          <div className="border border-dashed border-zinc-850 rounded-[24px] p-8 text-center bg-[#0c0e0e] my-4 select-none">
            <h4 className="text-zinc-700 font-extrabold text-lg tracking-[0.15em] uppercase">Security</h4>
            <p className="text-[9px] text-zinc-555 mt-1 leading-relaxed">End-to-end encrypted room splits</p>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
