"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function StripeCheckoutModal({
  open,
  onOpenChange,
  amount,
  payeeName,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  payeeName: string;
  onSuccess: () => Promise<void>;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || processing) return;

    setProcessing(true);
    // Simulate gateway API processing delays
    setTimeout(async () => {
      try {
        await onSuccess();
        toast.success(`Stripe Charge Successful! Transferred ${formattedAmount}.`);
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || "Stripe transaction failed.");
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div className="h-11 w-11 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
            <CreditCard className="h-5 w-5 text-green-500" />
          </div>
          <DialogTitle className="text-lg font-black text-zinc-100 flex items-center gap-1.5 justify-center">
            Stripe Connect
          </DialogTitle>
          <p className="text-xs text-zinc-400 mt-1">
            Paying <span className="text-zinc-200 font-bold">{payeeName}</span> {formattedAmount}
          </p>
        </DialogHeader>

        <form onSubmit={handlePay} className="space-y-4 py-2">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Card Number</label>
              <div className="relative">
                <Input
                  required
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="bg-zinc-950 border-zinc-850 focus-visible:ring-green-500/50 rounded-xl pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CreditCard className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Expiry</label>
                <Input
                  required
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  className="bg-zinc-950 border-zinc-850 focus-visible:ring-green-500/50 rounded-xl text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">CVC</label>
                <Input
                  required
                  placeholder="123"
                  type="password"
                  maxLength={3}
                  value={cvc}
                  onChange={e => setCvc(e.target.value)}
                  className="bg-zinc-950 border-zinc-850 focus-visible:ring-green-500/50 rounded-xl text-center"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={processing || !cardNumber || !expiry || !cvc}
            className="w-full h-12 bg-green-500 text-zinc-950 hover:bg-green-400 font-bold rounded-xl mt-4 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
              </>
            ) : (
              `Pay ${formattedAmount}`
            )}
          </Button>

          <p className="text-[9px] text-zinc-500 text-center flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Secure checkout powered by Stripe Connect
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
