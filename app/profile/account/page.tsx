import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Mail, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const currentUserId = (session.user as any).id || "u1";

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

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 flex items-center gap-4 border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <span className="font-extrabold text-white text-base tracking-wide text-left">Account Information</span>
      </div>

      <div className="px-6 py-6 space-y-6 text-left">
        <div className="space-y-4">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
            personal details
          </p>

          <form className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-4.5 w-4.5 text-zinc-550" />
                <Input
                  defaultValue={user?.name || ""}
                  disabled
                  className="h-13 bg-[#181a1b] border-zinc-900 rounded-xl text-zinc-400 pl-11 select-none opacity-80"
                />
              </div>
              <p className="text-[8px] text-zinc-600 mt-1">Profile name updates are disabled for MVP.</p>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-4.5 w-4.5 text-zinc-550" />
                <Input
                  defaultValue={user?.email || ""}
                  disabled
                  className="h-13 bg-[#181a1b] border-zinc-900 rounded-xl text-zinc-400 pl-11 select-none opacity-80"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Default Currency</label>
              <div className="relative flex items-center">
                <DollarSign className="absolute left-4 h-4.5 w-4.5 text-zinc-550" />
                <Input
                  defaultValue="USD ($)"
                  disabled
                  className="h-13 bg-[#181a1b] border-zinc-900 rounded-xl text-zinc-400 pl-11 select-none opacity-80"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
            apartment group
          </p>
          <div className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-5">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Group Name</h4>
                <p className="text-[10px] text-[#82d0ad] font-bold mt-1 uppercase tracking-wider">{apartmentName}</p>
              </div>
              <span className="text-[8px] font-black text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase tracking-wider">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
