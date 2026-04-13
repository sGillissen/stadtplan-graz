import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { useSettings } from '@/hooks/useSettings';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingLeft: 57, // 2cm left margin
    paddingRight: 30,
    paddingTop: 80,
    paddingBottom: 80, // Increased bottom padding for footer space
    fontFamily: 'Helvetica', // Using Helvetica as Calibri substitute (both Sans-Serif)
  },
  header: {
    position: 'absolute',
    top: 30,
    right: 30,
    left: 57,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 57,
    right: 30,
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: 'contain',
  },
  footerText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  titlePageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  companyInfo: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'flex-end',
  },
  companyText: {
    fontSize: 11,
    color: '#333',
    lineHeight: 1.4,
    textAlign: 'right',
    marginBottom: 2,
  },
  shortInfo: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#B8860B',
    textAlign: 'center',
    marginVertical: 30,
    lineHeight: 1.3,
    fontFamily: 'Helvetica',
  },
  heroImage: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'contain',
    marginBottom: 10,
  },
  heroImageDescription: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#B8860B',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  imageGallery: {
    flexDirection: 'column',
    gap: 10,
  },
  layoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  // Portrait images (taller than wide)
  portraitContainer: {
    width: '48%',
  },
  portraitImage: {
    width: '100%',
    height: 160, // Reduced height to prevent overflow
    objectFit: 'contain',
    marginBottom: 5,
  },
  // Landscape images (wider than tall)
  landscapeContainer: {
    width: '48%',
  },
  landscapeImage: {
    width: '100%',
    height: 160, // Reduced height to prevent overflow
    objectFit: 'contain',
    marginBottom: 5,
  },
  // Square images
  squareContainer: {
    width: '48%',
  },
  squareImage: {
    width: '100%',
    height: 160, // Reduced height to prevent overflow
    objectFit: 'contain',
    marginBottom: 5,
  },
  // Full width for special cases
  fullWidthContainer: {
    width: '100%',
  },
  fullWidthImage: {
    width: '100%',
    maxHeight: 180,
    objectFit: 'contain',
    marginBottom: 5,
  },
  // Single large image
  singleLargeContainer: {
    width: '100%',
  },
  singleLargeImage: {
    width: '100%',
    height: 220, // Slightly larger for single images but still consistent
    objectFit: 'contain',
    marginBottom: 8,
  },
  planImage: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'contain',
    marginBottom: 10,
  },
  imageDescription: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 1.3,
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 20,
    minPresenceAhead: 50, // Verhindert Umbrüche wenn weniger als 50pt Platz
  },
  detailsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Helvetica',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 9,
    color: '#666',
    width: '35%',
    fontWeight: 'normal',
  },
  detailValue: {
    fontSize: 9,
    color: '#333',
    width: '65%',
    fontFamily: 'Helvetica',
  },
  description: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333',
    textAlign: 'justify',
    fontFamily: 'Helvetica',
  },
  indentedDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#333',
    textAlign: 'justify',
    marginLeft: '35%', // Align with detailValue column
    fontFamily: 'Helvetica',
  },
  featuresContainer: {
    marginBottom: 20,
    minPresenceAhead: 50, // Verhindert Umbrüche wenn weniger als 50pt Platz
  },
  featureItem: {
    fontSize: 11,
    color: '#333',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  yellowTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#B8860B',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  infoText: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.5,
    marginBottom: 15,
    textAlign: 'justify',
    fontFamily: 'Helvetica',
  },
  contactInfo: {
    fontSize: 11,
    color: '#333',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 8,
    color: '#333',
    lineHeight: 1.4,
    marginBottom: 10,
    textAlign: 'justify',
  },
});

