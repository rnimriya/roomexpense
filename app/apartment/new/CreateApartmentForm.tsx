"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createApartmentAction } from "@/app/actions";

export function CreateApartmentForm({ creatorId }: { creatorId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      await createApartmentAction(name, creatorId);
      toast.success("Apartment created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create apartment");
      if (err.message && err.message.includes("database may have been reset")) {
        setTimeout(() => {
          import("next-auth/react").then(({ signOut }) => {
            signOut({ callbackUrl: "/login" });
          });
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2 text-center">Apartment Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Baker Street Apt 2B"
          required
          className="h-14 bg-zinc-900/50 border-zinc-850 text-lg rounded-xl focus-visible:ring-green-500/50 text-center"
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full h-14 bg-green-500 text-zinc-950 hover:bg-green-400 text-lg font-bold rounded-xl mt-4 active:scale-95 transition-transform"
      >
        {loading ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
