import { useState, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import type { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2, Crop as CropIcon } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
  aspectRatio = 1,
  circularCrop = false,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: aspectRatio >= 1 ? 90 : 80,
    height: aspectRatio >= 1 ? 90 / aspectRatio : 80,
    x: aspectRatio >= 1 ? 5 : 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Calculate initial crop based on aspect ratio
    let cropWidth: number;
    let cropHeight: number;
    
    if (aspectRatio >= 1) {
      // Wide format (banner): use most of the width
      cropWidth = width * 0.9;
      cropHeight = cropWidth / aspectRatio;
      
      // If crop height exceeds image height, adjust
      if (cropHeight > height * 0.9) {
        cropHeight = height * 0.9;
        cropWidth = cropHeight * aspectRatio;
      }
    } else {
      // Portrait or square: use the smaller dimension
      const cropSize = Math.min(width, height) * 0.8;
      cropWidth = cropSize;
      cropHeight = cropSize / aspectRatio;
    }
    
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;

    setCrop({
      unit: "px",
      width: cropWidth,
      height: cropHeight,
      x,
      y,
    });
  }, [aspectRatio]);

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            resolve(blob);
          },
          "image/png",
          1
        );
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedBlob);
      onOpenChange(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-2 border-[var(--neon-cyan)]/30 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text-cyber uppercase tracking-wider flex items-center gap-2">
            <CropIcon className="w-6 h-6 text-[var(--neon-cyan)]" />
            Crop Image
          </DialogTitle>
          <DialogDescription className="uppercase tracking-wide">
            Adjust the crop area and click save
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center min-h-[400px] max-h-[600px] overflow-auto bg-black/20 rounded border border-[var(--neon-cyan)]/20 p-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            circularCrop={circularCrop}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full h-auto"
              style={{ maxHeight: "550px" }}
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="glass-card border border-[var(--neon-purple)]/30 text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
            className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 hover:neon-glow-cyan font-bold uppercase tracking-wider"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Save Cropped Image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
