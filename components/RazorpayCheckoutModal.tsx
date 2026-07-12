"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldAlert, Loader2, Landmark } from "lucide-react";
import { toast } from "sonner";

export function RazorpayCheckoutModal({
  open,
  onOpenChange,
  amount,
  description,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onSuccess: () => Promise<void>;
}) {
  const [upiId, setUpiId] = useState("");
  const [phone, setPhone] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);

  const handleInitializePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || processing) return;

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setOtpMode(true);
      toast.info("Razorpay SMS OTP Sent: Enter '1234' to authorize.");
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234") {
      toast.error("Invalid verification code. Try '1234'.");
      return;
    }

    setProcessing(true);
    setTimeout(async () => {
      try {
        await onSuccess();
        toast.success(`Razorpay Payment Successful! Transferred ${formattedAmount}.`);
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || "Razorpay transaction rejected.");
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl overflow-hidden p-0">
        {/* Razorpay Brand Header Banner */}
        <div className="bg-[#0b1b3d] p-6 border-b border-zinc-800 text-center flex flex-col items-center">
          <div className="h-9 w-28 flex items-center justify-center font-black tracking-widest text-[#0584eb] text-xl select-none">
            Razorpay
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">{description}</p>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1">{formattedAmount}</h2>
        </div>

        <div className="p-6">
          {!otpMode ? (
            <form onSubmit={handleInitializePayment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Phone Number</label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-zinc-950 border-zinc-850 focus-visible:ring-[#0584eb]/50 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">UPI ID (Optional)</label>
                <Input
                  placeholder="name@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="bg-zinc-950 border-zinc-850 focus-visible:ring-[#0584eb]/50 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={processing || !phone}
                className="w-full h-12 bg-[#0584eb] text-white hover:bg-[#2094f0] font-bold rounded-xl mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Launching Razorpay...
                  </>
                ) : (
                  "Proceed to Pay"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5 text-center">
                  Verify Razorpay OTP (SMS)
                </label>
                <Input
                  required
                  placeholder="Enter '1234'"
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="bg-zinc-950 border-zinc-850 focus-visible:ring-[#0584eb]/50 rounded-xl text-center text-lg tracking-widest font-black h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={processing || otp.length < 4}
                className="w-full h-12 bg-green-500 hover:bg-green-400 text-zinc-950 font-bold rounded-xl mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Authorize Payment"
                )}
              </Button>
            </form>
          )}

          <p className="text-[9px] text-zinc-550 text-center flex items-center justify-center gap-1 mt-6">
            <ShieldAlert className="h-3 w-3 text-[#0584eb]" /> Secured by Razorpay Gateway 2.0 (India)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
