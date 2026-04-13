import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onImageCropped: (newImageUrl: string) => void;
}

const ASPECT_RATIOS = {
  free: { value: undefined, label: "Frei" },
  "16/9": { value: 16 / 9, label: "16:9" },
  "4/3": { value: 4 / 3, label: "4:3" },
  "1/1": { value: 1, label: "1:1" },
  "3/4": { value: 3 / 4, label: "3:4" }
};

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  open,
  onOpenChange,
  imageUrl,
  onImageCropped,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [aspectRatio, setAspectRatio] = useState<string>("free");
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [safeSrc, setSafeSrc] = useState<string>(imageUrl);

  useEffect(() => {
    let toRevoke: string | null = null;
    async function prepare() {
      try {
        if (!imageUrl) return;
        const res = await fetch(imageUrl, { mode: 'cors' });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        toRevoke = url;
        setSafeSrc(url);
        console.log('Crop modal: preloaded image', { imageUrl, blobType: blob.type, size: blob.size });
      } catch (e) {
        console.warn('Crop modal: preload failed, falling back to direct URL', e);
        setSafeSrc(imageUrl);
      }
    }
    if (open) prepare();
    return () => {
      if (toRevoke) URL.revokeObjectURL(toRevoke);
    };
  }, [imageUrl, open]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio && aspectRatio !== "free") {
      const { width, height } = e.currentTarget;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS].value!,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(newCrop);
    }
  }, [aspectRatio]);

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    if (imgRef.current && value !== "free") {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          ASPECT_RATIOS[value as keyof typeof ASPECT_RATIOS].value!,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(newCrop);
    }
  };

  const generateCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const pixelCrop = convertToPixelCrop(
      completedCrop,
      image.naturalWidth,
      image.naturalHeight,
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, [completedCrop]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um Bilder zu bearbeiten.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const croppedBlob = await generateCroppedImage();
      if (!croppedBlob) {
        throw new Error("Fehler beim Erstellen des zugeschnittenen Bildes");
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}_cropped.jpg`;

      // Upload cropped image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('expose-images')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('expose-images')
        .getPublicUrl(uploadData.path);

      // Delete old image if it's in our storage
      if (imageUrl.includes('supabase') && imageUrl.includes('/expose-images/')) {
        try {
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const userId = urlParts[urlParts.length - 2];
          const filePath = `${userId}/${fileName}`;
          
          await supabase.storage
            .from('expose-images')
            .remove([filePath]);
        } catch (error) {
          console.warn('Could not delete old image:', error);
        }
      }

      onImageCropped(urlData.publicUrl);
      onOpenChange(false);
      
      console.log('Image cropping completed. New URL:', urlData.publicUrl);
      
      toast({
        title: "Erfolg",
        description: "Bild wurde erfolgreich zugeschnitten und gespeichert.",
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Zuschneiden des Bildes. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Bild zuschneiden</DialogTitle>
            <DialogDescription>
              Wählen Sie den gewünschten Bildausschnitt und das Seitenverhältnis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Seitenverhältnis</Label>
              <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS].value}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  alt="Crop"
                  src={safeSrc}
                  style={{ maxHeight: '60vh', maxWidth: '100%' }}
                  onLoad={onImageLoad}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              </ReactCrop>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUploading || !completedCrop}
            >
              {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for generating cropped image */}
      <canvas
        ref={previewCanvasRef}
        style={{
          display: 'none',
        }}
      />
    </>
  );
};