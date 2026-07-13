"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UserPlus, Search, Share2, Plus, Bell, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoommateForm } from "./RoommateForm";
import { RemoveRoommateButton } from "./RemoveRoommateButton";
import { InviteLinkBox } from "./InviteLinkBox";

interface Member {
  userId: string;
  apartmentId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface RoommatesClientProps {
  apartment: {
    id: string;
    name: string;
    plan: string;
    inviteLinkToken: string;
  };
  members: Member[];
  currentUserId: string;
}

export function RoommatesClient({ apartment, members, currentUserId }: RoommatesClientProps) {
  const [search, setSearch] = useState("");
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const name = member.user.name?.toLowerCase() || "";
    const email = member.user.email?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0e0e] text-zinc-550 relative pb-24">
      {/* Header - Mock 5 */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md shrink-0">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <span className="font-extrabold text-white text-base tracking-wide">Roommates</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.info("No new notifications.")}
            className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 tracking-wider flex items-center gap-1"
          >
            <Bell className="h-4 w-4" />
          </button>
          <Avatar className="h-8 w-8 border border-[#3a8469]/20">
            <AvatarFallback className="bg-zinc-900 text-[#3a8469] font-bold text-xs">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 text-left">
        {/* Apartment Plan Info Card - Mock 5 */}
        <div className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-5 flex justify-between items-center">
          <div>
            <h3 className="font-black text-white text-sm">{apartment.name}</h3>
            <p className="text-[10px] text-zinc-450 mt-1 leading-relaxed">
              {apartment.plan === "PRO" 
                ? "Pro Plan Active (Unlimited roommates)" 
                : apartment.plan === "BASIC"
                ? `Basic Plan Active (${members.length}/2 Roommates limit)`
                : `Free Plan (${members.length}/1 Roommate limit)`
              }
            </p>
          </div>
          <span className="text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-[#3a8469] bg-[#3a8469]/10 border border-[#3a8469]/20">
            {apartment.plan}
          </span>
        </div>

        {/* Search Field - Mock 5 */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4.5 w-4.5 text-zinc-550" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roommates..."
            className="h-12 bg-[#1e2021] border-zinc-900 focus-visible:ring-zinc-800 rounded-xl pl-11 text-xs text-zinc-200"
          />
        </div>

        {/* Current Members Section - Mock 5 */}
        <div className="space-y-4">
          <h2 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2">
            group Current Roommates
          </h2>

          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const isPhantom = !member.user.email || !["alice@example.com", "bob@example.com", "charlie@example.com"].includes(member.user.email);
              return (
                <div key={member.userId} className="flex items-center justify-between bg-[#181a1b] p-4.5 rounded-[20px] border border-zinc-900">
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-10 w-10 border border-zinc-800">
                      <AvatarFallback className="bg-zinc-900 text-[#3a8469] font-bold text-xs">
                        {member.user.name?.charAt(0) || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-zinc-150 text-sm leading-tight">{member.user.name}</p>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{member.user.email || "No email"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isPhantom && (
                      <span className="text-[8px] font-black text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                        PHANTOM PROFILE
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

            {filteredMembers.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">No roommates matching search.</p>
            )}
          </div>
        </div>

        {/* Invite/Add Roommates Box Card - Mock 5 */}
        <Card className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-5 overflow-hidden">
          <CardContent className="p-0 text-left space-y-4">
            <div className="flex gap-3">
              <div className="h-9 w-9 bg-[#3a8469]/10 border border-[#3a8469]/20 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="h-4.5 w-4.5 text-[#3a8469]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">Invite Roommates</h3>
                <p className="text-[10px] text-zinc-450 leading-relaxed">
                  Share this link with your roommates. When they register, they will automatically join your apartment group.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 pt-2">
              <Button
                onClick={() => setInviteOpen(true)}
                className="flex-1 h-11 bg-[#3a8469] text-zinc-950 hover:bg-[#2f6c56] font-black text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Share Link
              </Button>
              <Button
                onClick={() => setAddFormOpen(true)}
                className="flex-1 h-11 bg-[#242627] hover:bg-[#2c2f30] border border-zinc-900 text-zinc-200 font-bold text-xs rounded-xl transition-all"
              >
                Create New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Link Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <Share2 className="h-5 w-5 text-[#3a8469]" /> Share Invite Link
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <InviteLinkBox token={apartment.inviteLinkToken} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Roommate (Phantom) Dialog */}
      <Dialog open={addFormOpen} onOpenChange={setAddFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <UserPlus className="h-5 w-5 text-[#3a8469]" /> Create Phantom roommate
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-left">
            <p className="text-[10px] text-zinc-400 leading-relaxed mb-4">
              Add a roommate immediately. They can track bills right away, and we can link their email profile once they sign up.
            </p>
            <RoommateForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
