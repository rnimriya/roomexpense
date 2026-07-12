"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RazorpayCheckoutModal } from "./RazorpayCheckoutModal";
import { upgradeApartmentAction } from "@/app/actions";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function PaywallUpgradeModal({
  open,
  onOpenChange,
  apartmentId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartmentId: string;
  onSuccess: () => void;
}) {
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  // Pricing: $4.00 per roommate/month. For 3 roommates, that is $12.00 (approx ₹990 INR)
  const upgradeCostINR = 99000; // ₹990.00 in paise

  const handleUpgradeSuccess = async () => {
    try {
      await upgradeApartmentAction(apartmentId);
      toast.success("Apartment successfully upgraded to FairShare Pro!");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize subscription upgrade.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl relative overflow-hidden p-6">
          <div className="absolute top-0 right-0 bg-green-500/10 border-b border-l border-green-500/20 px-3 py-1 text-[9px] font-bold text-green-500 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 select-none">
            <Sparkles className="h-3 w-3" /> SaaS PRO Tier
          </div>

          <DialogHeader className="items-center text-center mt-4">
            <div className="h-14 w-14 bg-[#0584eb]/10 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-[#0584eb]" />
            </div>
            <DialogTitle className="text-xl font-black text-zinc-100">Upgrade to Pro</DialogTitle>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              FairShare is free for up to 2 roommates. Adding a 3rd roommate requires a Pro Subscription.
            </p>
          </DialogHeader>

          {/* Pricing Details */}
          <div className="my-5 p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450 font-medium">Free Plan Limit:</span>
              <span className="text-zinc-200 font-bold">2 Roommates Max</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450 font-medium">Pro Subscription:</span>
              <span className="text-green-500 font-bold">$4.00 (₹330) / roommate / mo</span>
            </div>
            <div className="border-t border-zinc-850 pt-3 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-zinc-100">Total (3 Roommates)</p>
                <p className="text-[10px] text-zinc-500 font-medium">Recurring billing monthly</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-white">$12.00 / month</p>
                <p className="text-[10px] text-zinc-400 font-bold">₹990.00 / mo</p>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Unlimited bills, recurring templates, and nudges</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Native Razorpay & simulated bank transfers</span>
            </div>
          </div>

          <Button
            onClick={() => setRazorpayOpen(true)}
            className="w-full h-13 bg-[#0584eb] text-white hover:bg-[#2094f0] font-black rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_-5px_rgba(5,132,235,0.25)]"
          >
            Upgrade via Razorpay
          </Button>

          <p className="text-[9px] text-zinc-550 text-center flex items-center justify-center gap-1 mt-5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Cancel anytime. Money-back guarantee.
          </p>
        </DialogContent>
      </Dialog>

      {/* Razorpay Gateway Portal */}
      {razorpayOpen && (
        <RazorpayCheckoutModal
          open={razorpayOpen}
          onOpenChange={setRazorpayOpen}
          amount={upgradeCostINR}
          description="SaaS Pro Upgrade (3 Roommates)"
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </>
  );
}
