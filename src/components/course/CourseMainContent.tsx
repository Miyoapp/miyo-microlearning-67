
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseHeader from './CourseHeader';
import CourseLearningPathSection from './CourseLearningPathSection';
import CourseSidebar from './CourseSidebar';
import PremiumOverlay from './PremiumOverlay';
import { Play, Clock, Headphones, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMinutesToHumanReadable } from '@/lib/formatters';

interface CourseMainContentProps {
  podcast: Podcast;
  currentLesson: Lesson | null;
  hasStarted: boolean;
  isSaved: boolean;
  progressPercentage: number;
  isCompleted: boolean;
  isPremium: boolean;
  hasAccess: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onShowCheckout: () => void;
}

const CourseMainContent: React.FC<CourseMainContentProps> = ({
  podcast,
  currentLesson,
  hasStarted,
  isSaved,
  progressPercentage,
  isCompleted,
  isPremium,
  hasAccess,
  onStartLearning,
  onToggleSave,
  onSelectLesson,
  onShowCheckout
}) => {
  // DIAGNÓSTICO: Log del estado de renderizado
  console.log('📋 COURSE MAIN CONTENT RENDER:', {
    timestamp: new Date().toISOString(),
    hasStarted,
    progressPercentage,
    isPremium,
    hasAccess,
    lessonCount: podcast.lessons?.length || 0,
    shouldShowCallToAction: !hasStarted,
    isValidToRender: !!podcast
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
      {/* Main Content - Full width on mobile */}
      <div className="lg:col-span-2">
        <CourseHeader
          podcast={podcast}
          hasStarted={hasStarted}
          isSaved={isSaved}
          progressPercentage={progressPercentage}
          onStartLearning={onStartLearning}
          onToggleSave={onToggleSave}
        />

        {/* Call to Action Section - Solo se muestra si no ha comenzado */}
        {!hasStarted && (
          <Card className="mx-4 sm:mx-0 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Comienza tu Aprendizaje!
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Este curso está diseñado para llevarte paso a paso. Haz clic en "Comenzar a Aprender" para iniciar tu primera lección.
                </p>
                
                {/* Course Quick Stats */}
                <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatMinutesToHumanReadable(podcast.duration)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    {podcast.lessonCount} lecciones
                  </Badge>
                  {isPremium && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Premium
                    </Badge>
                  )}
                </div>

                <Button 
                  onClick={onStartLearning}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Comenzar a Aprender
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative mx-4 sm:mx-0">
          <CourseLearningPathSection
            podcast={podcast}
            currentLessonId={currentLesson?.id || null}
            onSelectLesson={onSelectLesson}
          />
          
          {/* Premium overlay for learning path */}
          {isPremium && !hasAccess && (
            <PremiumOverlay
              onUnlock={onShowCheckout}
              price={podcast.precio || 0}
              currency={podcast.moneda || 'USD'}
            />
          )}
        </div>
      </div>

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <CourseSidebar 
          podcast={podcast}
          progressPercentage={progressPercentage}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
};

export default CourseMainContent;
