/**
 * Utility for optimizing Cloudinary image URLs
 * Adds transformations for automatic format, quality, and responsive sizing
 */

interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

/**
 * Generates an optimized Cloudinary URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export const getOptimizedCloudinaryUrl = (
  url: string,
  options: CloudinaryOptions = {}
): string => {
  // If not a Cloudinary URL, return original
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;

  // Build transformations array
  const transformations: string[] = [];
  
  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  
  // If no transformations, return original
  if (transformations.length === 0) {
    return url;
  }

  // Insert transformations into URL after /upload/
  const transformationString = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformationString}/`);
};

/**
 * Predefined Cloudinary presets for common use cases
 */
export const CloudinaryPresets = {
  // Card images (course cards, podcast cards)
  CARD_IMAGE: {
    width: 400,
    quality: 'auto' as const,
    format: 'auto' as const,
  },
  
  // Creator/User avatars (small circular images)
  AVATAR: {
    width: 100,
    quality: 'auto' as const,
    format: 'auto' as const,
  },
  
  // Hero/Banner images (large, high-quality)
  HERO_IMAGE: {
    width: 1200,
    quality: 'auto' as const,
    format: 'auto' as const,
  },
  
  // Thumbnail images (very small)
  THUMBNAIL: {
    width: 200,
    quality: 'auto' as const,
    format: 'auto' as const,
  },
  
  // Category images
  CATEGORY_IMAGE: {
    width: 600,
    quality: 'auto' as const,
    format: 'auto' as const,
  },
  
  // Course disc/vinyl image (medium-large)
  DISC_IMAGE: {
    width: 500,
    quality: 'auto' as const,
    format: 'auto' as const,
  },
};
