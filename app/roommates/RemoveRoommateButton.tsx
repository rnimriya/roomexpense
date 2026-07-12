"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeRoommateAction } from "@/app/actions";
import { useRouter } from "next/navigation";

export function RemoveRoommateButton({ apartmentId, userId, name }: { apartmentId: string; userId: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await removeRoommateAction(apartmentId, userId);
      toast.success(`${name} has been removed.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove roommate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
      title={`Remove ${name}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
