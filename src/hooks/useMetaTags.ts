
import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const useMetaTags = () => {
  const updateMetaTags = (tags: MetaTagsProps) => {
    // Update document title
    if (tags.title) {
      document.title = tags.title;
    }

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (isName) {
          metaTag.name = property;
        } else {
          metaTag.setAttribute('property', property);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.content = content;
    };

    // Update meta tags
    if (tags.description) {
      updateMetaTag('description', tags.description, true);
      updateMetaTag('og:description', tags.description);
      updateMetaTag('twitter:description', tags.description);
    }

    if (tags.title) {
      updateMetaTag('og:title', tags.title);
      updateMetaTag('twitter:title', tags.title);
    }

    if (tags.image) {
      updateMetaTag('og:image', tags.image);
      updateMetaTag('twitter:image', tags.image);
    }

    if (tags.url) {
      updateMetaTag('og:url', tags.url);
    }
  };

  const resetMetaTags = () => {
    // Reset to default values
    document.title = 'Miyo-microcursos en audio';
    
    const defaultTags = {
      title: 'Miyo - Microcursos en Audio',
      description: 'Descubre nuevas herramientas y perspectivas para crecer a través de cápsulas que inspiran y empoderan',
      image: 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753909736/Recurso_1_q4pjk3.png',
      url: window.location.origin
    };
    
    updateMetaTags(defaultTags);
  };

  return { updateMetaTags, resetMetaTags };
};
