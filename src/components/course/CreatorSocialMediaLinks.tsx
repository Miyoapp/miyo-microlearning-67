import { CreatorSocialMedia } from '@/types';
import { 
  Globe, 
  Video, 
  Code,
  ExternalLink,
  Twitter
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Custom Facebook icon component with blue circular background
const FacebookIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
  >
    <circle cx="12" cy="12" r="11" fill="#1877F2" />
    <path 
      d="M16.6,14.4 L17.2,10.2 L13.2,10.2 L13.2,7.8 C13.2,6.74 13.72,5.7 15.4,5.7 L17.4,5.7 L17.4,2.1 C17.4,2.1 15.88,1.8 14.4,1.8 C11.4,1.8 9.4,3.7 9.4,7.3 L9.4,10.2 L5.8,10.2 L5.8,14.4 L9.4,14.4 L9.4,24 C10.16,24.1 10.94,24.1 11.7,24.1 C12.46,24.1 13.24,24.1 14,24 L14,14.4 L16.6,14.4 Z" 
      fill="white" 
    />
  </svg>
);

// Instagram icon with proper gradient fill and icon display
const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
  >
    <rect width="24" height="24" rx="12" fill="url(#instagram-gradient)" />
    <path d="M12 7.5C10.9 7.5 10.5 7.5 9.7 7.5C8.9 7.5 8.5 7.6 8.1 7.8C7.7 8 7.4 8.2 7.1 8.5C6.8 8.8 6.6 9.1 6.5 9.5C6.3 9.9 6.2 10.3 6.2 11.1C6.2 11.9 6.2 12.3 6.2 13.4C6.2 14.5 6.2 14.9 6.2 15.7C6.2 16.5 6.3 16.9 6.5 17.3C6.7 17.7 6.9 18 7.2 18.3C7.5 18.6 7.8 18.8 8.2 18.9C8.6 19.1 9 19.2 9.8 19.2C10.6 19.2 11 19.2 12.1 19.2C13.2 19.2 13.6 19.2 14.4 19.2C15.2 19.2 15.6 19.1 16 18.9C16.4 18.7 16.7 18.5 17 18.2C17.3 17.9 17.5 17.6 17.6 17.2C17.8 16.8 17.9 16.4 17.9 15.6C17.9 14.8 17.9 14.4 17.9 13.3C17.9 12.2 17.9 11.8 17.9 11C17.9 10.2 17.8 9.8 17.6 9.4C17.4 9 17.2 8.7 16.9 8.4C16.6 8.1 16.3 7.9 15.9 7.8C15.5 7.6 15.1 7.5 14.3 7.5C13.5 7.5 13.1 7.5 12 7.5ZM12 6C13.1 6 13.5 6 14.3 6C15.1 6 15.7 6.1 16.2 6.3C16.7 6.5 17.2 6.8 17.7 7.3C18.2 7.8 18.5 8.3 18.7 8.8C18.9 9.3 19 9.9 19 10.7C19 11.5 19 11.9 19 13C19 14.1 19 14.5 19 15.3C19 16.1 18.9 16.7 18.7 17.2C18.5 17.7 18.2 18.2 17.7 18.7C17.2 19.2 16.7 19.5 16.2 19.7C15.7 19.9 15.1 20 14.3 20C13.5 20 13.1 20 12 20C10.9 20 10.5 20 9.7 20C8.9 20 8.3 19.9 7.8 19.7C7.3 19.5 6.8 19.2 6.3 18.7C5.8 18.2 5.5 17.7 5.3 17.2C5.1 16.7 5 16.1 5 15.3C5 14.5 5 14.1 5 13C5 11.9 5 11.5 5 10.7C5 9.9 5.1 9.3 5.3 8.8C5.5 8.3 5.8 7.8 6.3 7.3C6.8 6.8 7.3 6.5 7.8 6.3C8.3 6.1 8.9 6 9.7 6C10.5 6 10.9 6 12 6Z" fill="white"/>
    <path d="M12 15.25C10.25 15.25 8.8 13.8 8.8 12.05C8.8 10.3 10.25 8.85 12 8.85C13.75 8.85 15.2 10.3 15.2 12.05C15.2 13.8 13.75 15.25 12 15.25ZM12 13.75C12.95 13.75 13.7 13 13.7 12.05C13.7 11.1 12.95 10.35 12 10.35C11.05 10.35 10.3 11.1 10.3 12.05C10.3 13 11.05 13.75 12 13.75Z" fill="white"/>
    <circle cx="15.4" cy="8.69995" r="0.75" fill="white"/>
    <defs>
      <radialGradient id="instagram-gradient" cx="6" cy="18" r="20" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFDD55"/>
        <stop offset="0.1" stopColor="#FFDD55"/>
        <stop offset="0.5" stopColor="#FF543E"/>
        <stop offset="0.7" stopColor="#C837AB"/>
        <stop offset="1" stopColor="#4168C9"/>
      </radialGradient>
    </defs>
  </svg>
);

