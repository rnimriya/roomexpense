"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addRoommateAction } from "@/app/actions";
import { UserPlus, Sparkles, RefreshCw } from "lucide-react";
import { PaywallUpgradeModal } from "@/components/PaywallUpgradeModal";

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

export function RoommateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTier, setPaywallTier] = useState<"BASIC" | "PRO">("BASIC");

  const handleRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * AVATARS.length);
    setImageUrl(AVATARS[randomIndex]);
    toast.success("Random roommate avatar selected!");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email || loading) return;

    setLoading(true);
    try {
      await addRoommateAction({ 
        name, 
        email, 
        imageUrl: imageUrl.trim() || undefined 
      });
      setName("");
      setEmail("");
      setImageUrl("");
      toast.success("Roommate added successfully!");
      router.refresh();
    } catch (err: any) {
      if (err.message && err.message.includes("PAYWALL_BASIC_TRIGGERED")) {
        setPaywallTier("BASIC");
        setPaywallOpen(true);
      } else if (err.message && err.message.includes("PAYWALL_PRO_TRIGGERED")) {
        setPaywallTier("PRO");
        setPaywallOpen(true);
      } else {
        toast.error(err.message || "Failed to add roommate");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaywallSuccess = async () => {
    await handleSubmit();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah"
            required
            className="h-12 bg-zinc-900 border-zinc-850 focus-visible:ring-zinc-850 rounded-xl text-zinc-100"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            required
            className="h-12 bg-zinc-900 border-zinc-850 focus-visible:ring-zinc-850 rounded-xl text-zinc-100"
          />
        </div>

        {/* Profile Photo - New Feature */}
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">Profile Photo URL (Optional)</label>
          <div className="flex gap-2.5">
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="h-12 bg-zinc-900 border-zinc-850 focus-visible:ring-zinc-850 rounded-xl text-zinc-100 flex-1 text-xs"
            />
            <button
              type="button"
              onClick={handleRandomAvatar}
              className="h-12 px-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-zinc-350 text-[10px] uppercase font-bold tracking-wider shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#82d0ad]" /> Random
            </button>
          </div>
          {imageUrl && (
            <div className="mt-3 flex items-center gap-3.5 p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-xl">
              <div className="h-10 w-10 rounded-full border border-zinc-850 overflow-hidden shrink-0">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <p className="text-[9px] text-zinc-500 truncate flex-1">Avatar preview loaded successfully</p>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || !name || !email}
          className="w-full h-12 bg-[#82d0ad] hover:bg-[#71bda0] text-zinc-950 font-bold rounded-xl active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1.5 mt-2"
        >
          <UserPlus className="h-4.5 w-4.5" /> Add Roommate
        </button>
      </form>

      {/* SaaS Paywall Upgrade Modal */}
      {paywallOpen && (
        <PaywallUpgradeModal
          open={paywallOpen}
          onOpenChange={setPaywallOpen}
          apartmentId="a1"
          tier={paywallTier}
          onSuccess={handlePaywallSuccess}
        />
      )}
    </>
  );
}
