
import { CreatorSocialMedia } from '@/types';
import { Facebook, Twitter, Linkedin, Globe, Youtube, Github, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
        // Using a more reliable approach for Instagram icon
        return (
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500 hover:text-miyo-600 transition-colors"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="6" r="1.5" fill="currentColor" />
          </svg>
        );
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
