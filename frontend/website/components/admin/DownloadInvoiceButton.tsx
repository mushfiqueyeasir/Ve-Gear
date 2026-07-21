"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadOrderInvoice, type InvoiceData } from "@/lib/admin/invoicePdf";

export function DownloadInvoiceButton({ invoice }: { invoice: InvoiceData }) {
  const [pending, setPending] = useState(false);

  const onDownload = async () => {
    setPending(true);
    try {
      await downloadOrderInvoice(invoice);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Could not generate invoice PDF.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onDownload}
      disabled={pending}
      className="min-h-11 rounded-full px-5"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Download invoice
    </Button>
  );
}
