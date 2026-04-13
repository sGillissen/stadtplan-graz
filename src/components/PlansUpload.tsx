import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface PlanWithDescription {
  url: string;
  description?: string;
  type: 'image';
  filename?: string;
}

interface PlansUploadProps {
  plans: PlanWithDescription[];
  onPlansChange: (plans: PlanWithDescription[]) => void;
  maxPlans?: number;
}

const PlansUpload: React.FC<PlansUploadProps> = ({ 
  plans, 
  onPlansChange, 
  maxPlans = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const uploadPlan = async (file: File) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um Pläne hochzuladen.",
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
    if (plans.length + files.length > maxPlans) {
      toast({
        title: "Zu viele Pläne",
        description: `Sie können maximal ${maxPlans} Pläne hochladen.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newPlans: PlanWithDescription[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type (only images)
      const isImage = file.type.startsWith('image/');
      
      if (!isImage) {
        toast({
          title: "Ungültiger Dateityp",
          description: `${file.name} ist kein gültiges Format. Nur Bilder (JPG, PNG, WEBP) sind erlaubt.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (max 5MB for images)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Datei zu groß",
          description: `${file.name} ist größer als 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      const planUrl = await uploadPlan(file);
      if (planUrl) {
        newPlans.push({ 
          url: planUrl, 
          description: '', 
          type: 'image',
          filename: file.name
        });
      }
    }

    if (newPlans.length > 0) {
      onPlansChange([...plans, ...newPlans]);
      toast({
        title: "Upload erfolgreich",
        description: `${newPlans.length} Plan${newPlans.length !== 1 ? '' : ''} hochgeladen.`,
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

  const removePlan = async (index: number) => {
    const planToRemove = plans[index];
    if (!planToRemove) return;

    try {
      // Extract file path from URL for deletion
      const urlParts = planToRemove.url.split('/');
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
      const newPlans = plans.filter((_, i) => i !== index);
      onPlansChange(newPlans);

      toast({
        title: "Plan entfernt",
        description: "Der Plan wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error removing plan:', error);
      // Still remove from state even if storage deletion fails
      const newPlans = plans.filter((_, i) => i !== index);
      onPlansChange(newPlans);
    }
  };

  const updatePlanDescription = (index: number, description: string) => {
    const newPlans = plans.map((plan, i) => 
      i === index ? { ...plan, description } : plan
    );
    onPlansChange(newPlans);
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
              {uploading ? 'Pläne werden hochgeladen...' : 'Pläne hier ablegen oder auswählen'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Unterstützte Formate: JPG, PNG, WEBP (max. 5MB)
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || plans.length >= maxPlans}
            >
              <FileText className="w-4 h-4 mr-2" />
              {uploading ? 'Wird hochgeladen...' : 'Dateien auswählen'}
            </Button>
          </div>
        </div>
      </div>

      {/* Plans Preview Grid */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-3">
                  <div className="space-y-3">
                   <div className="relative aspect-square">
                     <img
                       src={plan.url}
                       alt={`Plan ${index + 1}`}
                       className="w-full h-full object-cover rounded-md"
                       loading="lazy"
                     />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => removePlan(index)}
                        title="Plan löschen"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Beschreibung (für PDF Export)
                    </label>
                    <Textarea
                      placeholder="Kurze Beschreibung des Plans..."
                      value={plan.description || ''}
                      onChange={(e) => updatePlanDescription(index, e.target.value)}
                      className="text-xs min-h-[60px] resize-none"
                      maxLength={200}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {(plan.description || '').length}/200
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        {plans.length} von {maxPlans} Plänen hochgeladen
      </div>
    </div>
  );
};

export default PlansUpload;