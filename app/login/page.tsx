"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, Wallet } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-[#121212] text-zinc-50 relative overflow-hidden px-6 pb-12 pt-8">
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="h-9 w-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-extrabold tracking-widest text-white uppercase">FairShare</span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Onboarding Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Let's Get Started!
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Split bills, track room expenses, and settle debts with roommates with confidence.
          </p>
        </div>

        {/* Social Authentication Providers */}
        <div className="space-y-2.5 mb-6">
          <Button 
            type="button"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-12 bg-transparent border-zinc-800 text-zinc-200 hover:bg-white/5 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02c.92-2.77 3.51-4.54 6.72-4.54z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.89c2.28-2.1 3.56-5.19 3.56-8.69z"/>
              <path fill="#FBBC05" d="M5.28 10.58c-.24-.72-.37-1.48-.37-2.28s.13-1.56.37-2.28L1.39 3.02C.5 4.8.01 6.82.01 8.9c0 2.08.49 4.1 1.38 5.88l3.89-3.2z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.89-2.97c-1.09.73-2.48 1.16-4.07 1.16-3.21 0-5.8-1.77-6.72-4.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z"/>
            </svg>
            Continue With Google
          </Button>

          <Button 
            type="button"
            variant="outline"
            onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
            className="w-full h-12 bg-transparent border-zinc-800 text-zinc-200 hover:bg-white/5 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue With Facebook
          </Button>

          <Button 
            type="button"
            variant="outline"
            onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
            className="w-full h-12 bg-transparent border-zinc-800 text-zinc-200 hover:bg-white/5 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.23-.58 2.95-1.39z"/>
            </svg>
            Continue With Apple ID
          </Button>
        </div>

        {/* Separator */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-900"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Or Sign In With Email</span>
          <div className="flex-grow border-t border-zinc-900"></div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {isSignUp && (
            <div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required={isSignUp}
                className="h-13 bg-[#1c1c1e] border-zinc-850 text-sm rounded-full focus-visible:ring-white/10 text-center"
              />
            </div>
          )}
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="h-13 bg-[#1c1c1e] border-zinc-850 text-sm rounded-full focus-visible:ring-white/10 text-center"
            />
          </div>
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="h-13 bg-[#1c1c1e] border-zinc-850 text-sm rounded-full focus-visible:ring-white/10 text-center"
            />
          </div>

          <Button 
            type="submit"
            disabled={loading || (!email || !password || (isSignUp && !name))}
            className="w-full h-13 bg-white text-[#121212] hover:bg-zinc-200 text-sm font-black rounded-full mt-4 flex items-center justify-center cursor-pointer transition-all active:scale-98"
          >
            {loading ? "Verifying..." : (isSignUp ? "Create Account" : "Sign In")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-zinc-450 hover:text-zinc-200 transition-colors font-semibold"
          >
            {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
