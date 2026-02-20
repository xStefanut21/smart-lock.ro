import React from 'react';

interface ImageSEOProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  productName?: string;
  alt?: string;
  generateAltFromProduct?: boolean;
}

/**
 * ImageSEO Component - Enhanced Image Component with Automatic Alt Text Generation
 *
 * Automatically generates SEO-friendly alt text from product names when alt is not provided
 * Includes lazy loading, proper sizing, and accessibility features
 */
export const ImageSEO: React.FC<ImageSEOProps> = ({
  productName,
  alt,
  generateAltFromProduct = true,
  src,
  ...props
}) => {
  // Generate alt text if not provided and generateAltFromProduct is enabled
  const finalAlt = React.useMemo(() => {
    if (alt) return alt;
    if (generateAltFromProduct && productName) {
      return generateImageAltText(productName);
    }
    return 'Imagine produs';
  }, [alt, productName, generateAltFromProduct]);

  return (
    <img
      {...props}
      src={src}
      alt={finalAlt}
      loading="lazy"
      decoding="async"
    />
  );
};

/**
 * Generate SEO-friendly alt text from product name
 * Converts product names into descriptive, keyword-rich alt text
 */
export function generateImageAltText(productName: string): string {
  if (!productName || typeof productName !== 'string') {
    return 'Imagine produs';
  }

  // Clean and normalize the product name
  let altText = productName
    .trim()
    .toLowerCase()
    // Replace common separators with spaces
    .replace(/[-_]/g, ' ')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, l => l.toUpperCase());

  // Add context if it's too short
  if (altText.length < 10) {
    altText = `Produs ${altText}`;
  }

  // Add "imagine" or "foto" if not already present
  if (!/\b(imagine|foto|poza|imaginea)\b/i.test(altText)) {
    altText = `${altText} - Imagine produs`;
  }

  // Ensure it doesn't exceed reasonable length (Google recommends <125 chars)
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }

  return altText;
}

/**
 * Generate multiple alt text variations for different contexts
 */
export function generateImageAltTextVariations(productName: string): {
  primary: string;
  secondary: string;
  thumbnail: string;
  gallery: string;
} {
  const baseAlt = generateImageAltText(productName);

  return {
    primary: baseAlt,
    secondary: `${baseAlt} - Detalii`,
    thumbnail: `${productName} - Miniatură`,
    gallery: `${productName} - Galerie produse`
  };
}

/**
 * Validate alt text quality for SEO
 */
export function validateAltTextQuality(altText: string): {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check length
  if (altText.length < 10) {
    issues.push('Alt text prea scurt');
    score -= 30;
    suggestions.push('Adaugă mai multe detalii descriptive');
  } else if (altText.length > 125) {
    issues.push('Alt text prea lung');
    score -= 20;
    suggestions.push('Scurtează la maximum 125 caractere');
  }

  // Check for keywords
  if (!/\b(produs|imagine|foto)\b/i.test(altText)) {
    issues.push('Lipsește contextul de produs/imagine');
    score -= 20;
    suggestions.push('Adaugă cuvinte cheie relevante pentru produs');
  }

  // Check for generic text
  if (/\b(imagine|photo|picture)\b/i.test(altText) && altText.split(' ').length < 3) {
    issues.push('Alt text prea generic');
    score -= 25;
    suggestions.push('Specificați ce reprezintă imaginea exact');
  }

  // Check for special characters
  if (/[^\w\s\-]/.test(altText)) {
    issues.push('Caractere speciale nedorite');
    score -= 10;
    suggestions.push('Evitați caracterele speciale în alt text');
  }

  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    issues,
    suggestions
  };
}

/**
 * Hook for managing image SEO data
 */
export function useImageSEO(productName?: string, customAlt?: string) {
  const altText = React.useMemo(() => {
    if (customAlt) return customAlt;
    if (productName) return generateImageAltText(productName);
    return 'Imagine produs';
  }, [productName, customAlt]);

  const variations = React.useMemo(() => {
    if (productName) {
      return generateImageAltTextVariations(productName);
    }
    return {
      primary: 'Imagine produs',
      secondary: 'Imagine produs - Detalii',
      thumbnail: 'Imagine produs - Miniatură',
      gallery: 'Imagine produs - Galerie'
    };
  }, [productName]);

  const quality = React.useMemo(() => {
    return validateAltTextQuality(altText);
  }, [altText]);

  return {
    altText,
    variations,
    quality,
    isOptimized: quality.isValid
  };
}
