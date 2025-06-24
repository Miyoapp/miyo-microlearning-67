
import React from 'react';
import CourseStats from '@/components/course/CourseStats';
import { Podcast } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseSidebarProps {
  podcast: Podcast;
  progressPercentage?: number;
  isCompleted?: boolean;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ 
  podcast, 
  progressPercentage = 0,
  isCompleted = false 
}) => {
  // DIAGNÓSTICO: Log del estado del sidebar
  console.log('📊 COURSE SIDEBAR RENDER:', {
    timestamp: new Date().toISOString(),
    podcastId: podcast?.id,
    progressPercentage,
    isCompleted,
    hasValidPodcast: !!podcast,
    shouldAlwaysShow: true
  });

  return (
    <div className="space-y-6">
      {/* Progreso del Curso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                ¡Curso Completado!
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-blue-600" />
                Tu Progreso
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completado</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progressPercentage === 0 ? (
              <p className="text-sm text-gray-500">
                ¡Comienza tu primera lección para ver tu progreso!
              </p>
            ) : isCompleted ? (
              <p className="text-sm text-green-600">
                ¡Felicitaciones! Has completado todo el curso.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Continúa aprendiendo para completar el curso.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del Curso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sobre este Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Por {podcast.creator?.name || 'Instructor'}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {podcast.category?.nombre || 'General'}
              </Badge>
              {podcast.tipo_curso === 'pago' && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  Premium
                </Badge>
              )}
            </div>

            {podcast.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {podcast.description.length > 150 
                  ? `${podcast.description.substring(0, 150)}...` 
                  : podcast.description
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del Curso */}
      <CourseStats 
        podcast={podcast} 
        progressPercentage={progressPercentage}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default CourseSidebar;
