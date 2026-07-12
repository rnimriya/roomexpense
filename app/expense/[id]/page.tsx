import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExpenseDetailClient from "./ExpenseDetailClient";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const { id } = await params;
  
  const currentUserId = (session.user as any).id || "u1";

  const expense = await prisma.expense.findUnique({
    where: { 
      id,
      isDeleted: false, // Ensure we don't load deleted ones
    },
    include: {
      creator: true,
      participants: {
        include: {
          user: true,
        },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      editHistories: {
        include: {
          editor: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!expense) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany();

  return (
    <ExpenseDetailClient 
      expense={expense} 
      currentUserId={currentUserId} 
      users={users} 
    />
  );
}
