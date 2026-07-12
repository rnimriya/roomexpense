"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

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
      toast.success("Welcome to FairShare!");
      router.push("/dashboard");
      router.refresh(); // Important to refresh server components
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 relative overflow-hidden px-6">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-zinc-100 mb-2">
            FairShare
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide">
            {isSignUp ? "Create an account to start splitting." : "Sign in to your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice"
                required={isSignUp}
                className="h-14 bg-zinc-900/50 border-zinc-800 text-lg rounded-xl focus-visible:ring-green-500/50"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@example.com"
              required
              className="h-14 bg-zinc-900/50 border-zinc-800 text-lg rounded-xl focus-visible:ring-green-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-14 bg-zinc-900/50 border-zinc-800 text-lg rounded-xl focus-visible:ring-green-500/50"
            />
          </div>

          <Button 
            type="submit"
            disabled={loading || (!email || !password || (isSignUp && !name))}
            className="w-full h-14 bg-green-500 text-zinc-950 hover:bg-green-400 text-lg font-bold rounded-xl mt-6"
          >
            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Log In")} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium"
          >
            {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
