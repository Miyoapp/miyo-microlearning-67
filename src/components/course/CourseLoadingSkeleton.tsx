
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseLoadingSkeletonProps {
  loadingMessage?: string;
}

const CourseLoadingSkeleton: React.FC<CourseLoadingSkeletonProps> = ({
  loadingMessage = 'Cargando curso...'
}) => {
  return (
    <div className="max-w-7xl mx-auto pb-20 sm:pb-24">
      <div className="p-4 sm:p-0">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {/* Course info skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-48 w-full sm:w-48 rounded-lg" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
              
              {/* Learning path skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <div className="text-sm text-gray-500">
          {loadingMessage}
        </div>
      </div>
    </div>
  );
};

export default CourseLoadingSkeleton;
