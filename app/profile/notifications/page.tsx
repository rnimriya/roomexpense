import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, MessageSquare, AlertCircle } from "lucide-react";

export default async function NotificationsSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 flex items-center gap-4 border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <span className="font-extrabold text-white text-base tracking-wide text-left">Push Notifications</span>
      </div>

      <div className="px-6 py-6 space-y-6 text-left">
        <div className="space-y-4">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
            nudge alert settings
          </p>

          <div className="space-y-3.5">
            {/* Toggle Row 1 */}
            <div className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Nudge Reminders</h4>
                  <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Receive alert logs when roommates nudge you</p>
                </div>
              </div>
              <div className="h-5.5 w-10 bg-[#82d0ad] rounded-full p-0.5 cursor-pointer relative flex items-center justify-end select-none">
                <div className="h-4.5 w-4.5 bg-zinc-950 rounded-full shadow-md" />
              </div>
            </div>

            {/* Toggle Row 2 */}
            <div className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Comment Alerts</h4>
                  <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Alert when roommates comment on expenses</p>
                </div>
              </div>
              <div className="h-5.5 w-10 bg-[#82d0ad] rounded-full p-0.5 cursor-pointer relative flex items-center justify-end select-none">
                <div className="h-4.5 w-4.5 bg-zinc-950 rounded-full shadow-md" />
              </div>
            </div>

            {/* Toggle Row 3 */}
            <div className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center">
                  <Bell className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">Monthly Summaries</h4>
                  <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Automated reports compiled by email</p>
                </div>
              </div>
              <div className="h-5.5 w-10 bg-[#82d0ad] rounded-full p-0.5 cursor-pointer relative flex items-center justify-end select-none">
                <div className="h-4.5 w-4.5 bg-zinc-950 rounded-full shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
