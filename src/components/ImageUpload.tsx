import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Image as ImageIcon, Scissors } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ImageWithDescription, migrateImages } from '@/types/image';
import { ImageCropModal } from './ImageCropModal';
import { SortableImageCard } from './SortableImageCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface ImageUploadProps {
  images: ImageWithDescription[];
  onImagesChange: (images: ImageWithDescription[]) => void;
  maxImages?: number;
  onImageReplaced?: (oldUrl: string, newUrl: string, index: number) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  onImageReplaced,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadImage = async (file: File) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um Bilder hochzuladen.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('expose-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('expose-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileSelect = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast({
        title: "Zu viele Bilder",
        description: `Sie können maximal ${maxImages} Bilder hochladen.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages: ImageWithDescription[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ungültiger Dateityp",
          description: `${file.name} ist kein gültiges Bildformat.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: `${file.name} ist größer als 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        newImages.push({ url: imageUrl, description: '' });
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
      toast({
        title: "Upload erfolgreich",
        description: `${newImages.length} Bild${newImages.length !== 1 ? 'er' : ''} hochgeladen.`,
      });
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    if (!imageToRemove) return;

    try {
      // Extract file path from URL for deletion
      const urlParts = imageToRemove.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('expose-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
      }

      // Remove from state regardless of storage deletion result
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      toast({
        title: "Bild entfernt",
        description: "Das Bild wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      // Still remove from state even if storage deletion fails
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const updateImageDescription = (index: number, description: string) => {
    const newImages = images.map((img, i) => 
      i === index ? { ...img, description } : img
    );
    onImagesChange(newImages);
  };

  const handleEditImage = (index: number) => {
    setSelectedImageUrl(images[index].url);
    setSelectedImageIndex(index);
    setCropModalOpen(true);
  };

  const handleImageCropped = (newImageUrl: string) => {
    console.log('handleImageCropped called with:', newImageUrl);
    console.log('selectedImageIndex:', selectedImageIndex);
    console.log('current images before update:', images);
    
    if (selectedImageIndex >= 0) {
      const oldUrl = images[selectedImageIndex].url;
      const newImages = images.map((img, i) => 
        i === selectedImageIndex ? { ...img, url: newImageUrl } : img
      );
      console.log('new images after update:', newImages);
      onImagesChange(newImages);
      // Inform parent so it can update hero image if necessary
      onImageReplaced?.(oldUrl, newImageUrl, selectedImageIndex);
    }
    setSelectedImageIndex(-1);
    setSelectedImageUrl('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((_, index) => `image-${index}` === active.id);
      const newIndex = images.findIndex((_, index) => `image-${index}` === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex);
        onImagesChange(newImages);
        
        toast({
          title: "Reihenfolge geändert",
          description: "Die Bildreihenfolge wurde erfolgreich aktualisiert.",
        });
      }
    }
  };
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          <div>
            <p className="text-foreground font-medium mb-2">
              {uploading ? 'Bilder werden hochgeladen...' : 'Bilder hier ablegen oder auswählen'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Unterstützte Formate: JPG, PNG, WEBP (max. 5MB pro Bild)
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= maxImages}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {uploading ? 'Wird hochgeladen...' : 'Dateien auswählen'}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={images.map((_, index) => `image-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <SortableImageCard
                  key={`image-${index}`}
                  id={`image-${index}`}
                  image={image}
                  index={index}
                  onRemove={removeImage}
                  onUpdateDescription={updateImageDescription}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        {images.length} von {maxImages} Bildern hochgeladen
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageUrl={selectedImageUrl}
        onImageCropped={handleImageCropped}
      />
    </div>
  );
};

export default ImageUpload;