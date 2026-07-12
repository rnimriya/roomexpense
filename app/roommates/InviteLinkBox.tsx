"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export function InviteLinkBox({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" 
    ? `${window.location.origin}/invite/${token}` 
    : `http://localhost:3000/invite/${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Input
        readOnly
        value={link}
        className="bg-zinc-900 border-zinc-850 text-xs truncate rounded-xl h-11"
      />
      <button 
        onClick={handleCopy}
        className="px-4 bg-zinc-900 border border-zinc-850 rounded-xl hover:bg-zinc-850 flex items-center justify-center transition-colors active:scale-95"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-zinc-400" />}
      </button>
    </div>
  );
}
