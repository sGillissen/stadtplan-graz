import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Share2, Download, MapPin, Home, Euro, FileText } from "lucide-react";
import { useExposes } from "@/hooks/useExposes";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFTemplate } from '@/components/PDFTemplate';
import { generateSimpleWordDocument } from '@/components/SimpleWordTemplate';
import { toast } from "@/hooks/use-toast";
import { getPropertyTypeLabel, getStatusLabel, getStatusVariant } from "@/lib/expose-utils";
const ViewExpose = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    exposes,
    loading
  } = useExposes();
  const {
    userRole
  } = useAuth();
  const {
    settings
  } = useSettings();
  const handleWordExport = async () => {
    if (!expose) return;
    try {
      toast({
        title: "Word Export wird erstellt...",
        description: "Bitte warten Sie einen Moment."
      });
      const wordBlob = await generateSimpleWordDocument(expose, settings);
      const url = URL.createObjectURL(wordBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expose-${expose.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Word Export erfolgreich",
        description: "Das Word-Dokument wurde heruntergeladen."
      });
    } catch (error) {
      console.error('Word export error:', error);
      toast({
        title: "Fehler beim Word Export",
        description: "Das Word-Dokument konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>;
  }
  const expose = exposes.find(e => e.id === id);
  if (!expose) {
    return <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Exposé nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Das angeforderte Exposé existiert nicht oder wurde gelöscht.
            </p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zum Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
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
                <h1 className="text-3xl font-bold text-foreground">{expose.title}</h1>
                <Badge variant={getStatusVariant(expose.status)}>
                  {getStatusLabel(expose.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {getPropertyTypeLabel(expose.property_type)}
                {expose.location && ` • ${expose.location}`}
              </p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => navigate(`/edit/${expose.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
              
              <PDFDownloadLink document={<PDFTemplate expose={expose} settings={settings} />} fileName={`expose-${expose.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`}>
                {({
                blob,
                url,
                loading,
                error
              }) => <Button variant="outline" disabled={loading} onClick={() => {
                if (error) {
                  toast({
                    title: "Fehler beim PDF Export",
                    description: "Das PDF konnte nicht erstellt werden.",
                    variant: "destructive"
                  });
                }
              }}>
                    <FileText className="w-4 h-4 mr-2" />
                    {loading ? 'Erstelle PDF...' : 'PDF Export'}
                  </Button>}
              </PDFDownloadLink>
              <Button variant="outline" onClick={handleWordExport}>
                <Download className="w-4 h-4 mr-2" />
                Word Export
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
                {expose.hero_image || expose.images && expose.images.length > 0 ? <div className="space-y-3">
                    <div className="relative w-full h-64 md:h-80">
                       <img src={expose.hero_image || expose.images[0]} alt={`${expose.title} - Hero Bild`} className="w-full h-full object-contain rounded-lg" loading="eager" crossOrigin="anonymous" referrerPolicy="no-referrer" onError={e => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.parentElement?.nextElementSibling as HTMLElement | null;
                    if (placeholder && placeholder.classList.contains('hero-fallback')) {
                      placeholder.style.display = 'block';
                    }
                  }} />
                    </div>
                    <div className="px-4 pb-4 hero-fallback" style={{
                  display: 'none'
                }}>
                      <p className="text-sm text-muted-foreground italic">Bild konnte nicht geladen werden.</p>
                    </div>
                    {/* Hero Image Description */}
                    {(() => {
                  const imagesData = expose.images_data;
                  if (imagesData && Array.isArray(imagesData)) {
                    const heroImageData = imagesData.find((img: any) => img.url === expose.hero_image);
                    if (heroImageData?.description) {
                      return <div className="px-4 pb-4">
                              <p className="text-sm text-muted-foreground italic">
                                {heroImageData.description}
                              </p>
                            </div>;
                    }
                  }
                  return null;
                })()}
                  </div> : <div className="w-full h-64 bg-secondary rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-muted-foreground">Kein Hero-Bild verfügbar</span>
                    </div>
                  </div>}
              </CardContent>
            </Card>

            {/* Short Info */}
            {expose.short_info && <Card>
                <CardHeader>
                  <CardTitle>Kurzinfo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">{expose.short_info}</p>
                </CardContent>
              </Card>}

            {/* Description */}
            {expose.description && <Card>
                <CardHeader>
                  <CardTitle>Objektbeschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">{expose.description}</p>
                </CardContent>
              </Card>}

            {/* Location & Infrastructure */}
            {expose.location_infrastructure && <Card>
                <CardHeader>
                  <CardTitle>Adresse & Infrastruktur</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">{expose.location_infrastructure}</p>
                </CardContent>
              </Card>}

            {/* Equipment */}
            {expose.equipment_text && <Card>
                <CardHeader>
                  <CardTitle>Ausstattung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">{expose.equipment_text}</p>
                </CardContent>
              </Card>}

            {/* Property Details Table */}
            {expose.property_details && expose.property_details.length > 0 && <Card>
                <CardHeader>
                  <CardTitle>Objektdetails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expose.property_details.map((detail: any, index: number) => <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <span className="text-muted-foreground font-medium">{detail.label}:</span>
                        <span className="font-semibold text-foreground">{detail.value}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            {/* Image Gallery */}
            {expose.images && expose.images.length > 0 && <Card>
                <CardHeader>
                  <CardTitle>Weitere Bilder</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {(() => {
                  const imagesData = expose.images_data;
                  let galleryImages: Array<{
                    url: string;
                    description?: string;
                  }> = [];
                  if (imagesData && Array.isArray(imagesData)) {
                    // Prefer images_data but also include any missing plain image URLs
                    const fromData = imagesData.filter((img: any) => img.url && img.url !== expose.hero_image);
                    const fromArray = (expose.images as string[]).filter(url => url && url !== expose.hero_image && !fromData.some((i: any) => i.url === url)).map(url => ({
                      url,
                      description: ''
                    }));
                    galleryImages = [...fromData, ...fromArray];
                  } else {
                    // Fallback to images array
                    galleryImages = (expose.images as string[]).filter(url => url !== expose.hero_image).map(url => ({
                      url,
                      description: ''
                    }));
                  }
                  return galleryImages.map((image: any, index: number) => <div key={index} className="space-y-2">
                          <div className="relative aspect-video">
                            <img src={image.url} alt={image.description || `${expose.title} - Bild ${index + 1}`} className="w-full h-full object-cover rounded-lg" loading="lazy" crossOrigin="anonymous" referrerPolicy="no-referrer" onError={e => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.parentElement?.querySelector('.img-fallback') as HTMLElement | null;
                        if (placeholder) placeholder.style.display = 'flex';
                      }} />
                            <div className="img-fallback hidden w-full h-full items-center justify-center bg-secondary text-muted-foreground text-sm rounded-lg">
                              Bild konnte nicht geladen werden
                            </div>
                          </div>
                          {image.description && <p className="text-sm text-muted-foreground italic px-1">
                              {image.description}
                            </p>}
                        </div>);
                })()}
                  </div>
                 </CardContent>
               </Card>}

            {/* Plans Gallery */}
            {expose.plans_data && expose.plans_data.length > 0 && <Card>
                <CardHeader>
                  <CardTitle>Pläne</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {expose.plans_data.map((plan: any, index: number) => <div key={index} className="space-y-2">
                         <div className="relative aspect-video">
                           <img src={plan.url} alt={plan.description || `Plan ${index + 1}`} className="w-full h-full object-cover rounded-lg" loading="lazy" />
                         </div>
                        {plan.description && <p className="text-sm text-muted-foreground italic px-1">
                            {plan.description}
                          </p>}
                      </div>)}
                  </div>
                </CardContent>
              </Card>}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  {expose.price ? `${Number(expose.price).toLocaleString()} €` : "Preis auf Anfrage"}
                </div>
                
                <div className="space-y-3">
                  {expose.rooms && <div className="flex justify-between">
                      <span className="text-muted-foreground">Zimmer:</span>
                      <span className="font-medium">{expose.rooms}</span>
                    </div>}
                  {expose.area && <div className="flex justify-between">
                      <span className="text-muted-foreground">Wohnfläche:</span>
                      <span className="font-medium">{expose.area} m²</span>
                    </div>}
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Typ:</span>
                     <span className="font-medium">{getPropertyTypeLabel(expose.property_type)}</span>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Location */}
            {expose.address && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{expose.address}</p>
                  {expose.location && expose.location !== expose.address && <p className="text-muted-foreground mt-1">{expose.location}</p>}
                </CardContent>
              </Card>}

            {/* Meta Information */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Erstellt:</span>
                  <span>{new Date(expose.created_at).toLocaleDateString('de-DE')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zuletzt bearbeitet:</span>
                  <span>{new Date(expose.updated_at).toLocaleDateString('de-DE')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusVariant(expose.status)} className="text-xs">
                    {getStatusLabel(expose.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default ViewExpose;