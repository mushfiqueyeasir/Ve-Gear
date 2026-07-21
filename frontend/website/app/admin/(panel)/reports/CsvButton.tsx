"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CsvButton({
  label,
  filename,
  action,
}: {
  label: string;
  filename: string;
  action: () => Promise<{ csv?: string; error?: string }>;
}) {
  const [pending, startTransition] = useTransition();

  const download = () => {
    startTransition(async () => {
      const res = await action();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (!res.csv) {
        toast.error("Nothing to export.");
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    });
  };

  return (
    <Button
      variant="outline"
      onClick={download}
      disabled={pending}
      className="rounded-full"
    >
      {pending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Download className="mr-2 size-4" />
      )}
      {label}
    </Button>
  );
}
