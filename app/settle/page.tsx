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
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-6 w-6 text-zinc-400" />
        </button>
        <span className="font-bold text-zinc-100 tracking-wider">
          Settle Up
        </span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 pt-4 pb-8 overflow-y-auto">
        {fetching ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-zinc-550 font-medium">Loading your debts...</p>
          </div>
        ) : peopleYouOwe.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <Check className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">You're all settled!</h2>
            <p className="text-zinc-500">You don't owe anyone right now.</p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="mt-8 h-12 px-8 bg-zinc-100 text-zinc-950 font-bold rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
            <div className="space-y-6 flex-1">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-3">Who did you pay?</label>
                <Select value={payeeId} onValueChange={(val) => setPayeeId(val || "")}>
                  <SelectTrigger className="w-full h-16 bg-zinc-900/50 border-zinc-800 text-lg rounded-2xl px-4 focus:ring-green-500/20">
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
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-3">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-6 w-6 text-zinc-400" />
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 bg-zinc-900/50 border-zinc-800 text-2xl font-semibold rounded-2xl pl-12 focus-visible:ring-green-500/50"
                  />
                </div>
              </div>

              {/* V2 Payment Integrations Launch UI */}
              {payeeId && paymentAmount > 0 && (
                <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Choose Payment Method</p>
                  
                  {/* Razorpay Trigger */}
                  <button
                    type="button"
                    onClick={() => setRazorpayOpen(true)}
                    className="w-full h-12 bg-[#0584eb] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform text-sm cursor-pointer shadow-[0_0_20px_-5px_rgba(5,132,235,0.3)]"
                  >
                    <CreditCard className="h-4 w-4" /> Pay with Razorpay (UPI / Card)
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
              className="w-full h-14 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-lg font-bold rounded-2xl mt-auto shrink-0"
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
