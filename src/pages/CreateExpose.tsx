import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useExposes, CreateExposeData } from "@/hooks/useExposes";
import ImageUpload from "@/components/ImageUpload";
import PlansUpload, { PlanWithDescription } from "@/components/PlansUpload";
import PropertyDetailsEditor, { PropertyDetail } from "@/components/PropertyDetailsEditor";
import { ExposeLivePreview } from "@/components/ExposeLivePreview";
import { getPropertyTypeLabel } from "@/lib/expose-utils";
import { Badge } from "@/components/ui/badge";
import { ImageWithDescription, migrateImages, getImageUrls } from "@/types/image";

const CreateExpose = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createExpose } = useExposes();
  
  const [formData, setFormData] = useState({
    title: "",
    short_info: "",
    description: "",
    location_infrastructure: "",
    equipment_text: "",
    property_type: "" as 'house' | 'apartment' | 'commercial' | 'land' | "",
    price: "",
    rooms: "",
    area: "",
    address: "",
    location: "",
    features: ""
  });

  const [images, setImages] = useState<ImageWithDescription[]>([]);
  const [plans, setPlans] = useState<PlanWithDescription[]>([]);
  const [heroImage, setHeroImage] = useState<string>("");
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetail[]>([]);
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
    
    const exposeData: CreateExposeData = {
      title: formData.title,
      short_info: formData.short_info || undefined,
      hero_image: heroImage || undefined,
      description: formData.description || undefined,
      location_infrastructure: formData.location_infrastructure || undefined,
      equipment_text: formData.equipment_text || undefined,
      property_type: formData.property_type as 'house' | 'apartment' | 'commercial' | 'land',
      property_details: propertyDetails.length > 0 ? propertyDetails : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
      area: formData.area ? parseFloat(formData.area) : undefined,
      address: formData.address || undefined,
      location: formData.location || undefined,
      features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : undefined,
      images: images.length > 0 ? images : undefined,
      plans_data: plans.length > 0 ? plans : undefined,
      status: 'draft',
    };

    const result = await createExpose(exposeData);
    
    if (result) {
      // Reset form
      setFormData({
        title: "",
        short_info: "",
        description: "",
        location_infrastructure: "",
        equipment_text: "",
        property_type: "",
        price: "",
        rooms: "",
        area: "",
        address: "",
        location: "",
        features: ""
      });
      setImages([]);
      setPlans([]);
      setHeroImage("");
      setPropertyDetails([]);
      
      // Navigate back to dashboard
      navigate('/dashboard');
    }
    
    setSaving(false);
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Neues Exposé erstellen</h1>
                <Badge variant="secondary">Entwurf</Badge>
              </div>
              <p className="text-muted-foreground">
                {formData.property_type ? getPropertyTypeLabel(formData.property_type) : 'Immobilientyp wählen'}
                {formData.address && ` • ${formData.address}`}
              </p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button 
                onClick={handleSave} 
                className="bg-primary hover:bg-primary/90"
                disabled={saving || !formData.title || !formData.property_type}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Speichern..." : "Speichern"}
              </Button>
              <Button variant="outline" disabled>
                <Eye className="w-4 h-4 mr-2" />
                Vollständige Vorschau
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
                <CardDescription>Einleitender Text für das Exposé</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="short_info">Kurzinfo (Hero-Text)</Label>
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
                <CardDescription>Detaillierte Beschreibung der Immobilie</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="description">Objektbeschreibung</Label>
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
                <CardDescription>Informationen zur Lage und Infrastruktur</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="location_infrastructure">Adresse & Infrastruktur</Label>
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
                <CardDescription>Beschreibung der Ausstattung und Besonderheiten</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="equipment_text">Ausstattung</Label>
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

            {/* Image Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Bilder & Hero-Bild-Auswahl</CardTitle>
                <CardDescription>Fügen Sie Fotos hinzu und wählen Sie das Hero-Bild</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                    onImageReplaced={(oldUrl, newUrl) => {
                      if (heroImage === oldUrl) setHeroImage(newUrl);
                    }}
                  />
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Klicken Sie auf ein Bild, um es als Hero-Bild zu verwenden
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Pläne</CardTitle>
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

            {/* Grunddaten */}
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
                    <Select onValueChange={(value) => handleInputChange("property_type", value)}>
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

            {/* Additional Features (deprecated) - entfernt */}
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
              status: 'draft'
            }}
            images={getImageUrls(images)}
            heroImage={heroImage}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateExpose;