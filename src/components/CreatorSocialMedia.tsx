
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Globe, 
  Github, 
  Mail,
  ExternalLink
} from 'lucide-react';
import { CreatorSocialMedia } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreatorSocialMediaLinksProps {
  socialMedia: CreatorSocialMedia[];
}

const CreatorSocialMediaLinks = ({ socialMedia }: CreatorSocialMediaLinksProps) => {
  if (!socialMedia || socialMedia.length === 0) return null;

  // Function to get appropriate icon by platform
  const getIconByPlatform = (platform: string) => {
    const iconProps = { size: 18, className: "text-gray-600 hover:text-miyo-800 transition-colors" };
    
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
      case 'mail':
        return <Mail {...iconProps} />;
      case 'website':
        return <Globe {...iconProps} />;
      default:
        return <ExternalLink {...iconProps} />;
    }
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      {socialMedia.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`${item.platform}`}
                className="hover:scale-110 transition-transform"
              >
                {getIconByPlatform(item.platform)}
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.platform}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default CreatorSocialMediaLinks;