// Custom LinkedIn icon component with blue background
const LinkedInIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
  >
    <circle cx="12" cy="12" r="11" fill="#0077B5" />
    <path 
      d="M8,18 L5,18 L5,9.5 L8,9.5 L8,18 Z M6.5,8 C5.55,8 4.8,7.25 4.8,6.3 C4.8,5.35 5.55,4.6 6.5,4.6 C7.45,4.6 8.2,5.35 8.2,6.3 C8.2,7.25 7.45,8 6.5,8 Z M20,18 L17,18 L17,13.85 C17,12.5 16.5,11.65 15.3,11.65 C14.35,11.65 13.85,12.25 13.6,12.8 C13.5,13 13.5,13.3 13.5,13.6 L13.5,18 L10.5,18 L10.5,9.5 L13.5,9.5 L13.5,10.75 C13.95,10.1 14.8,9.2 16.45,9.2 C18.55,9.2 19.95,10.55 19.95,13.5 L20,18 Z" 
      fill="white" 
    />
  </svg>
);

// Custom Twitter icon component with blue background
const TwitterIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
  >
    <circle cx="12" cy="12" r="11" fill="#1DA1F2" />
    <path 
      d="M19.2,7.9 C18.7,8.1 18.1,8.3 17.5,8.4 C18.1,8 18.6,7.4 18.8,6.6 C18.2,7 17.6,7.2 16.9,7.4 C16.3,6.8 15.5,6.4 14.6,6.4 C12.9,6.4 11.5,7.8 11.5,9.5 C11.5,9.7 11.5,10 11.6,10.2 C9.1,10.1 6.8,8.8 5.3,6.9 C5,7.4 4.9,7.9 4.9,8.5 C4.9,9.6 5.4,10.5 6.3,11 C5.8,11 5.3,10.9 4.9,10.6 C4.9,10.6 4.9,10.6 4.9,10.7 C4.9,12.2 6,13.3 7.3,13.6 C7.1,13.7 6.8,13.7 6.5,13.7 C6.3,13.7 6.1,13.7 5.9,13.6 C6.3,14.7 7.3,15.6 8.6,15.6 C7.6,16.4 6.4,16.8 5,16.8 C4.8,16.8 4.5,16.8 4.3,16.7 C5.6,17.6 7.1,18.1 8.7,18.1 C14.6,18.1 17.8,13.2 17.8,9 C17.8,8.9 17.8,8.7 17.8,8.6 C18.4,8.2 19,7.6 19.5,7 L19.2,7.9 Z" 
      fill="white" 
    />
  </svg>
);

interface CreatorSocialMediaLinksProps {
  socialMedia?: CreatorSocialMedia[];
  className?: string;
}

const CreatorSocialMediaLinks = ({ socialMedia, className = "" }: CreatorSocialMediaLinksProps) => {
  if (!socialMedia || socialMedia.length === 0) {
    return null;
  }

  // Map platforms to their respective icons
  const getPlatformIcon = (platform: string) => {
    const iconSize = 20;
    const iconClassName = "transition-transform hover:scale-110";
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <FacebookIcon size={iconSize} className={iconClassName} />;
      case 'instagram':
        return <InstagramIcon size={iconSize} className={iconClassName} />;
      case 'linkedin':
        return <LinkedInIcon size={iconSize} className={iconClassName} />;
      case 'twitter':
        return <TwitterIcon size={iconSize} className={iconClassName} />;
      case 'youtube':
        return <Video size={16} className="text-[#FF0000] hover:text-[#FF0000]/80 transition-colors" />;
      case 'github':
        return <Code size={16} className="text-gray-800 hover:text-gray-600 transition-colors" />;
      case 'website':
        return <Globe size={16} className="text-blue-500 hover:text-blue-400 transition-colors" />;
      default:
        return <ExternalLink size={16} className="text-gray-500 hover:text-miyo-600 transition-colors" />;
    }
  };

  const handleSocialClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <TooltipProvider>
      <div className={`flex gap-2 mt-2 ${className}`}>
        {socialMedia.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button 
                onClick={(e) => handleSocialClick(item.url, e)}
                className="p-1.5 transition-colors hover:bg-gray-100 rounded-md"
                aria-label={`${item.platform} link`}
                type="button"
              >
                {getPlatformIcon(item.platform)}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.platform}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default CreatorSocialMediaLinks;