interface PDFTemplateProps {
  expose: any;
  settings: Record<string, string>;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ expose, settings }) => {
  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      house: 'Haus',
      apartment: 'Wohnung',
      commercial: 'Gewerbe',
      land: 'Grundstück'
    };
    return types[type] || type;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Helper function to determine image aspect ratio
  const getAspectRatio = (url: string): 'portrait' | 'landscape' | 'square' => {
    // For now, we'll use a simple heuristic based on typical image names/URLs
    // In a real implementation, you might want to load image dimensions
    // For this demo, we'll assume a mix of formats
    const hash = url.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const ratio = hash % 3;
    if (ratio === 0) return 'portrait';
    if (ratio === 1) return 'landscape';
    return 'square';
  };

  // Intelligent layout creator
  const createIntelligentLayout = (images: any[]) => {
    const layouts: any[] = [];
    let currentIndex = 0;

    while (currentIndex < images.length) {
      const remainingImages = images.slice(currentIndex);
      
      if (remainingImages.length === 1) {
        // Single image - use large format
        layouts.push({
          type: 'single',
          images: [remainingImages[0]]
        });
        currentIndex += 1;
      } else if (remainingImages.length >= 2) {
        const firstAspect = getAspectRatio(remainingImages[0].url);
        const secondAspect = getAspectRatio(remainingImages[1].url);
        
        // Create optimal pairs
        if (firstAspect === 'portrait' && secondAspect === 'portrait') {
          // Two portraits side by side
          layouts.push({
            type: 'double-portrait',
            images: remainingImages.slice(0, 2)
          });
          currentIndex += 2;
        } else if (firstAspect === 'landscape' && secondAspect === 'landscape') {
          // Two landscapes side by side
          layouts.push({
            type: 'double-landscape', 
            images: remainingImages.slice(0, 2)
          });
          currentIndex += 2;
        } else {
          // Mixed formats - side by side
          layouts.push({
            type: 'mixed',
            images: remainingImages.slice(0, 2)
          });
          currentIndex += 2;
        }
      }
    }

    return layouts;
  };

  // Resolve logo and brand color (fallbacks)
  const rawLogo = (settings as any).logo_url || (settings as any).LOGO_URL || (settings as any).logo || (settings as any).company_logo || (settings as any).company_logo_url || (settings as any).logo_png_url || null;
  const isSvgLogo = typeof rawLogo === 'string' && rawLogo.toLowerCase().endsWith('.svg');
  const logoSrc = isSvgLogo ? ((settings as any).logo_png_url || (settings as any).logo_fallback_url || null) : rawLogo;
  const brandColor = (settings as any).brand_color || (settings as any).primary_color || '#1E3A8A';

  // Header component for all pages
  const PageHeader = () => (
    <View style={styles.header}>
      {logoSrc && (
        <Image style={styles.logo} src={logoSrc} />
      )}
    </View>
  );

  // Footer component for all pages
  const PageFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: brandColor }]}>
        {settings.footer_text || ''}
      </Text>
    </View>
  );

  // Get images and plans data (merge images_data with plain images[])
  const fromData = Array.isArray(expose.images_data) ? expose.images_data.filter((img: any) => img && img.url) : [];
  const fromArray = (expose.images || []).filter((url: string) => url && !fromData.some((i: any) => i.url === url)).map((url: string) => ({ url, description: '' }));
  const mergedImages = [...fromData, ...fromArray];
  const plansData = expose.plans_data || [];

  // Determine hero image (prefer explicit hero_image)
  const heroUrl = expose.hero_image || (mergedImages[0]?.url ?? null);
  const heroImage = heroUrl ? (mergedImages.find((img: any) => img.url === heroUrl) || { url: heroUrl, description: '' }) : null;
  const galleryImages = heroUrl ? mergedImages.filter((img: any) => img.url !== heroUrl) : mergedImages;


  // Split layouts into chunks for multiple pages
  const chunkArray = (array: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const imageLayouts = createIntelligentLayout(galleryImages);
  const layoutChunks = chunkArray(imageLayouts, 3); // Reduced to 3 layouts per page for better spacing and footer visibility
  const planChunks = chunkArray(plansData, 1); // 1 plan per page

  // Render function for different layout types
  const renderImageLayout = (layout: any, layoutIndex: number) => {
    switch (layout.type) {
      case 'single':
        return (
          <View key={layoutIndex} style={styles.singleLargeContainer}>
            <Image style={styles.singleLargeImage} src={layout.images[0].url} />
            {layout.images[0].description && (
              <Text style={styles.imageDescription}>
                {layout.images[0].description}
              </Text>
            )}
          </View>
        );
      
      case 'double-portrait':
        return (
          <View key={layoutIndex} style={styles.layoutRow}>
            {layout.images.map((image: any, index: number) => (
              <View key={index} style={styles.portraitContainer}>
                <Image style={styles.portraitImage} src={image.url} />
                {image.description && (
                  <Text style={styles.imageDescription}>
                    {image.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      
      case 'double-landscape':
        return (
          <View key={layoutIndex} style={styles.layoutRow}>
            {layout.images.map((image: any, index: number) => (
              <View key={index} style={styles.landscapeContainer}>
                <Image style={styles.landscapeImage} src={image.url} />
                {image.description && (
                  <Text style={styles.imageDescription}>
                    {image.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      
      case 'mixed':
        return (
          <View key={layoutIndex} style={styles.layoutRow}>
            {layout.images.map((image: any, index: number) => {
              const aspectRatio = getAspectRatio(image.url);
              const containerStyle = aspectRatio === 'portrait' ? styles.portraitContainer :
                                   aspectRatio === 'landscape' ? styles.landscapeContainer :
                                   styles.squareContainer;
              const imageStyle = aspectRatio === 'portrait' ? styles.portraitImage :
                               aspectRatio === 'landscape' ? styles.landscapeImage :
                               styles.squareImage;
              
              return (
                <View key={index} style={containerStyle}>
                  <Image style={imageStyle} src={image.url} />
                  {image.description && (
                    <Text style={styles.imageDescription}>
                      {image.description}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Document>
      {/* Page 1 - Title Page */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <PageFooter />
        
        <View style={styles.titlePageContainer}>
          {/* Company Information */}
          <View style={styles.companyInfo}>
            {settings.company_name && (
              <Text style={styles.companyText}>
                {settings.company_name}
              </Text>
            )}
            {settings.general_contact && (
              <Text style={styles.companyText}>
                {settings.general_contact}
              </Text>
            )}
          </View>

          {/* Short Info in Yellow */}
          {expose.short_info && (
            <Text style={styles.shortInfo}>
              {expose.short_info}
            </Text>
          )}

          {/* Hero Image */}
          {heroImage && (
            <View>
              <Image style={styles.heroImage} src={heroImage.url} />
              {heroImage.description && (
                <Text style={styles.heroImageDescription}>
                  {heroImage.description}
                </Text>
              )}
            </View>
          )}
        </View>
      </Page>

      {/* Image Gallery Pages */}
      {layoutChunks.map((chunk, pageIndex) => (
        <Page key={`images-${pageIndex}`} size="A4" style={styles.page}>
          <PageHeader />
          <PageFooter />
          
          <Text style={styles.pageTitle}>Bildergalerie</Text>
          
          <View style={styles.imageGallery}>
            {chunk.map((layout: any, layoutIndex: number) => 
              renderImageLayout(layout, layoutIndex)
            )}
          </View>
        </Page>
      ))}

      {/* Plans Pages */}
      {planChunks.map((chunk, pageIndex) => (
        <Page key={`plans-${pageIndex}`} size="A4" style={styles.page}>
          <PageHeader />
          <PageFooter />
          
          <Text style={styles.pageTitle}>Pläne</Text>
          
          {chunk.map((plan: any, index: number) => (
            <View key={index} style={{ marginBottom: 30 }}>
              <Image style={styles.planImage} src={plan.url} />
              {plan.description && (
                <Text style={styles.imageDescription}>
                  {plan.description}
                </Text>
              )}
            </View>
          ))}
        </Page>
      ))}

      {/* Property Details Page */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <PageFooter />
        
        <Text style={styles.pageTitle}>Objektinformationen</Text>

        {/* Additional Property Details */}
        {expose.property_details && expose.property_details.length > 0 && (
          <View style={styles.detailsSection} wrap={false}>
            <Text style={styles.detailsTitle}>Objektdetails</Text>
            {expose.property_details.map((detail: any, index: number) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}:</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {expose.description && (
          <View style={styles.detailsSection} wrap={false}>
            <Text style={styles.detailsTitle}>Objektbeschreibung</Text>
            <Text style={styles.indentedDescription}>{expose.description}</Text>
          </View>
        )}

        {/* Features */}
        {expose.features && expose.features.length > 0 && (
          <View style={styles.featuresContainer} wrap={false}>
            <Text style={styles.detailsTitle}>Ausstattung</Text>
            {expose.features.map((feature: string, index: number) => (
              <Text key={index} style={styles.featureItem}>• {feature}</Text>
            ))}
          </View>
        )}

        {/* Location & Infrastructure */}
        {expose.location_infrastructure && (
          <View style={styles.detailsSection} wrap={false}>
            <Text style={styles.detailsTitle}>Lage & Infrastruktur</Text>
            <Text style={styles.indentedDescription}>{expose.location_infrastructure}</Text>
          </View>
        )}

        {settings.contact_info && (
          <View style={styles.detailsSection}>
            <Text style={styles.shortInfo}>{settings.contact_info}</Text>
          </View>
        )}
      </Page>


      {/* Additional Information Pages */}
      {(settings.misc_info || settings.purchase_costs || settings.privacy_policy) && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <PageFooter />
          
          {settings.misc_info && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Sonstiges</Text>
              <Text style={styles.infoText}>{settings.misc_info}</Text>
            </View>
          )}

          {settings.purchase_costs && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Kaufnebenkosten</Text>
              <Text style={styles.infoText}>{settings.purchase_costs}</Text>
            </View>
          )}

          {settings.privacy_policy && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Datenschutz</Text>
              <Text style={styles.privacyText}>{settings.privacy_policy}</Text>
            </View>
          )}
        </Page>
      )}
    </Document>
  );
};