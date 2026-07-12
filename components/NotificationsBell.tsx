"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationsBell({ activities, currentUserId, users }: { activities: any[]; currentUserId: string; users: any[] }) {
  const [open, setOpen] = useState(false);

  // Filter activities created by others (so you get notified about them)
  const notifications = activities.filter(act => {
    if (act.type === "expense") {
      return act.data.creatorId !== currentUserId;
    } else {
      return act.data.payerId !== currentUserId;
    }
  }).slice(0, 5); // show last 5 notifications

  const unreadCount = notifications.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="relative p-2 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer outline-none">
        <Bell className="h-6 w-6 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black text-white pointer-events-none">
            {unreadCount}
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            <Bell className="h-5 w-5 text-green-500" /> In-App Alerts
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] mt-4 pr-2">
          {notifications.length === 0 ? (
            <p className="text-zinc-550 text-xs text-center py-8 italic">No new alerts.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n, idx) => {
                const dateStr = new Date(n.date).toLocaleDateString();
                if (n.type === "expense") {
                  const creator = users.find(u => u.id === n.data.creatorId);
                  return (
                    <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                      <p className="text-xs text-zinc-200 leading-normal">
                        <span className="font-bold text-zinc-100">{creator?.name || "Someone"}</span> added a new bill: <span className="font-semibold text-zinc-300">"{n.data.description}"</span>
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span>Total: ${(n.data.totalAmount / 100).toFixed(2)}</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  );
                } else {
                  const payer = users.find(u => u.id === n.data.payerId);
                  const payee = users.find(u => u.id === n.data.payeeId);
                  return (
                    <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                      <p className="text-xs text-zinc-200 leading-normal">
                        <span className="font-bold text-zinc-100">{payer?.name || "Someone"}</span> paid <span className="font-semibold text-zinc-300">{payee?.name || "Someone"}</span>
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span>Settle amount: ${(n.data.amount / 100).toFixed(2)}</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
