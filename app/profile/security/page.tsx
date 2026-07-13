import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function SecuritySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 flex items-center gap-4 border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <span className="font-extrabold text-white text-base tracking-wide text-left">Privacy & Security</span>
      </div>

      <div className="px-6 py-6 space-y-6 text-left">
        <div className="space-y-4">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
            password security
          </p>

          <form className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Current Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4.5 w-4.5 text-zinc-550" />
                <Input
                  type="password"
                  value="••••••••"
                  disabled
                  className="h-13 bg-[#181a1b] border-zinc-900 rounded-xl text-zinc-400 pl-11 select-none opacity-80"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">New Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4.5 w-4.5 text-zinc-550" />
                <Input
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="h-13 bg-[#181a1b] border-zinc-900 rounded-xl text-zinc-400 pl-11 select-none opacity-80"
                />
              </div>
            </div>
          </form>
          <p className="text-[8px] text-zinc-600">Password updates are disabled for security verification in demo mode.</p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
            active sessions
          </p>
          <div className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#82d0ad]/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#82d0ad]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">MacBook Air</h4>
                  <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Current Session • India</p>
                </div>
              </div>
              <span className="text-[8px] font-black text-[#82d0ad] bg-[#82d0ad]/10 border border-[#82d0ad]/20 px-2 py-0.5 rounded uppercase tracking-wider">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
