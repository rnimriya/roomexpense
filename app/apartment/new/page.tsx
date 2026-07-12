import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateApartmentForm } from "./CreateApartmentForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewApartmentPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const creatorId = (session.user as any).id;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 px-6 pb-8 justify-center relative">
      <div className="absolute top-6 left-6">
        <Link href="/roommates" className="p-2 rounded-full hover:bg-zinc-900 transition-colors block">
          <ArrowLeft className="h-6 w-6 text-zinc-400" />
        </Link>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-zinc-100 mb-2">Create Apartment</h1>
        <p className="text-sm text-zinc-550 font-medium max-w-xs mx-auto">
          Start a new household group. You will get a shareable invite link immediately.
        </p>
      </div>

      <CreateApartmentForm creatorId={creatorId} />
    </div>
  );
}
