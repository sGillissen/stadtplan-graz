export interface ImageWithDescription {
  url: string;
  description?: string;
}

// Helper function to convert old string[] format to new format
export const migrateImages = (images: string[] | ImageWithDescription[]): ImageWithDescription[] => {
  if (!images || images.length === 0) return [];
  
  // Check if already in new format
  if (typeof images[0] === 'object' && 'url' in images[0]) {
    return images as ImageWithDescription[];
  }
  
  // Convert from old string[] format
  return (images as string[]).map(url => ({ url, description: '' }));
};

// Helper function for backward compatibility - extract URLs only
export const getImageUrls = (images: string[] | ImageWithDescription[]): string[] => {
  if (!images || images.length === 0) return [];
  
  if (typeof images[0] === 'string') {
    return images as string[];
  }
  
  return (images as ImageWithDescription[]).map(img => img.url);
};