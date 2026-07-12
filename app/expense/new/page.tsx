"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createExpenseAction } from "@/app/actions";

export default function AddExpensePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amountString, setAmountString] = useState("0");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"EQUAL" | "EXACT" | "PERCENTAGE">("EQUAL");
  const [loading, setLoading] = useState(false);

  // Handle keypad input
  const handleKeypadClick = (val: string) => {
    if (val === "BACKSPACE") {
      setAmountString(prev => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else {
      setAmountString(prev => (prev === "0" ? val : prev + val));
    }
  };

  const amountCents = parseInt(amountString, 10);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);

  const handleSubmit = async () => {
    setLoading(true);
    const creatorId = (session?.user as any)?.id || "u1";

    try {
      await createExpenseAction({
        creatorId,
        description,
        totalAmount: amountCents,
        splitType,
      });
      toast.success("Expense added successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={() => {
            if (step > 1) setStep((s) => (s - 1) as any);
            else router.push("/dashboard");
        }} className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <X className="h-6 w-6 text-zinc-400" />
        </button>
        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
          Step {step} of 3
        </span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Screen 1: Amount */}
      {step === 1 && (
        <div className="flex flex-col flex-1 pb-safe">
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-zinc-500 font-medium mb-4 uppercase tracking-widest text-sm">Amount</p>
            <h1 className="text-6xl font-black tracking-tighter text-zinc-100">
              {formattedAmount}
            </h1>
          </div>
          
          <div className="px-6 pb-8">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadClick(num.toString())}
                  className="h-16 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-2xl font-semibold text-zinc-100 transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <div /> {/* Empty space */}
              <button
                onClick={() => handleKeypadClick("0")}
                className="h-16 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-2xl font-semibold text-zinc-100 transition-colors active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => handleKeypadClick("BACKSPACE")}
                className="h-16 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-xl font-semibold text-zinc-400 flex items-center justify-center transition-colors active:scale-95"
              >
                ⌫
              </button>
            </div>
            
            <Button 
              onClick={() => setStep(2)} 
              disabled={amountCents === 0}
              className="w-full h-14 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-lg font-bold rounded-2xl"
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Screen 2: Description */}
      {step === 2 && (
        <div className="flex flex-col flex-1 px-6 pb-8">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
            <p className="text-zinc-500 font-medium mb-8 uppercase tracking-widest text-sm">What is this for?</p>
            <Input
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Internet Bill"
              className="h-16 bg-zinc-900/50 border-zinc-800 text-2xl text-center placeholder:text-zinc-700 font-semibold rounded-2xl focus-visible:ring-zinc-700"
            />
          </div>
          <Button 
            onClick={() => setStep(3)} 
            disabled={description.trim() === ""}
            className="w-full h-14 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-lg font-bold rounded-2xl mt-auto"
          >
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Screen 3: Split Logic */}
      {step === 3 && (
        <div className="flex flex-col flex-1 px-6 pb-8">
          <div className="flex-1 mt-8">
            <p className="text-zinc-500 font-medium mb-6 uppercase tracking-widest text-sm text-center">How to split?</p>
            
            <div className="space-y-4">
              {[
                { id: "EQUAL", label: "Equally", desc: "Split the cost evenly among everyone." },
                { id: "EXACT", label: "Exact Amounts", desc: "Specify exactly who owes what." },
                { id: "PERCENTAGE", label: "Percentages", desc: "Split by percentage." }
              ].map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setSplitType(type.id as any)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    splitType === type.id 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-bold ${splitType === type.id ? 'text-green-500' : 'text-zinc-100'}`}>
                        {type.label}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">{type.desc}</p>
                    </div>
                    {splitType === type.id && <Check className="h-5 w-5 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
            
            {/* MVP Note for Exact/Percentage */}
            {splitType !== "EQUAL" && (
              <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-sm text-zinc-400 text-center">
                This splits equally for the MVP but will save your split settings to the database.
              </div>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full h-14 bg-green-500 text-zinc-950 hover:bg-green-400 text-lg font-bold rounded-2xl mt-auto"
          >
            {loading ? "Adding..." : "Add Expense"} <Check className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
