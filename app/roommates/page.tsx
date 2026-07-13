import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoommatesClient } from "./RoommatesClient";

export default async function RoommatesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const currentUserId = (session.user as any).id;

  // Load current apartment (assume 'a1' for V2 MVP)
  const apartment = await prisma.apartment.findUnique({
    where: { id: "a1" },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!apartment) {
    redirect("/dashboard");
  }

  // Map to serializable props
  const serializedApartment = {
    id: apartment.id,
    name: apartment.name,
    plan: apartment.plan,
    inviteLinkToken: apartment.inviteLinkToken,
  };

  const serializedMembers = apartment.members.map((m) => ({
    userId: m.userId,
    apartmentId: m.apartmentId,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    },
  }));

  return (
    <RoommatesClient 
      apartment={serializedApartment} 
      members={serializedMembers} 
      currentUserId={currentUserId} 
    />
  );
}
