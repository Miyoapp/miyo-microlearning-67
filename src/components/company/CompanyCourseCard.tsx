
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
      <Card className="overflow-hidden transition-all duration-300 w-full h-full hover:shadow-lg hover:-translate-y-1 flex flex-col group">
        <div className="aspect-[4/3] relative overflow-hidden flex-shrink-0">
          <img 
            src={podcast.imageUrl} 
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {podcast.tipo_curso === 'pago' && (
            <PremiumBadge />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
            <div className="flex items-center gap-2 text-white">
              <Clock size={14} />
              <span className="text-xs">{formatMinutesToHumanReadable(podcast.duration)}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-h-0">
          <div className="flex-1">
            <div className="mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-miyo-100 text-miyo-800">
                {podcast.category.nombre}
              </span>
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold mb-3 line-clamp-2 leading-tight">
              {podcast.title}
            </h3>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{podcast.description}</p>
          </div>
          
          <div className="flex items-center mt-auto pt-3 border-t border-gray-100">
            <img 
              src={podcast.creator.imageUrl} 
              alt={podcast.creator.name}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-2 flex-shrink-0"
            />
            <span className="text-sm text-gray-600 truncate">{podcast.creator.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CompanyCourseCard;
