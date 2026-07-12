"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Check, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createExpenseAction, getSplitTemplatesAction } from "@/app/actions";

export default function AddExpensePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amountString, setAmountString] = useState("0");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"EQUAL" | "EXACT" | "PERCENTAGE">("EQUAL");
  const [loading, setLoading] = useState(false);
  
  // V2 features
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await getSplitTemplatesAction();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    }
    fetchTemplates();
  }, []);

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

  // Attach a mock receipt image
  const handleAttachMockReceipt = () => {
    const mockReceipt = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop";
    setReceiptUrl(mockReceipt);
    toast.success("Mock receipt attached!");
  };

  // Simulate OCR Scanning (Phase 111)
  const handleOCRScan = () => {
    if (scanning) return;
    setScanning(true);
    
    // Simulate OCR delay (1.5 seconds)
    setTimeout(() => {
      setScanning(false);
      setAmountString("1320"); // $13.20
      setDescription("Groceries (OCR Scan)");
      setReceiptUrl("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop");
      toast.success("OCR scanning complete! Total: $13.20. Details filled.");
      setStep(2); // Jump to Step 2 to verify description
    }, 1500);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const creatorId = (session?.user as any)?.id || "u1";

    let customSplits: any[] = [];
    let activeSplitType = splitType;

    // If template selected, parse splits
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        customSplits = JSON.parse(template.splits);
        activeSplitType = "PERCENTAGE";
      }
    }

    try {
      await createExpenseAction({
        creatorId,
        description,
        totalAmount: amountCents,
        splitType: activeSplitType,
        receiptUrl: receiptUrl || undefined,
        isRecurring,
        recurringInterval: isRecurring ? "MONTHLY" : undefined,
        customSplits: customSplits.length > 0 ? customSplits : undefined,
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
        <div className="w-10"></div>
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
            {/* Quick scan receipt button */}
            <button
              type="button"
              onClick={handleOCRScan}
              disabled={scanning}
              className="w-full h-14 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 font-semibold rounded-2xl flex items-center justify-center gap-2 mb-4 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-green-500" />
              {scanning ? "Parsing receipt text..." : "Scan Receipt with OCR"}
            </button>

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
              <div />
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

      {/* Screen 2: Description & Receipt Attachment */}
      {step === 2 && (
        <div className="flex flex-col flex-1 px-6 pb-8">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto space-y-8">
            <div className="text-center w-full">
              <p className="text-zinc-500 font-medium mb-4 uppercase tracking-widest text-sm">What is this for?</p>
              <Input
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Internet Bill"
                className="h-16 bg-zinc-900/50 border-zinc-850 text-2xl text-center placeholder:text-zinc-700 font-semibold rounded-2xl focus-visible:ring-zinc-700"
              />
            </div>

            {/* V2 Attachment */}
            <div className="w-full">
              <button 
                type="button"
                onClick={handleAttachMockReceipt}
                className={`w-full p-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  receiptUrl 
                    ? 'border-green-500/50 bg-green-500/5 text-green-500' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <Paperclip className="h-4 w-4" />
                {receiptUrl ? "Receipt Attached" : "Attach Mock Receipt"}
              </button>
              
              {receiptUrl && (
                <p className="text-center text-[10px] text-zinc-500 mt-2 truncate max-w-xs mx-auto">
                  Receipt preview loaded successfully.
                </p>
              )}
            </div>

            {/* V2 Recurring check */}
            <div className="flex items-center gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-905 w-full">
              <input 
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-800 bg-zinc-955 text-green-500 focus:ring-green-500/20"
              />
              <label htmlFor="isRecurring" className="text-sm font-semibold text-zinc-300 cursor-pointer">
                Repeat this expense monthly (Rent/Internet)
              </label>
            </div>
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

      {/* Screen 3: Split Logic & Templates */}
      {step === 3 && (
        <div className="flex flex-col flex-1 px-6 pb-8 overflow-y-auto">
          <div className="flex-1 mt-6 space-y-6">
            <p className="text-zinc-500 font-medium uppercase tracking-widest text-sm text-center">How to split?</p>
            
            <div className="space-y-3">
              {[
                { id: "EQUAL", label: "Equally", desc: "Split the cost evenly among everyone." },
                { id: "EXACT", label: "Exact Amounts", desc: "Specify exactly who owes what." },
                { id: "PERCENTAGE", label: "Percentages", desc: "Split by percentage." }
              ].map((type) => (
                <div 
                  key={type.id}
                  onClick={() => {
                    setSplitType(type.id as any);
                    setSelectedTemplateId(""); // Deselect template if manual selected
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    splitType === type.id && !selectedTemplateId
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-bold text-sm ${splitType === type.id && !selectedTemplateId ? 'text-green-500' : 'text-zinc-100'}`}>
                        {type.label}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{type.desc}</p>
                    </div>
                    {splitType === type.id && !selectedTemplateId && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>

            {/* V2 Split Templates Section */}
            {templates.length > 0 && (
              <div className="pt-2">
                <p className="text-zinc-500 font-bold uppercase tracking-wider text-[11px] mb-3">Saved Split Templates</p>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setSplitType("PERCENTAGE");
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedTemplateId === template.id
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-bold text-sm ${selectedTemplateId === template.id ? 'text-green-500' : 'text-zinc-100'}`}>
                            {template.name}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Saved percentage ratio for rent splitting.
                          </p>
                        </div>
                        {selectedTemplateId === template.id && <Check className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* MVP Note for custom math */}
            {splitType !== "EQUAL" && !selectedTemplateId && (
              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-900 text-xs text-zinc-500 text-center">
                Custom exact or manual splits default to Equal Splits in this V2 MVP. Select a Saved Template above to apply complex percentages.
              </div>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full h-14 bg-green-500 text-zinc-950 hover:bg-green-400 text-lg font-bold rounded-2xl mt-6 shrink-0"
          >
            {loading ? "Adding..." : "Add Expense"} <Check className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
