
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Podcast } from "@/types";
import { formatMinutesToHumanReadable } from "@/lib/formatters";
import PremiumBadge from "@/components/PremiumBadge";

interface CompanyCourseCardProps {
  podcast: Podcast;
}

const CompanyCourseCard = ({ podcast }: CompanyCourseCardProps) => {
  return (
    <Link to={`/company/course/${podcast.id}`} className="block h-full">
      <Card className="overflow-hidden transition-all duration-300 h-full hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={podcast.imageUrl} 
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
          {podcast.tipo_curso === 'pago' && (
            <PremiumBadge />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2 text-white">
              <Clock size={14} />
              <span className="text-xs">{formatMinutesToHumanReadable(podcast.duration)}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-miyo-100 text-miyo-800">
              {podcast.category.nombre}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold line-clamp-2 mb-2">{podcast.title}</h3>
          
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{podcast.description}</p>
          
          <div className="flex items-center">
            <img 
              src={podcast.creator.imageUrl} 
              alt={podcast.creator.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-xs text-gray-600">{podcast.creator.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CompanyCourseCard;
