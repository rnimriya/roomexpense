import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default async function HelpSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const faqs = [
    {
      q: "How do Equal Splits work?",
      a: "Equal splits take the total cost of the expense and divide it evenly among all members in the apartment. For example, a $60 grocery bill with 3 roommates creates a $20 share for each."
    },
    {
      q: "What is Stripe Connect integration?",
      a: "Stripe Connect lets you natively pay back roommates with your credit or debit card directly in the app. Funds are transferred securely and update the balance immediately."
    },
    {
      q: "What is a Phantom Roommate?",
      a: "A phantom profile allows you to track splits for a roommate who hasn't registered an account yet. Once they register using their email, their profile will link and sync automatically."
    },
    {
      q: "What are the subscription tiers?",
      a: "RoomiePay offers 3 tiers: Free (1 roommate), Basic ($5/mo for up to 2 roommates), and Pro ($12/mo for unlimited roommates). Trials are free for 30 days."
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 flex items-center gap-4 border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <span className="font-extrabold text-white text-base tracking-wide text-left">Help & Support</span>
      </div>

      <div className="px-6 py-6 space-y-6 text-left">
        <div className="space-y-4">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
            frequently asked questions
          </p>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-5 space-y-2">
                <h4 className="font-extrabold text-zinc-150 text-xs flex items-start gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-[#82d0ad] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-[10px] text-zinc-450 leading-relaxed pl-6.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
