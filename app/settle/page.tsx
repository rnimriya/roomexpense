"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getPeopleYouOweAction, createSettlementAction } from "@/app/actions";
import { RazorpayCheckoutModal } from "@/components/RazorpayCheckoutModal";

export default function SettleUpPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [peopleYouOwe, setPeopleYouOwe] = useState<any[]>([]);
  const [payeeId, setPayeeId] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  const currentUserId = (session?.user as any)?.id || "u1";

  // Fetch people the user owes from database
  useEffect(() => {
    async function loadOwedData() {
      if (session?.user) {
        try {
          const data = await getPeopleYouOweAction(currentUserId);
          setPeopleYouOwe(data);
        } catch (error) {
          console.error("Failed to load debts", error);
        } finally {
          setFetching(false);
        }
      }
    }
    loadOwedData();
  }, [session, currentUserId]);

  // When a payee is selected, default the amount to what is owed
  useEffect(() => {
    if (payeeId) {
      const person = peopleYouOwe.find(p => p.userId === payeeId);
      if (person) {
        setAmountStr((person.amountOwed / 100).toFixed(2));
      }
    }
  }, [payeeId, peopleYouOwe]);

  const selectedPayee = peopleYouOwe.find(p => p.userId === payeeId);
  const payeeEmail = selectedPayee?.user?.email || "";
  const payeeName = selectedPayee?.user?.name || "Roommate";
  const payeeUsername = payeeEmail.split("@")[0] || "";
  const paymentAmount = parseFloat(amountStr) || 0;

  // Payment deep links
  const venmoLink = `https://venmo.com/?txn=pay&recipients=${encodeURIComponent(payeeEmail)}&amount=${paymentAmount}&note=${encodeURIComponent("FairShare Settlement")}`;
  const paypalLink = `https://www.paypal.com/paypalme/${payeeUsername}/${paymentAmount}`;

  // Execute actual database logging upon stripe charge success
  const handleStripeSuccess = async () => {
    const amountCents = Math.round(parseFloat(amountStr) * 100);
    await createSettlementAction({
      payerId: currentUserId,
      payeeId,
      amount: amountCents,
    });
    router.push("/dashboard");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeId || !amountStr || loading) return;

    setLoading(true);
    const amountCents = Math.round(parseFloat(amountStr) * 100);

    try {
      await createSettlementAction({
        payerId: currentUserId,
        payeeId,
        amount: amountCents,
      });
      toast.success("Payment recorded!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c0e0e] text-zinc-50 relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <span className="font-extrabold text-white text-base tracking-wide">
          Settle Up
        </span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 pt-4 pb-8 overflow-y-auto text-left">
        {fetching ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-zinc-550 font-medium text-xs">Loading your debts...</p>
          </div>
        ) : peopleYouOwe.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-xs mx-auto">
            <div className="h-16 w-16 bg-[#3a8469]/10 rounded-full flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-[#3a8469]" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">You're all settled!</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">You don't owe anyone right now.</p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="mt-8 h-13 px-8 bg-[#3a8469] text-zinc-950 font-black rounded-xl w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
            <div className="space-y-6 flex-1">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-3">WHO DID YOU PAY?</label>
                <Select value={payeeId} onValueChange={(val) => setPayeeId(val || "")}>
                  <SelectTrigger className="w-full h-14 bg-[#1e2021] border-zinc-900 text-sm rounded-xl px-4 focus:ring-[#3a8469]/20 text-zinc-200">
                    <SelectValue placeholder="Select roommate" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {peopleYouOwe.map(person => (
                      <SelectItem key={person.userId} value={person.userId} className="focus:bg-zinc-800 py-3">
                        {person.user?.name} (You owe ${(person.amountOwed / 100).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-3">AMOUNT</label>
                <div className="relative flex items-center">
                  <DollarSign className="absolute left-4 h-5 w-5 text-zinc-500" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-14 bg-[#1e2021] border-zinc-900 text-lg font-bold rounded-xl pl-11 focus-visible:ring-[#3a8469]/50 text-zinc-200"
                  />
                </div>
              </div>

              {/* V2 Payment Integrations Launch UI */}
              {payeeId && paymentAmount > 0 && (
                <div className="bg-[#181a1b] border border-zinc-900 p-5 rounded-[20px] space-y-4">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Choose Payment Method</p>
                  
                  {/* Razorpay Trigger */}
                  <button
                    type="button"
                    onClick={() => setRazorpayOpen(true)}
                    className="w-full h-12 bg-[#3a8469] text-zinc-950 hover:bg-[#2f6c56] font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform text-xs cursor-pointer shadow-[0_0_20px_-5px_rgba(130,208,173,0.3)]"
                  >
                    <CreditCard className="h-4.5 w-4.5" /> Pay with Razorpay (UPI / Card)
                  </button>

                  <div className="flex gap-3">
                    <a
                      href={venmoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 h-11 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform text-xs text-center"
                    >
                      Venmo Link
                    </a>
                    <a
                      href={paypalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 h-11 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform text-xs text-center"
                    >
                      PayPal Link
                    </a>
                  </div>
                  <p className="text-[9px] text-zinc-550 text-center leading-relaxed">
                    Paying via Razorpay settles the balance natively immediately. Venmo/PayPal require confirming details in their apps.
                  </p>
                </div>
              )}
            </div>

            <Button 
              type="submit"
              disabled={!payeeId || !amountStr || parseFloat(amountStr) <= 0 || loading}
              className="w-full h-13 bg-[#3a8469] text-zinc-950 hover:bg-[#2f6c56] text-sm font-black rounded-xl mt-auto shrink-0 cursor-pointer active:scale-98"
            >
              {loading ? "Recording..." : "Record Manual Cash Payment"}
            </Button>
          </form>
        )}
      </div>

      {/* Razorpay Connect Modal */}
      {razorpayOpen && (
        <RazorpayCheckoutModal
          open={razorpayOpen}
          onOpenChange={setRazorpayOpen}
          amount={Math.round(paymentAmount * 83 * 100)} // USD to INR conversion
          description={`Settlement with ${payeeName}`}
          onSuccess={handleStripeSuccess}
        />
      )}
    </div>
  );
}
