import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, GripVertical } from 'lucide-react';
import { ImageWithDescription } from '@/types/image';

interface SortableImageCardProps {
  image: ImageWithDescription;
  index: number;
  onRemove: (index: number) => void;
  onUpdateDescription: (index: number, description: string) => void;
  id: string;
}

export const SortableImageCard: React.FC<SortableImageCardProps> = ({
  image,
  index,
  onRemove,
  onUpdateDescription,
  id,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative group ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="relative aspect-square">
            <img
              src={image.url}
              alt={`Exposé Bild ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="w-8 h-8 p-0 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
                title="Bild verschieben"
              >
                <GripVertical className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onRemove(index)}
                title="Bild löschen"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Bildbeschreibung (für PDF)
            </label>
            <Textarea
              placeholder="Kurze Beschreibung für das PDF..."
              value={image.description || ''}
              onChange={(e) => onUpdateDescription(index, e.target.value)}
              className="text-xs min-h-[60px] resize-none"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right">
              {(image.description || '').length}/200
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};