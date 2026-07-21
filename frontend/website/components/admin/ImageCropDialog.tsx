"use client";

import {
  useCallback,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  cropToCanvas,
  type Crop,
  type PercentCrop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  /** Omit for freeform crop. Pass a number to lock aspect (e.g. 1 = square). */
  aspect?: number;
  /** PNG keeps logo transparency; JPEG flattens to opaque. */
  outputMimeType?: "image/png" | "image/jpeg";
  onCancel: () => void;
  onComplete: (file: File) => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  aspect,
  outputMimeType = "image/png",
  onCancel,
  onComplete,
}: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);

  const onImageLoad = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      {
        unit: "%",
        width: 80,
        height: 80,
      },
      width,
      height,
    ) as PercentCrop;
    setCrop(initial);
    setCompletedCrop(convertToPixelCrop(initial, width, height));
  }, []);

  const apply = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop?.width || !completedCrop?.height) return;

    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      await cropToCanvas(image, canvas, completedCrop);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
          outputMimeType,
          outputMimeType === "image/jpeg" ? 0.92 : undefined,
        );
      });

      const ext = outputMimeType === "image/png" ? "png" : "jpg";
      const file = new File([blob], `crop-${Date.now()}.${ext}`, {
        type: outputMimeType,
      });
      onComplete(file);
    } catch {
      onCancel();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="max-w-lg gap-0 overflow-hidden border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-lg">Crop image</DialogTitle>
        </DialogHeader>

        <div
          className="image-crop-free max-h-[60vh] overflow-auto p-4"
          style={{
            backgroundColor: "#1a1a1a",
            backgroundImage:
              "linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
          }}
        >
          {imageSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              keepSelection
              ruleOfThirds
              className="max-w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop"
                onLoad={onImageLoad}
                className="max-h-[52vh] max-w-full"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            Drag the corners to resize freely. Move the box to reposition.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={busy}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={apply}
              disabled={
                busy || !completedCrop?.width || !completedCrop?.height
              }
              className="rounded-full"
            >
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              Apply & upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
