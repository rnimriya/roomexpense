"use client";

import Link from "next/link";
import { ArrowRight, Wallet, Sparkles, Receipt, RefreshCw, Zap, ShieldCheck, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-zinc-50 relative overflow-hidden flex flex-col w-full">
      {/* Background glow features */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <nav className="h-20 border-b border-zinc-900 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-50 flex items-center w-full">
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-widest text-white uppercase">FairShare</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/login" 
              className="text-xs font-black bg-white text-[#121212] hover:bg-zinc-200 px-5 py-2.5 rounded-full transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content Section */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 pt-16 md:pt-24 pb-20 relative z-10 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-24">
          
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-black text-green-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Split bills, not friendships
            </div>

            <h1 className="text-4xl md:text-5.5xl font-black tracking-tight text-white leading-tight">
              The Smartest Bill <br className="hidden md:inline" /> Splitter for Squads.
            </h1>
            
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Scan grocery slips with AI receipt parsing, automate monthly utility bills, and settle group expenses natively via simulated Razorpay checkouts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-4 justify-center lg:justify-start">
              <Link 
                href="/login" 
                className="h-13 px-8 bg-white text-[#121212] hover:bg-zinc-200 text-sm font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)] active:scale-98"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/login?callbackUrl=/dashboard" 
                className="h-13 px-8 bg-transparent hover:bg-white/5 border border-zinc-800 text-zinc-300 text-sm font-bold rounded-full flex items-center justify-center transition-all"
              >
                Sign In with Email
              </Link>
            </div>
          </div>

          {/* Right Column: High-Fidelity Mobile Device Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] rounded-[36px] overflow-hidden border border-zinc-800/80 bg-[#1c1c1e] p-3 shadow-2xl shadow-black/60">
              <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 mr-2" />
                <div className="h-1.5 w-6 rounded-full bg-zinc-900" />
              </div>
              <div className="rounded-[24px] overflow-hidden border border-zinc-900 bg-[#121212]">
                <img 
                  src="/images/dashboard.png" 
                  alt="FairShare Dashboard Preview" 
                  className="w-full h-auto object-cover select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Matrix Section */}
        <div className="space-y-12 mb-24 w-full">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Features Built for Roommates</h2>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">Tackle flat expense tracking with fully automated ledgers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1c1c1e] border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between h-56">
              <div className="h-10 w-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                <Receipt className="h-5 w-5 text-green-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">OCR Receipt Scanning</h3>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Upload receipts to scan items and split them automatically among housemates.
                </p>
              </div>
            </div>

            <div className="bg-[#1c1c1e] border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between h-56">
              <div className="h-10 w-10 bg-[#0584eb]/10 border border-[#0584eb]/20 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#0584eb]" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Debt Minimization</h3>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Greedy cash minimization reduces the number of payments down to simple direct checks.
                </p>
              </div>
            </div>

            <div className="bg-[#1c1c1e] border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between h-56">
              <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Recurring Templates</h3>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Automatically post recurring expenses like rent and internet on the 1st of every month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Models Section */}
        <div className="space-y-12 mb-12 w-full">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Flexible SaaS Billing</h2>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">Start with our free trial, then choose the plan that fits your apartment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Free Trial */}
            <div className="bg-[#1c1c1e] border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Free Trial</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5">Explore the app</p>
                  </div>
                  <span className="text-xl font-black text-white">$0.00</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-450">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Limited to 1 user profile
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-455">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Expense tracking ledger
                  </div>
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-bold rounded-xl mt-8 flex items-center justify-center transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="bg-[#1c1c1e] border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#0584eb]/10 border-b border-l border-[#0584eb]/20 px-4 py-1.5 text-[9px] font-black text-[#0584eb] rounded-bl-xl uppercase tracking-widest">
                30 Days Free
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Basic Plan</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5">Perfect for duos</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">$2.50</span>
                    <span className="text-[10px] text-zinc-550 block">/ roommate / mo</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Up to 2 roommates limit
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Minimized debt networks
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> 1-Month free trial setup
                  </div>
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full h-11 bg-[#0584eb] hover:bg-[#2094f0] text-white text-xs font-extrabold rounded-xl mt-8 flex items-center justify-center transition-colors shadow-[0_0_20px_-3px_rgba(5,132,235,0.3)]"
              >
                Try Free for 30 Days
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1c1c1e] border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500/10 border-b border-l border-green-500/20 px-4 py-1.5 text-[9px] font-black text-green-500 rounded-bl-xl uppercase tracking-widest">
                30 Days Free
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Pro Plan</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5">For larger houses</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">$4.00</span>
                    <span className="text-[10px] text-zinc-550 block">/ roommate / mo</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Unlimited roommate limit
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Audit trail edit log histories
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> Razorpay card/UPI autopay
                  </div>
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full h-11 bg-green-500 hover:bg-green-400 text-zinc-955 text-xs font-extrabold rounded-xl mt-8 flex items-center justify-center transition-colors shadow-[0_0_20px_-3px_rgba(34,197,94,0.3)]"
              >
                Try Free for 30 Days
              </Link>
            </div>

          </div>
        </div>

        {/* Secure Trust Badge */}
        <p className="text-[9px] text-zinc-550 text-center flex items-center justify-center gap-1.5 mt-16">
          <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Cancel subscription anytime. Transactions processed securely by Razorpay.
        </p>
      </div>
    </div>
  );
}
