
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Headphones } from 'lucide-react';

const PlaceholderCourseCard: React.FC = () => {
  return (
    <Card className="w-full h-full flex flex-col opacity-60">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex-1 flex flex-col h-full">
          {/* Placeholder image container */}
          <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg flex-shrink-0 bg-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-gray-400 text-white text-sm font-medium rounded-full mb-2">
                  Próximamente
                </div>
              </div>
            </div>
          </div>
          
          {/* Placeholder content area */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              
              {/* Placeholder creator info */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
              
              {/* Placeholder course stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>--</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Headphones className="w-4 h-4" />
                  <span>-- lecciones</span>
                </div>
              </div>
            </div>
            
            {/* Placeholder action button */}
            <div className="flex items-center justify-center gap-3 mt-auto pt-3 border-t border-gray-100">
              <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceholderCourseCard;
