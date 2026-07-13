"use client";

import Link from "next/link";
import { ArrowRight, Wallet, Sparkles, Receipt, RefreshCw, Zap, ShieldCheck, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-zinc-50 relative overflow-hidden flex flex-col">
      {/* Glow filters */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[30%] -left-20 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <nav className="h-16 px-6 border-b border-zinc-900 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-widest text-white uppercase">FairShare</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/login" 
            className="text-xs font-black bg-white text-[#121212] hover:bg-zinc-200 px-4 py-2 rounded-full transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Content Section */}
      <div className="flex-1 flex flex-col px-6 pt-12 pb-16 max-w-md mx-auto w-full text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-[9px] font-black text-green-400 uppercase tracking-widest mx-auto mb-6">
          <Sparkles className="h-3 w-3" /> Split bills, not friendships
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white mb-4 leading-tight">
          The Smartest Bill Splitter for Squads.
        </h1>
        
        <p className="text-xs text-zinc-400 leading-relaxed mb-8 max-w-xs mx-auto">
          Scan receipts with AI, automate monthly rent templates, and settle group expenses natively via simulated Razorpay.
        </p>

        <div className="flex flex-col gap-3 mb-14">
          <Link 
            href="/login" 
            className="h-13 bg-white text-[#121212] hover:bg-zinc-200 text-sm font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)]"
          >
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/login?callbackUrl=/dashboard" 
            className="h-13 bg-transparent hover:bg-white/5 border border-zinc-800 text-zinc-300 text-sm font-bold rounded-full flex items-center justify-center transition-all"
          >
            Sign In with Email
          </Link>
        </div>

        {/* High-Fidelity Device Mockup Preview */}
        <div className="relative rounded-[32px] overflow-hidden border border-zinc-800/80 bg-[#1c1c1e] p-2.5 shadow-2xl shadow-black/50 mb-16">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-20 flex items-center justify-center">
            {/* Dynamic camera notch */}
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 mr-2" />
            <div className="h-1 w-6 rounded-full bg-zinc-900" />
          </div>
          <div className="rounded-[22px] overflow-hidden border border-zinc-900 bg-[#121212]">
            <img 
              src="/images/dashboard.png" 
              alt="FairShare Dashboard Preview" 
              className="w-full h-auto object-cover select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-6 text-left mb-16">
          <h2 className="text-lg font-black text-white tracking-tight text-center mb-2">Squad Features</h2>
          
          <div className="bg-[#1c1c1e] border border-zinc-850 p-5 rounded-2xl flex gap-4">
            <div className="h-9 w-9 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Receipt className="h-4.5 w-4.5 text-green-400" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">OCR Receipt Scanning</h3>
              <p className="text-[10px] text-zinc-450 leading-relaxed">
                Scan grocery store slips instantly. Our OCR parses items and splits them dynamically among roommates.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] border border-zinc-850 p-5 rounded-2xl flex gap-4">
            <div className="h-9 w-9 bg-[#0584eb]/10 border border-[#0584eb]/20 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="h-4.5 w-4.5 text-[#0584eb]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">Optimized Debt Paths</h3>
              <p className="text-[10px] text-zinc-450 leading-relaxed">
                Greedy cash minimization reduces group transactions, simplifying roommate settle-ups into single payments.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] border border-zinc-850 p-5 rounded-2xl flex gap-4">
            <div className="h-9 w-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
              <RefreshCw className="h-4.5 w-4.5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">Lazy Rent Templates</h3>
              <p className="text-[10px] text-zinc-450 leading-relaxed">
                Rent, WiFi, and utility bills post automatically on the 1st of the month via database cron checks.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Model Section */}
        <div className="space-y-6 text-left mb-8">
          <h2 className="text-lg font-black text-white tracking-tight text-center mb-2">Pricing Plans</h2>
          
          {/* Trial / Free Tier */}
          <div className="bg-[#1c1c1e] border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Free Trial</h3>
                <p className="text-[10px] text-zinc-550 mt-0.5">Explore the features</p>
              </div>
              <span className="text-base font-black text-white">$0.00</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> Limited to 1 roommate (creator profile)
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> Expense logs and recurring templates
              </div>
            </div>
          </div>

          {/* Basic Tier */}
          <div className="bg-[#1c1c1e] border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0584eb]/10 border-b border-l border-[#0584eb]/20 px-3 py-1 text-[8px] font-extrabold text-[#0584eb] rounded-bl-xl uppercase tracking-widest">
              30 Days Free
            </div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Basic Plan</h3>
                <p className="text-[10px] text-zinc-550 mt-0.5">Best for couples / duos</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-white">$2.50</span>
                <span className="text-[10px] text-zinc-550 block">/ roommate / mo</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> Up to 2 roommates limit
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> Minimized debt settlement paths
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> 1-Month trial period included
              </div>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="bg-[#1c1c1e] border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500/10 border-b border-l border-green-500/20 px-3 py-1 text-[8px] font-extrabold text-green-500 rounded-bl-xl uppercase tracking-widest">
              30 Days Free
            </div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Pro Plan</h3>
                <p className="text-[10px] text-zinc-550 mt-0.5">Unlimited squads</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-white">$4.00</span>
                <span className="text-[10px] text-zinc-550 block">/ roommate / mo</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> 3+ or unlimited roommate spaces
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> Audit trail history logs and soft-deletes
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> Razorpay subscription checkout
              </div>
            </div>
          </div>
        </div>

        {/* Secure Checkout Trust Badge */}
        <p className="text-[9px] text-zinc-550 text-center flex items-center justify-center gap-1.5 mt-8">
          <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Cancel subscription anytime. Powered by Razorpay secure checkout.
        </p>
      </div>
    </div>
  );
}
