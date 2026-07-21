"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { adminTextareaClass } from "@/components/admin/FormField";
import { useAdmin } from "@/components/admin/AdminContext";
import { saveOrderNotes } from "../actions";

export function OrderNotes({
  orderId,
  initialNotes,
}: {
  orderId: string;
  initialNotes: string | null;
}) {
  const { canWrite } = useAdmin();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const res = await saveOrderNotes(orderId, notes);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Notes saved");
    });
  };

  if (!canWrite) {
    return (
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {notes || "No notes."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Internal notes about this order…"
        className={adminTextareaClass}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={save}
          disabled={pending}
          className="rounded-full px-4"
        >
          {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save notes
        </Button>
      </div>
    </div>
  );
}
