"use client";

import { useState } from "react";
import { toast } from "sonner";
import { sendNudgeAction } from "@/app/actions";
import { Bell } from "lucide-react";

export function NudgeButton({ senderId, recipientId, amountCents }: { senderId: string; recipientId: string; amountCents: number }) {
  const [loading, setLoading] = useState(false);

  const handleNudge = async () => {
    setLoading(true);
    try {
      await sendNudgeAction(senderId, recipientId, amountCents);
      toast.success("Roommate nudged!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send nudge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleNudge}
      disabled={loading}
      className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors uppercase tracking-wider bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1 shrink-0"
    >
      <Bell className="h-3 w-3" />
      {loading ? "Sending..." : "Nudge"}
    </button>
  );
}
