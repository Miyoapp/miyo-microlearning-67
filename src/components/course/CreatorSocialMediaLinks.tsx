
import { CreatorSocialMedia } from '@/types';
import { Facebook, Twitter, Linkedin, Globe, Youtube, Github, ExternalLink, Instagram } from 'lucide-react';
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
        return <Instagram {...iconProps} />;
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
