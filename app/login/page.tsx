"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      name: isSignUp ? name : undefined,
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Welcome back to FairShare!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0e0e] text-zinc-50 relative overflow-hidden px-6 pb-8 pt-10 justify-between">
      {/* Brand Logo - Mock 4 */}
      <div className="text-center pt-4">
        <span className="text-xl font-black tracking-[0.25em] text-[#82d0ad] uppercase">
          FAIRSHARE
        </span>
        <div className="h-0.5 w-10 bg-[#82d0ad] mx-auto mt-1.5 rounded-full" />
      </div>

      <div className="max-w-sm mx-auto w-full bg-[#181a1b] border border-zinc-900 rounded-[24px] p-6.5 my-auto shadow-2xl">
        {/* Onboarding Headline */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-white mb-2">
            Let's Get Started!
          </h1>
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Split bills, track room expenses, and settle debts with roommates with confidence.
          </p>
        </div>

        {/* Social Authentication Providers - Mock 4 */}
        <div className="grid grid-cols-3 gap-3.5 mb-6">
          <button 
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="h-13 bg-[#242627] hover:bg-[#2c2f30] border border-zinc-900 rounded-xl flex items-center justify-center cursor-pointer transition-all"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02c.92-2.77 3.51-4.54 6.72-4.54z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.89c2.28-2.1 3.56-5.19 3.56-8.69z"/>
              <path fill="#FBBC05" d="M5.28 10.58c-.24-.72-.37-1.48-.37-2.28s.13-1.56.37-2.28L1.39 3.02C.5 4.8.01 6.82.01 8.9c0 2.08.49 4.1 1.38 5.88l3.89-3.2z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.89-2.97c-1.09.73-2.48 1.16-4.07 1.16-3.21 0-5.8-1.77-6.72-4.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z"/>
            </svg>
          </button>

          <button 
            type="button"
            onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
            className="h-13 bg-[#242627] hover:bg-[#2c2f30] border border-zinc-900 rounded-xl flex items-center justify-center cursor-pointer transition-all"
          >
            <svg className="h-4.5 w-4.5 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>

          <button 
            type="button"
            onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
            className="h-13 bg-[#242627] hover:bg-[#2c2f30] border border-zinc-900 rounded-xl flex items-center justify-center cursor-pointer transition-all"
          >
            <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.23-.58 2.95-1.39z"/>
            </svg>
          </button>
        </div>

        {/* Separator - Mock 4 */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-900"></div>
          <span className="flex-shrink mx-3.5 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">OR EMAIL</span>
          <div className="flex-grow border-t border-zinc-900"></div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Name</label>
              <div className="relative flex items-center">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required={isSignUp}
                  className="h-13 bg-[#1e2021] border-zinc-900 rounded-xl focus-visible:ring-zinc-700 text-sm pl-11"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4.5 w-4.5 text-zinc-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="h-13 bg-[#1e2021] border-zinc-900 rounded-xl focus-visible:ring-zinc-700 text-sm pl-11"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Password</label>
              <button 
                type="button" 
                onClick={() => toast.info("Password recovery is disabled for MVP.")}
                className="text-[10px] font-bold text-[#82d0ad] hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-4.5 w-4.5 text-zinc-500" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-13 bg-[#1e2021] border-zinc-900 rounded-xl focus-visible:ring-zinc-700 text-sm pl-11"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || (!email || !password || (isSignUp && !name))}
            className="w-full h-13 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] text-sm font-bold rounded-xl mt-6 cursor-pointer flex items-center justify-center transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? "Verifying..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-bold"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up for free"}
          </button>
        </div>
      </div>

      {/* Footer Legal - Mock 4 */}
      <div className="text-center text-[8px] font-bold tracking-[0.18em] text-zinc-600 max-w-xs mx-auto leading-relaxed pt-4">
        © 2024 FAIRSHARE INC. SECURE PAYMENTS POWERED BY EMERALD.
      </div>
    </div>
  );
}
