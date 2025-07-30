
import { useEffect } from 'react';
import { useMetaTags } from '@/hooks/useMetaTags';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({ title, description, image, url }) => {
  const { updateMetaTags, resetMetaTags } = useMetaTags();

  useEffect(() => {
    // Default fallback image
    const fallbackImage = 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753909736/Recurso_1_q4pjk3.png';
    
    // Update meta tags with provided props
    updateMetaTags({
      title,
      description,
      image: image || fallbackImage,
      url: url || window.location.href
    });

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
  }, [title, description, image, url, updateMetaTags, resetMetaTags]);

  // This component doesn't render anything visible
  return null;
};

export default MetaTags;
