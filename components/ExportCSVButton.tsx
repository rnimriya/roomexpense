"use client";

import { Download } from "lucide-react";

export function ExportCSVButton({ activities, users }: { activities: any[]; users: any[] }) {
  const handleExport = () => {
    const headers = ["Type", "Date", "Description", "Creator/Payer", "Amount ($)", "Recipient/Payee"];
    
    const rows = activities.map(act => {
      const dateStr = new Date(act.date).toLocaleDateString();
      if (act.type === "expense") {
        const creator = users.find(u => u.id === act.data.creatorId);
        return [
          "Expense",
          dateStr,
          act.data.description,
          creator?.name || "Unknown",
          (act.data.totalAmount / 100).toFixed(2),
          "Group"
        ];
      } else {
        const payer = users.find(u => u.id === act.data.payerId);
        const payee = users.find(u => u.id === act.data.payeeId);
        return [
          "Payment",
          dateStr,
          "Settle Debt",
          payer?.name || "Unknown",
          (act.data.amount / 100).toFixed(2),
          payee?.name || "Unknown"
        ];
      }
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rentify_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors uppercase tracking-wider bg-zinc-900 border border-zinc-850 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95"
    >
      <Download className="h-3.5 w-3.5" /> Export CSV
    </button>
  );
}
