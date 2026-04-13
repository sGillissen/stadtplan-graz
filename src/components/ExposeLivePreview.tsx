import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, MapPin } from "lucide-react";
import { getPropertyTypeLabel, getStatusLabel, getStatusVariant } from "@/lib/expose-utils";
import { ImageWithDescription, getImageUrls } from "@/types/image";

interface ExposeData {
  title?: string;
  property_type?: string;
  price?: string | number;
  rooms?: string | number;
  area?: string | number;
  address?: string;
  location?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface ExposeLivePreviewProps {
  data: ExposeData;
  images: string[] | ImageWithDescription[];
  heroImage?: string;
  isEditing?: boolean;
  actions?: React.ReactNode;
  showImageGallery?: boolean;
}

export const ExposeLivePreview: React.FC<ExposeLivePreviewProps> = ({
  data,
  images,
  heroImage,
  isEditing = false,
  actions,
  showImageGallery = false
}) => {
  const imageUrls = getImageUrls(images);
  const displayHeroImage = heroImage || (imageUrls.length > 0 ? imageUrls[0] : null);
  
  return (
    <div className="space-y-6">
      {/* Hero Image Preview - nur anzeigen wenn nicht im Bearbeitungsmodus */}
      {!isEditing && (
        <Card>
          <CardContent className="p-0">
            {displayHeroImage ? (
              <div className="relative w-full h-32">
                <img
                  src={displayHeroImage}
                  alt="Hero-Bild Vorschau"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-secondary rounded-t-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Hero-Bild Vorschau</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price & Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Kaufpreis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary mb-4">
            {data.price 
              ? `${Number(data.price).toLocaleString()} €`
              : "Preis auf Anfrage"
            }
          </div>
          
          <div className="space-y-3">
            {data.rooms && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zimmer:</span>
                <span className="font-medium">{data.rooms}</span>
              </div>
            )}
            {data.area && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wohnfläche:</span>
                <span className="font-medium">{data.area} m²</span>
              </div>
            )}
            {data.property_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Typ:</span>
                <span className="font-medium">{getPropertyTypeLabel(data.property_type)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      {data.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{data.address}</p>
            {data.location && data.location !== data.address && (
              <p className="text-muted-foreground mt-1">{data.location}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meta Information */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isEditing && data.created_at && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Erstellt:</span>
              <span>{new Date(data.created_at).toLocaleDateString('de-DE')}</span>
            </div>
          )}
          {isEditing && data.updated_at && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Zuletzt bearbeitet:</span>
              <span>{new Date(data.updated_at).toLocaleDateString('de-DE')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={getStatusVariant(data.status || 'draft')} className="text-xs">
              {getStatusLabel(data.status || 'draft')}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bilder:</span>
            <span>{imageUrls.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery with Descriptions */}
      {showImageGallery && images && images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bildergalerie ({images.length} Bilder)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                // Handle both old string[] format and new ImageWithDescription[] format
                const imageList = Array.isArray(images) ? images : [];
                
                return imageList.map((image: any, index: number) => {
                  const imageUrl = typeof image === 'string' ? image : image.url;
                  const imageDesc = typeof image === 'string' ? '' : (image.description || '');
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="relative aspect-video">
                        <img
                          src={imageUrl}
                          alt={imageDesc || `Bild ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.parentElement?.querySelector('.img-fallback') as HTMLElement | null;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                        <div className="img-fallback hidden w-full h-full items-center justify-center bg-secondary text-muted-foreground text-sm rounded-lg">
                          Bild nicht verfügbar
                        </div>
                      </div>
                      {imageDesc && (
                        <p className="text-sm text-muted-foreground">{imageDesc}</p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions - nur wenn vorhanden und nicht im Bearbeitungsmodus */}
      {actions && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Aktionen</CardTitle>
          </CardHeader>
          <CardContent>
            {actions}
          </CardContent>
        </Card>
      )}

      {!isEditing && (
        <div className="text-xs text-muted-foreground">
          * Pflichtfelder: Titel und Immobilientyp
        </div>
      )}
    </div>
  );
};