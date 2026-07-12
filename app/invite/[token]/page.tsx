import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { joinApartmentWithTokenAction } from "@/app/actions";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const session = await getServerSession(authOptions);
  const { token } = await params;

  if (!session || !session.user) {
    // If not logged in, redirect to login page and remember to return to this invite page afterward
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  const userId = (session.user as any).id;

  try {
    await joinApartmentWithTokenAction(token, userId);
  } catch (err: any) {
    console.error("Failed to join apartment via invite link:", err);
    if (err.message && err.message.includes("PAYWALL_TRIGGERED")) {
      redirect("/dashboard?error=PAYWALL_TRIGGERED");
    }
  }

  redirect("/dashboard");
}
