
import { CreatorSocialMedia } from '@/types';
import { Facebook, Twitter, Linkedin, Globe, Youtube, Github, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Custom Instagram icon component that matches Lucide style
const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface CreatorSocialMediaLinksProps {
  socialMedia?: CreatorSocialMedia[];
}

const CreatorSocialMediaLinks = ({ socialMedia }: CreatorSocialMediaLinksProps) => {
  if (!socialMedia || socialMedia.length === 0) {
    return null;
  }

  // Map platforms to their respective icons
  const getPlatformIcon = (platform: string) => {
    const iconProps = { size: 16, className: "text-gray-500 hover:text-miyo-600 transition-colors" };
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook {...iconProps} />;
      case 'instagram':
        return <InstagramIcon {...iconProps} />;
      case 'twitter':
        return <Twitter {...iconProps} />;
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      case 'github':
        return <Github {...iconProps} />;
      case 'website':
        return <Globe {...iconProps} />;
      default:
        return <ExternalLink {...iconProps} />;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex gap-2 mt-2">
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
