"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UserPlus, Search, Share2, Plus, Bell, Trash2, Camera, Sparkles, User, Mail, Phone, Shield, ShieldOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoommateForm } from "./RoommateForm";
import { RemoveRoommateButton } from "./RemoveRoommateButton";
import { InviteLinkBox } from "./InviteLinkBox";
import { updateRoommateProfileAction, toggleAdminAction } from "@/app/actions";

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop"
];

export function RoommatesClient({
  apartment,
  members,
  currentUserId,
}: {
  apartment: any;
  members: any[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);

  // Edit Profile states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [togglingAdminId, setTogglingAdminId] = useState<string | null>(null);

  const currentUserIsAdmin = members.find((m) => m.userId === currentUserId)?.isAdmin || false;

  // Filter members by search input
  const filteredMembers = members.filter((member) =>
    member.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    member.user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * AVATARS.length);
    setEditImageUrl(AVATARS[randomIndex]);
    toast.success("Random avatar picked!");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || updatingProfile) return;

    setUpdatingProfile(true);
    try {
      await updateRoommateProfileAction(selectedMemberId, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        imageUrl: editImageUrl.trim()
      });
      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (togglingAdminId) return;
    setTogglingAdminId(userId);
    try {
      await toggleAdminAction(apartment.id, userId, !currentAdminStatus);
      toast.success(currentAdminStatus ? "Admin rights revoked" : "User promoted to admin");
    } catch (err: any) {
      toast.error(err.message || "Failed to change role");
    } finally {
      setTogglingAdminId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24 select-none">
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
          <Avatar className="h-8 w-8 border border-[#82d0ad]/20">
            <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
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
            <p className="text-[10px] text-zinc-455 mt-1 leading-relaxed">
              {apartment.plan === "PRO" 
                ? "Pro Plan Active (Unlimited roommates)" 
                : apartment.plan === "BASIC"
                ? `Basic Plan Active (${members.length}/2 Roommates limit)`
                : `Free Plan (${members.length}/1 Roommate limit)`
              }
            </p>
          </div>
          <span className="text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-[#82d0ad] bg-[#82d0ad]/10 border border-[#82d0ad]/20">
            {apartment.plan}
          </span>
        </div>

        {/* Search Field - Mock 5 */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4.5 w-4.5 text-zinc-555" />
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
                <div key={member.userId} className="flex flex-col gap-3 bg-[#181a1b] p-4.5 rounded-[20px] border border-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-10 w-10 border border-zinc-800 shrink-0 overflow-hidden relative">
                        {member.user.image && (
                          <img 
                            src={member.user.image} 
                            alt={member.user.name || "Roommate"} 
                            className="h-full w-full object-cover rounded-full" 
                          />
                        )}
                        <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
                          {member.user.name?.charAt(0) || "R"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-zinc-150 text-sm leading-tight truncate">{member.user.name}</p>
                          {member.isAdmin && (
                            <span className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest text-[#82d0ad] bg-[#82d0ad]/10 border border-[#82d0ad]/30">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate">{member.user.email || "No email"}</p>
                        {member.user.phone && <p className="text-[10px] text-zinc-600 font-medium truncate">{member.user.phone}</p>}
                      </div>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {isPhantom && (
                        <span className="text-[8px] font-black text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                          PHANTOM
                        </span>
                      )}
                      
                      {/* Make Admin Toggle */}
                      {currentUserIsAdmin && member.userId !== currentUserId && (
                        <button
                          type="button"
                          disabled={togglingAdminId === member.userId}
                          onClick={() => handleToggleAdmin(member.userId, member.isAdmin)}
                          className={`p-2.5 border rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                            member.isAdmin 
                              ? "bg-zinc-900 border-zinc-800 text-[#82d0ad] hover:bg-zinc-800" 
                              : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                          }`}
                          title={member.isAdmin ? "Revoke Admin" : "Make Admin"}
                        >
                          {togglingAdminId === member.userId ? (
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          ) : member.isAdmin ? (
                            <Shield className="h-4.5 w-4.5" />
                          ) : (
                            <ShieldOff className="h-4.5 w-4.5" />
                          )}
                        </button>
                      )}

                      {/* Edit Profile trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberId(member.user.id);
                          setEditName(member.user.name || "");
                          setEditEmail(member.user.email || "");
                          setEditPhone(member.user.phone || "");
                          setEditImageUrl(member.user.image || "");
                          setEditProfileOpen(true);
                        }}
                        className="p-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-[#82d0ad] rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="Edit Profile"
                      >
                        <User className="h-4.5 w-4.5" />
                      </button>

                      {currentUserIsAdmin && member.userId !== currentUserId && (
                        <RemoveRoommateButton 
                          apartmentId={apartment.id} 
                          userId={member.userId} 
                          name={member.user.name || "Roommate"}
                        />
                      )}
                    </div>
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
              <div className="h-9 w-9 bg-[#82d0ad]/10 border border-[#82d0ad]/20 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="h-4.5 w-4.5 text-[#82d0ad]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">Invite Roommates</h3>
                <p className="text-[10px] text-zinc-455 leading-relaxed">
                  Share this link with your roommates. When they register, they will automatically join your apartment group.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="flex-1 h-11 bg-[#82d0ad] text-zinc-955 hover:bg-[#71bda0] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Share Link
              </button>
              <button
                type="button"
                onClick={() => setAddFormOpen(true)}
                className="flex-1 h-11 bg-[#242627] hover:bg-[#2c2f30] border border-zinc-900 text-zinc-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Create New
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Invite Link Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <Share2 className="h-5 w-5 text-[#82d0ad]" /> Share Invite Link
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <InviteLinkBox token={apartment.inviteLinkToken} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Roommate Dialog */}
      <Dialog open={addFormOpen} onOpenChange={setAddFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-550 max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <UserPlus className="h-5 w-5 text-[#82d0ad]" /> Create roommate profile
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

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100 text-sm font-black uppercase tracking-wider">
              <User className="h-5 w-5 text-[#82d0ad]" /> Edit Profile
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="py-2 text-left space-y-4">
            
            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Full Name</label>
              <div className="relative">
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12 bg-zinc-950 border-zinc-850 focus-visible:ring-[#82d0ad]/50 rounded-xl pl-10 text-xs"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-12 bg-zinc-950 border-zinc-850 focus-visible:ring-[#82d0ad]/50 rounded-xl pl-10 text-xs"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Phone Number</label>
              <div className="relative">
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-12 bg-zinc-950 border-zinc-850 focus-visible:ring-[#82d0ad]/50 rounded-xl pl-10 text-xs"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Photo URL</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-12 bg-zinc-950 border-zinc-850 focus-visible:ring-[#82d0ad]/50 rounded-xl text-zinc-100 flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="h-12 px-3 bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-zinc-350 text-[10px] uppercase font-bold tracking-wider shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#82d0ad]" /> Pick Avatar
                </button>
              </div>
            </div>

            {editImageUrl && (
              <div className="flex items-center gap-4 p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                <div className="h-12 w-12 rounded-full border border-zinc-800 overflow-hidden shrink-0">
                  <img src={editImageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <p className="text-[9px] text-zinc-500 truncate flex-1">Avatar preview loaded successfully</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-zinc-200 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingProfile}
                className="flex-1 h-11 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {updatingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
