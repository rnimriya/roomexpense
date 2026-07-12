"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addRoommateAction } from "@/app/actions";
import { UserPlus } from "lucide-react";
import { PaywallUpgradeModal } from "@/components/PaywallUpgradeModal";

export function RoommateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email || loading) return;

    setLoading(true);
    try {
      await addRoommateAction({ name, email });
      setName("");
      setEmail("");
      toast.success("Roommate added successfully!");
      router.refresh();
    } catch (err: any) {
      if (err.message && err.message.includes("PAYWALL_TRIGGERED")) {
        setPaywallOpen(true);
      } else {
        toast.error(err.message || "Failed to add roommate");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaywallSuccess = async () => {
    // Retry adding the roommate after successful payment upgrade
    await handleSubmit();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah"
            required
            className="h-12 bg-zinc-900 border-zinc-850 focus-visible:ring-green-500/50 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            required
            className="h-12 bg-zinc-900 border-zinc-850 focus-visible:ring-green-500/50 rounded-xl"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !name || !email}
          className="w-full h-12 bg-green-500 hover:bg-green-400 text-zinc-950 font-bold rounded-xl active:scale-95 transition-transform cursor-pointer"
        >
          <UserPlus className="mr-2 h-5 w-5" /> Add Roommate
        </Button>
      </form>

      {/* SaaS Paywall Upgrade Modal */}
      {paywallOpen && (
        <PaywallUpgradeModal
          open={paywallOpen}
          onOpenChange={setPaywallOpen}
          apartmentId="a1"
          onSuccess={handlePaywallSuccess}
        />
      )}
    </>
  );
}
