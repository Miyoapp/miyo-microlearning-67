
import { CreatorSocialMedia } from '@/types';
import { 
  Globe, 
  Video, 
  Code,
  ExternalLink,
  Twitter,  // Added Twitter icon instead of Share2
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

// Custom Instagram icon component with gradient background
const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
  >
    <defs>
      <radialGradient id="instagramGradient" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#instagramGradient)" />
    <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="16.5" cy="7.5" r="1" fill="white" />
    <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="2" fill="none" />
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
        return <TwitterIcon size={iconSize} className={iconClassName} />; // Using our custom Twitter icon
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

  return (
    <TooltipProvider>
      <div className={`flex gap-2 mt-2 ${className}`}>
        {socialMedia.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 transition-colors"
                aria-label={`${item.platform} link`}
              >
                {getPlatformIcon(item.platform)}
              </a>
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
