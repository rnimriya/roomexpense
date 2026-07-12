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
  tier,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartmentId: string;
  tier: "BASIC" | "PRO";
  onSuccess: () => void;
}) {
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  // Billing parameters
  const isBasic = tier === "BASIC";
  
  // 1st month trial is free! So we charge a ₹1.00 authentication setup fee today
  const upgradeCostINR = 100; // ₹1.00 in paise for trial verification
  const costUSD = isBasic ? "$5.00" : "$12.00";
  const costINRFormal = isBasic ? "₹420.00" : "₹990.00";
  const countText = isBasic ? "2 Roommates" : "3 Roommates";
  const rateUSD = isBasic ? "$2.50" : "$4.00";

  const handleUpgradeSuccess = async () => {
    try {
      await upgradeApartmentAction(apartmentId, tier);
      toast.success(`30-Day Free Trial Activated for FairShare ${isBasic ? "Basic" : "Pro"}!`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to start trial.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl relative overflow-hidden p-6">
          <div className="absolute top-0 right-0 bg-green-500/10 border-b border-l border-green-500/20 px-3 py-1 text-[9px] font-bold text-green-500 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 select-none">
            <Sparkles className="h-3 w-3" /> 1-Month Free Trial
          </div>

          <DialogHeader className="items-center text-center mt-4">
            <div className="h-14 w-14 bg-[#0584eb]/10 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-[#0584eb]" />
            </div>
            <DialogTitle className="text-xl font-black text-zinc-100">Start 30-Day Trial</DialogTitle>
            <p className="text-xs text-zinc-450 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Unlock FairShare {isBasic ? "Basic" : "Pro"}. Try free for 30 days, cancel anytime.
            </p>
          </DialogHeader>

          {/* Pricing Details */}
          <div className="my-5 p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450 font-medium">Pricing Tier:</span>
              <span className="text-zinc-200 font-bold">{rateUSD} / roommate / month</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450 font-medium">Due Today (Trial Setup):</span>
              <span className="text-green-500 font-bold">₹1.00 (Fully Refundable)</span>
            </div>
            <div className="border-t border-zinc-850 pt-3 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-zinc-100">Monthly Cost (After 30 days)</p>
                <p className="text-[10px] text-zinc-500 font-medium">Cancel before trial ends</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-white">{costUSD} / month</p>
                <p className="text-[10px] text-zinc-400 font-bold">{costINRFormal} / mo</p>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Free 30-day access to all features</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Native Razorpay & automated settlements</span>
            </div>
          </div>

          <Button
            onClick={() => setRazorpayOpen(true)}
            className="w-full h-13 bg-[#0584eb] text-white hover:bg-[#2094f0] font-black rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_-5px_rgba(5,132,235,0.25)]"
          >
            Start Free Trial (₹1 Auth Check)
          </Button>

          <p className="text-[9px] text-zinc-550 text-center flex items-center justify-center gap-1 mt-5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Secure verification powered by Razorpay.
          </p>
        </DialogContent>
      </Dialog>

      {/* Razorpay Gateway Portal */}
      {razorpayOpen && (
        <RazorpayCheckoutModal
          open={razorpayOpen}
          onOpenChange={setRazorpayOpen}
          amount={upgradeCostINR}
          description={`Start 30-Day Free Trial (${isBasic ? "Basic" : "Pro"})`}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </>
  );
}
