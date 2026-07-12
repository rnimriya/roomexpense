import { prisma } from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Share2, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoommateForm } from "./RoommateForm";
import { InviteLinkBox } from "./InviteLinkBox";
import { RemoveRoommateButton } from "./RemoveRoommateButton";

export default async function RoommatesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const currentUserId = (session.user as any).id;

  // Load current apartment (assume 'a1' for V2 MVP)
  const apartment = await prisma.apartment.findUnique({
    where: { id: "a1" },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!apartment) {
    redirect("/dashboard");
  }

  const inviteToken = apartment.inviteLinkToken;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 relative pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-900">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-6 w-6 text-zinc-400" />
        </Link>
        <span className="font-bold text-zinc-100 tracking-wider">Roommates</span>
        <Link 
          href="/apartment/new" 
          className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-widest bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
        >
          Create New
        </Link>
      </div>

      <ScrollArea className="flex-1">
        {/* SaaS Subscription Info Bar */}
        <div className="mx-6 mt-6 p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-200">
              Group: <span className="text-zinc-100">{apartment.name}</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {apartment.plan === "PRO" ? "Pro Plan Active (Unlimited roommates)" : `Free Plan (${apartment.members.length}/2 Roommates limit)`}
            </p>
          </div>
          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            apartment.plan === "PRO" 
              ? "text-green-500 bg-green-500/10 border border-green-500/20" 
              : "text-zinc-400 bg-zinc-850 border border-zinc-800"
          }`}>
            {apartment.plan === "PRO" ? "Pro" : "Free"}
          </span>
        </div>

        {/* Current Members */}
        <div className="p-6 pt-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> Current Roommates
          </h2>
          <div className="space-y-3">
            {apartment.members.map((member) => {
              const isPhantom = !["alice@example.com", "bob@example.com", "charlie@example.com"].includes(member.user.email);
              return (
                <div key={member.userId} className="flex items-center justify-between bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-zinc-800">
                      <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold">
                        {member.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-zinc-200">{member.user.name}</p>
                      <p className="text-xs text-zinc-500">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isPhantom && (
                      <span className="text-[8px] font-bold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md uppercase tracking-wider shrink-0">
                        Phantom Profile
                      </span>
                    )}
                    {member.userId !== currentUserId && (
                      <RemoveRoommateButton 
                        apartmentId={apartment.id} 
                        userId={member.userId}
                        name={member.user.name || "Roommate"}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="bg-zinc-900" />

        {/* Share Invite Link */}
        <div className="p-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Share2 className="h-4 w-4" /> Invite Roommates
          </h2>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Share this link with your roommates. When they register, they will automatically join your apartment.
          </p>
          <InviteLinkBox token={inviteToken} />
        </div>

        <Separator className="bg-zinc-900" />

        {/* Add Directly */}
        <div className="p-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Add Directly</h2>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Create a profile and add them to this apartment immediately. Perfect for roommates who don't want to log in yet.
          </p>
          <RoommateForm />
        </div>
      </ScrollArea>
    </div>
  );
}
