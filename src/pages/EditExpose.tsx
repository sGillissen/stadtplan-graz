import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExposes, CreateExposeData } from "@/hooks/useExposes";
import ImageUpload from "@/components/ImageUpload";
import PlansUpload, { PlanWithDescription } from "@/components/PlansUpload";
import PropertyDetailsEditor from "@/components/PropertyDetailsEditor";
import { ExposeLivePreview } from "@/components/ExposeLivePreview";
import { getPropertyTypeLabel, getStatusLabel, getStatusVariant } from "@/lib/expose-utils";
import { Badge } from "@/components/ui/badge";
import { ImageWithDescription, migrateImages, getImageUrls } from "@/types/image";

const EditExpose = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { exposes, updateExpose, loading } = useExposes();
  
  const [formData, setFormData] = useState({
    title: "",
    property_type: "" as 'house' | 'apartment' | 'commercial' | 'land' | "",
    price: "",
    rooms: "",
    area: "",
    address: "",
    location: "",
    short_info: "",
    description: "",
    location_infrastructure: "",
    equipment_text: "",
    features: ""
  });

  const [images, setImages] = useState<ImageWithDescription[]>([]);
  const [plans, setPlans] = useState<PlanWithDescription[]>([]);
  const [heroImage, setHeroImage] = useState<string>("");
  const [propertyDetails, setPropertyDetails] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [expose, setExpose] = useState<any>(null);

  useEffect(() => {
    if (!loading && exposes.length > 0) {
      const foundExpose = exposes.find(e => e.id === id);
      if (foundExpose) {
        setExpose(foundExpose);
        setFormData({
          title: foundExpose.title || "",
          property_type: foundExpose.property_type || "",
          price: foundExpose.price ? foundExpose.price.toString() : "",
          rooms: foundExpose.rooms ? foundExpose.rooms.toString() : "",
          area: foundExpose.area ? foundExpose.area.toString() : "",
          address: foundExpose.address || "",
          location: foundExpose.location || "",
          short_info: foundExpose.short_info || "",
          description: foundExpose.description || "",
          location_infrastructure: foundExpose.location_infrastructure || "",
          equipment_text: foundExpose.equipment_text || "",
          features: foundExpose.features ? foundExpose.features.join(', ') : ""
        });
        const imagesData = (foundExpose as any).images_data;
        const imagesArray = (foundExpose.images || []) as string[];
        if (imagesData && Array.isArray(imagesData)) {
          // Merge images_data with any plain URLs not present yet
          const fromData = imagesData.filter((img: any) => img && img.url);
          const fromArray = imagesArray
            .filter((url: string) => url && !fromData.some((i: any) => i.url === url))
            .map((url: string) => ({ url, description: '' }));
          setImages([...(fromData as any[]), ...fromArray]);
        } else {
          setImages(migrateImages(imagesArray));
        }
        
        const plansData = (foundExpose as any).plans_data;
        if (plansData && Array.isArray(plansData)) {
          setPlans(plansData);
        } else {
          setPlans([]);
        }
        
        setHeroImage(foundExpose.hero_image || (foundExpose.images && foundExpose.images.length > 0 ? (typeof foundExpose.images[0] === 'string' ? foundExpose.images[0] : (foundExpose.images[0] as any).url) : ''));
        setPropertyDetails(foundExpose.property_details || []);
      }
    }
  }, [id, exposes, loading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.property_type) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie mindestens Titel und Immobilientyp aus.",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    setSaving(true);
    
    const exposeData: Partial<CreateExposeData> = {
      title: formData.title,
      property_type: formData.property_type as 'house' | 'apartment' | 'commercial' | 'land',
      short_info: formData.short_info || undefined,
      hero_image: heroImage || (images.length > 0 ? images[0].url : undefined),
      description: formData.description || undefined,
      location_infrastructure: formData.location_infrastructure || undefined,
      equipment_text: formData.equipment_text || undefined,
      property_details: propertyDetails.length > 0 ? propertyDetails : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
      area: formData.area ? parseFloat(formData.area) : undefined,
      address: formData.address || undefined,
      location: formData.location || undefined,
      features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : undefined,
      images: images.length > 0 ? images : undefined,
      plans_data: plans.length > 0 ? plans : undefined,
    };

    console.log('Saving expose data:', exposeData);
    console.log('Images array:', images);
    console.log('Selected hero image:', heroImage);
    console.log('Images in exposeData:', exposeData.images);

    const result = await updateExpose(id, exposeData);
    
    if (result) {
      toast({
        title: "Änderungen gespeichert",
        description: `Exposé mit ${images.length} Bildern aktualisiert.`,
      });
      navigate(`/view/${id}`);
    }
    
    setSaving(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!expose) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Exposé nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Das zu bearbeitende Exposé existiert nicht oder wurde gelöscht.
            </p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zum Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to={`/view/${id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Ansicht
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{formData.title || "Exposé bearbeiten"}</h1>
                <Badge variant={getStatusVariant(expose?.status || 'draft')}>
                  {getStatusLabel(expose?.status || 'draft')}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {formData.property_type ? getPropertyTypeLabel(formData.property_type) : 'Immobilientyp'}
                {formData.address && ` • ${formData.address}`}
              </p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.title || !formData.property_type}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Speichern..." : "Speichern"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/view/${id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Zur Ansicht
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card>
              <CardContent className="p-0">
                 {images.length > 0 ? (
                   <div className="relative w-full h-64 md:h-80">
                       <img
                         src={heroImage || (images.length > 0 ? images[0].url : '')}
                         alt="Hero Bild"
                         className="w-full h-full object-contain rounded-lg"
                         loading="eager"
                       />
                   </div>
                ) : (
                  <div className="w-full h-64 bg-secondary rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-muted-foreground">Kein Hero-Bild verfügbar</span>
                      <p className="text-xs text-muted-foreground mt-2">Laden Sie Bilder im Abschnitt unten hoch</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Short Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kurzinfo</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Textarea
                    id="short_info"
                    placeholder="Kurzer, aussagekräftiger Text für die erste Seite des Exposés..."
                    rows={3}
                    value={formData.short_info}
                    onChange={(e) => handleInputChange("short_info", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Objektbeschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Textarea
                    id="description"
                    placeholder="Detaillierte Beschreibung der Immobilie..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Infrastructure */}
            <Card>
              <CardHeader>
                <CardTitle>Adresse & Infrastruktur</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Textarea
                    id="location_infrastructure"
                    placeholder="Informationen zur Lage, Verkehrsanbindung, Infrastruktur..."
                    rows={4}
                    value={formData.location_infrastructure}
                    onChange={(e) => handleInputChange("location_infrastructure", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Ausstattung</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Textarea
                    id="equipment_text"
                    placeholder="Detaillierte Beschreibung der Ausstattung und Besonderheiten..."
                    rows={4}
                    value={formData.equipment_text}
                    onChange={(e) => handleInputChange("equipment_text", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <PropertyDetailsEditor 
              propertyDetails={propertyDetails}
              onChange={setPropertyDetails}
            />

            {/* Weitere Bilder Gallery */}
            {images.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weitere Bilder</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                     {images.slice(1).map((image: ImageWithDescription, index: number) => (
                       <div key={index + 1} className="relative aspect-video">
                         <img
                           src={image.url}
                           alt={`Bild ${index + 2}`}
                           className="w-full h-full object-cover rounded-lg"
                           loading="lazy"
                         />
                       </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bearbeitungsformulare */}
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten</CardTitle>
                <CardDescription>Allgemeine Informationen zur Immobilie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titel des Exposés *</Label>
                    <Input
                      id="title"
                      placeholder="z.B. Moderne 3-Zimmer Wohnung"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="property_type">Immobilientyp *</Label>
                    <Select onValueChange={(value) => handleInputChange("property_type", value)} value={formData.property_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Typ auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Wohnung</SelectItem>
                        <SelectItem value="house">Haus</SelectItem>
                        <SelectItem value="land">Grundstück</SelectItem>
                        <SelectItem value="commercial">Gewerbe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Kaufpreis (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="450000"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rooms">Zimmer</Label>
                    <Input
                      id="rooms"
                      type="number"
                      placeholder="3"
                      value={formData.rooms}
                      onChange={(e) => handleInputChange("rooms", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Wohnfläche (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="85"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      placeholder="Musterstraße 123, 10115 Berlin"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ort/Stadtteil</Label>
                    <Input
                      id="location"
                      placeholder="Berlin-Mitte"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bilder verwalten */}
            <Card>
              <CardHeader>
                <CardTitle>Bilder verwalten</CardTitle>
                <CardDescription>Fügen Sie Fotos hinzu oder entfernen Sie welche. Das erste Bild wird als Hero-Bild verwendet.</CardDescription>
              </CardHeader>
              <CardContent>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
              onImageReplaced={(oldUrl, newUrl, index) => {
                if (heroImage === oldUrl) setHeroImage(newUrl);
              }}
            />
            
            {/* Hero Image Selection */}
            {images.length > 0 && (
              <div>
                <Label>Hero-Bild auswählen</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                        heroImage === image.url ? 'border-primary' : 'border-border'
                      }`}
                      onClick={() => setHeroImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={`Bild ${index + 1}`}
                        className="w-full h-20 object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                      />
                      {heroImage === image.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Hero
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
              </CardContent>
            </Card>

            {/* Pläne verwalten */}
            <Card>
              <CardHeader>
                <CardTitle>Pläne verwalten</CardTitle>
                <CardDescription>Laden Sie Grundrisse, Lagepläne oder andere Pläne hoch (Bilder oder PDFs)</CardDescription>
              </CardHeader>
              <CardContent>
                <PlansUpload
                  plans={plans}
                  onPlansChange={setPlans}
                  maxPlans={10}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <ExposeLivePreview
            data={{
              title: formData.title,
              property_type: formData.property_type,
              price: formData.price,
              rooms: formData.rooms,
              area: formData.area,
              address: formData.address,
              location: formData.location,
              status: expose?.status || 'draft',
              created_at: expose?.created_at,
              updated_at: expose?.updated_at
            }}
            images={images}
            heroImage={heroImage || (images.length > 0 ? images[0].url : '')}
            isEditing={true}
            showImageGallery={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditExpose;