"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Paperclip, Receipt, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createExpenseAction, getSplitTemplatesAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    } else if (val === ".") {
      // ignore decimal since amountString represents cents natively
      return;
    } else {
      setAmountString(prev => (prev === "0" ? val : prev + val));
    }
  };

  const amountCents = parseInt(amountString, 10);
  const formattedAmount = (amountCents / 100).toFixed(2);

  // Attach a mock receipt image
  const handleAttachMockReceipt = () => {
    const mockReceipt = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop";
    setReceiptUrl(mockReceipt);
    toast.success("Mock receipt attached!");
  };

  // Simulate OCR Scanning - Mock 2
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
    <div className="flex flex-col h-screen bg-[#0c0e0e] text-zinc-50 relative overflow-hidden select-none">
      {/* Header - Mock 2 */}
      <div className="flex items-center justify-between p-6 bg-[#0c0e0e] z-40 shrink-0">
        <button 
          onClick={() => {
            if (step > 1) setStep((s) => (s - 1) as any);
            else router.push("/dashboard");
          }} 
          className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider cursor-pointer"
        >
          close
        </button>
        <span className="font-extrabold text-white text-base tracking-wide">
          {step === 1 ? "Add Expense" : `Step ${step} of 3`}
        </span>
        <Avatar className="h-8 w-8 border border-[#82d0ad]/20">
          <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
            U
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Screen 1: Amount entry - Mock 2 */}
      {step === 1 && (
        <div className="flex flex-col flex-1 pb-safe px-6 justify-between">
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              ENTER AMOUNT
            </p>
            <div className="flex items-baseline justify-center text-[#82d0ad] relative">
              <span className="text-3xl font-black mr-1.5 select-none">$</span>
              <span className="text-6.5xl font-black tracking-tight leading-none">
                {formattedAmount}
              </span>
            </div>

            {/* Scan receipt button - Mock 2 */}
            <button
              type="button"
              onClick={handleOCRScan}
              disabled={scanning}
              className="px-6 py-3 bg-[#1e2021] border border-zinc-900 hover:bg-zinc-850 hover:border-zinc-800 text-zinc-300 rounded-xl flex items-center justify-center gap-2 mb-4 active:scale-95 transition-all text-xs font-extrabold cursor-pointer disabled:opacity-50"
            >
              <Receipt className="h-4.5 w-4.5 text-[#82d0ad]" />
              <span className="text-[#82d0ad] tracking-wide">
                {scanning ? "Parsing receipt text..." : "Scan Receipt with OCR"}
              </span>
            </button>
          </div>
          
          <div className="pb-8 space-y-6">
            {/* 3x4 numeric keypad - Mock 2 */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-8 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadClick(num.toString())}
                  className="h-14 hover:bg-zinc-900/40 text-2xl font-extrabold text-zinc-100 transition-colors active:scale-90 flex items-center justify-center rounded-full cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadClick(".")}
                className="h-14 text-2xl font-extrabold text-zinc-400 flex items-center justify-center active:scale-90 rounded-full cursor-pointer"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleKeypadClick("0")}
                className="h-14 hover:bg-zinc-900/40 text-2xl font-extrabold text-zinc-100 transition-colors active:scale-90 flex items-center justify-center rounded-full cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadClick("BACKSPACE")}
                className="h-14 text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-center active:scale-90 rounded-full cursor-pointer"
              >
                backspace
              </button>
            </div>
            
            <Button 
              onClick={() => setStep(2)} 
              disabled={amountCents === 0}
              className="w-full h-13 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] text-sm font-black rounded-xl cursor-pointer active:scale-98"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Screen 2: Description & Receipt Attachment */}
      {step === 2 && (
        <div className="flex flex-col flex-1 px-6 pb-8 justify-between text-left">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto space-y-8">
            <div className="text-center w-full">
              <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">WHAT IS THIS FOR?</p>
              <Input
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Internet Bill"
                className="h-14 bg-[#1e2021] border-zinc-900 text-lg text-center placeholder:text-zinc-700 font-bold rounded-xl focus-visible:ring-zinc-800"
              />
            </div>

            {/* V2 Attachment */}
            <div className="w-full">
              <button 
                type="button"
                onClick={handleAttachMockReceipt}
                className={`w-full p-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  receiptUrl 
                    ? 'border-[#82d0ad]/50 bg-[#82d0ad]/5 text-[#82d0ad]' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <Paperclip className="h-4 w-4" />
                {receiptUrl ? "Receipt Attached" : "Attach Mock Receipt"}
              </button>
              
              {receiptUrl && (
                <p className="text-center text-[9px] text-zinc-500 mt-2 truncate max-w-xs mx-auto">
                  Receipt preview loaded successfully.
                </p>
              )}
            </div>

            {/* V2 Recurring check */}
            <div className="flex items-center gap-3 bg-[#181a1b] p-4.5 rounded-xl border border-zinc-900 w-full">
              <input 
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-800 bg-zinc-900 text-[#82d0ad] focus:ring-[#82d0ad]/20"
              />
              <label htmlFor="isRecurring" className="text-xs font-bold text-zinc-300 cursor-pointer">
                Repeat this expense monthly (Rent/Internet)
              </label>
            </div>
          </div>

          <Button 
            onClick={() => setStep(3)} 
            disabled={description.trim() === ""}
            className="w-full h-13 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] text-sm font-black rounded-xl mt-auto cursor-pointer active:scale-98"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Screen 3: Split Logic & Templates */}
      {step === 3 && (
        <div className="flex flex-col flex-1 px-6 pb-8 overflow-y-auto text-left justify-between">
          <div className="flex-1 mt-6 space-y-6">
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] text-center">HOW TO SPLIT?</p>
            
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
                      ? 'border-[#82d0ad] bg-[#82d0ad]/5' 
                      : 'border-zinc-900 bg-[#181a1b] hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-bold text-sm ${splitType === type.id && !selectedTemplateId ? 'text-[#82d0ad]' : 'text-zinc-100'}`}>
                        {type.label}
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{type.desc}</p>
                    </div>
                    {splitType === type.id && !selectedTemplateId && <Check className="h-4 w-4 text-[#82d0ad]" />}
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
                          ? 'border-[#82d0ad] bg-[#82d0ad]/5' 
                          : 'border-zinc-900 bg-[#181a1b] hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-bold text-sm ${selectedTemplateId === template.id ? 'text-[#82d0ad]' : 'text-zinc-100'}`}>
                            {template.name}
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Saved percentage ratio for rent splitting.
                          </p>
                        </div>
                        {selectedTemplateId === template.id && <Check className="h-4 w-4 text-[#82d0ad]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* MVP Note for custom math */}
            {splitType !== "EQUAL" && !selectedTemplateId && (
              <div className="p-3 bg-[#181a1b] rounded-xl border border-zinc-900 text-[10px] text-zinc-500 text-center">
                Custom exact or manual splits default to Equal Splits in this MVP. Select a Saved Template above to apply complex percentages.
              </div>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full h-13 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] text-sm font-black rounded-xl mt-6 shrink-0 cursor-pointer active:scale-98"
          >
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      )}
    </div>
  );
}
