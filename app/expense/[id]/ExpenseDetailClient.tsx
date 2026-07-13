"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Edit2, MessageSquare, Clock, Paperclip, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createCommentAction, updateExpenseAction, softDeleteExpenseAction } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(cents) / 100);
};

export default function ExpenseDetailClient({ expense, currentUserId, users }: { expense: any; currentUserId: string; users: any[] }) {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editDescription, setEditDescription] = useState(expense.description);
  const [editAmountStr, setEditAmountStr] = useState((expense.totalAmount / 100).toFixed(2));
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      await createCommentAction(expense.id, currentUserId, commentText);
      setCommentText("");
      toast.success("Comment added!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editDescription.trim() || !editAmountStr || editLoading) return;

    setEditLoading(true);
    const amountCents = Math.round(parseFloat(editAmountStr) * 100);

    try {
      await updateExpenseAction({
        id: expense.id,
        editorId: currentUserId,
        description: editDescription,
        totalAmount: amountCents,
      });
      toast.success("Expense updated!");
      setEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to edit expense");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteLoading) return;

    setDeleteLoading(true);
    try {
      await softDeleteExpenseAction(expense.id);
      toast.success("Expense deleted");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete expense");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 relative pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-900">
        <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer">
          <ArrowLeft className="h-6 w-6 text-zinc-400" />
        </button>
        <span className="font-bold text-zinc-100 tracking-wider">Expense Details</span>
        <div className="flex gap-2">
          {/* Edit Modal Button */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger className="p-2 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer outline-none">
              <Edit2 className="h-5 w-5 text-zinc-400" />
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Description</label>
                  <Input 
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="bg-zinc-950 border-zinc-850 focus-visible:ring-green-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Amount ($)</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editAmountStr}
                    onChange={e => setEditAmountStr(e.target.value)}
                    className="bg-zinc-950 border-zinc-850 focus-visible:ring-green-500/50"
                  />
                </div>
                <Button 
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="w-full h-12 bg-green-500 text-zinc-950 hover:bg-green-400 font-bold"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Modal Button */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger className="p-2 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer outline-none">
              <Trash2 className="h-5 w-5 text-red-500" />
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl">
              <DialogHeader className="items-center text-center">
                <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 text-center">
                <p className="text-sm text-zinc-400">
                  This will soft-delete the expense. It will no longer calculate into roommate balances.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => setDeleteOpen(false)}
                    className="flex-1 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500 hover:bg-red-650 text-white font-bold"
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Info */}
      <div className="p-6 text-center bg-zinc-900/20 border-b border-zinc-900">
        <h1 className="text-4xl font-black tracking-tight text-zinc-100 mb-1">
          {formatCurrency(expense.totalAmount)}
        </h1>
        <p className="text-xl font-bold text-zinc-300">{expense.description}</p>
        <p className="text-xs text-zinc-500 mt-2 font-medium">
          Paid by <span className="text-zinc-300 font-bold">{expense.creator.name}</span> on {new Date(expense.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Splits */}
      <div className="p-6 border-b border-zinc-900">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">How it's split</h3>
        <div className="space-y-3">
          {expense.participants.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900">
              <span className="font-semibold text-zinc-200">{p.user.name}</span>
              <div className="text-right">
                <p className="text-sm text-zinc-400">Owed: {formatCurrency(p.amountOwed)}</p>
                <p className="text-[10px] text-zinc-500">Paid: {formatCurrency(p.amountPaid)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Image Rendering */}
      {expense.receiptUrl && (
        <div className="p-6 border-b border-zinc-900">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Paperclip className="h-4 w-4" /> Attached Receipt
          </h3>
          <div className="mt-2 relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
            {/* Display receipt as embedded image */}
            <img 
              src={expense.receiptUrl} 
              alt="Receipt" 
              className="w-full max-h-[300px] object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      )}

      {/* Comments / Mini-Thread */}
      <div className="p-6 border-b border-zinc-900">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" /> Comments
        </h3>
        
        <div className="space-y-4 mb-6">
          {expense.comments.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-2">No comments yet. Start a discussion!</p>
          ) : (
            expense.comments.map((c: any) => (
              <div key={c.id} className={`flex gap-3 max-w-[85%] ${c.userId === currentUserId ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`p-3.5 rounded-2xl text-sm ${
                  c.userId === currentUserId 
                    ? 'bg-green-500 text-zinc-950 rounded-tr-none font-medium' 
                    : 'bg-zinc-900 border border-zinc-850 rounded-tl-none'
                }`}>
                  <p className={`text-[10px] font-bold mb-1 ${
                    c.userId === currentUserId ? 'text-green-950/70' : 'text-zinc-550'
                  }`}>{c.user.name}</p>
                  <p className="leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2">
          <Input 
            placeholder="Type your dispute or message..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="flex-1 bg-zinc-900/50 border-zinc-850 focus-visible:ring-green-500/50 rounded-xl"
          />
          <Button 
            type="submit" 
            disabled={commentLoading || !commentText.trim()}
            className="bg-green-500 hover:bg-green-400 text-zinc-950 font-bold px-4 rounded-xl cursor-pointer"
          >
            Send
          </Button>
        </form>
      </div>

      {/* Audit Trail / Edit History */}
      <div className="p-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> Edit History (Audit Trail)
        </h3>
        
        {expense.editHistories.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No edits recorded for this expense.</p>
        ) : (
          <div className="relative border-l-2 border-zinc-850 ml-2 pl-4 space-y-5">
            {expense.editHistories.map((h: any) => (
              <div key={h.id} className="relative text-xs">
                {/* Timeline dot */}
                <div className="absolute h-3.5 w-3.5 bg-zinc-800 border-2 border-zinc-950 rounded-full -left-[23px] top-0.5" />
                <p className="font-semibold text-zinc-300">Edited by {h.editor.name}</p>
                <p className="text-zinc-500 text-[10px]">{new Date(h.createdAt).toLocaleString()}</p>
                <div className="mt-1.5 bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-900 space-y-0.5 text-zinc-400 text-left">
                  <p>Previous desc: <span className="text-zinc-200">"{h.previousDescription}"</span></p>
                  <p>Previous amount: <span className="text-zinc-200">{formatCurrency(h.previousAmount)}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
