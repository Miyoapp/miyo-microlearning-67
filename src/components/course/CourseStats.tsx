
import { Podcast } from '../../types';
import { Star, Trophy, Target } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMinutesToHumanReadable } from '@/lib/formatters';

interface CourseStatsProps {
  podcast: Podcast;
  progressPercentage?: number;
  isCompleted?: boolean;
}

const CourseStats = ({ podcast, progressPercentage = 0, isCompleted = false }: CourseStatsProps) => {
  const totalLessons = podcast.lessonCount;
  const completedLessonsCount = Math.round((progressPercentage / 100) * totalLessons);
  
  return (
    <Card className="border-2 border-indigo-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#E5DEFF] to-[#D6BCFA] pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-900">Tu Progreso</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Course Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Progreso del curso</span>
            <span className="font-bold text-indigo-800">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-gray-200" />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {completedLessonsCount} de {totalLessons} lecciones completadas
          </div>
        </div>
        
        {/* Achievements */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-indigo-600" />
            <span className="font-bold text-gray-800">Logros</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className={`flex flex-col items-center p-2 rounded-lg ${completedLessonsCount > 0 ? 'bg-green-50 border border-green-100' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
              <Star size={24} className={completedLessonsCount > 0 ? 'text-yellow-500' : 'text-gray-400'} />
              <span className="text-xs mt-1 text-center">Primera Lección</span>
            </div>
            
            <div className={`flex flex-col items-center p-2 rounded-lg ${progressPercentage >= 50 ? 'bg-purple-50 border border-purple-100' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
              <Target size={24} className={progressPercentage >= 50 ? 'text-purple-500' : 'text-gray-400'} />
              <span className="text-xs mt-1 text-center">Mitad del Camino</span>
            </div>
            
            <div className={`flex flex-col items-center p-2 rounded-lg ${isCompleted ? 'bg-blue-50 border border-blue-100' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
              <Trophy size={24} className={isCompleted ? 'text-blue-500' : 'text-gray-400'} />
              <span className="text-xs mt-1 text-center">¡Completado!</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Course Info */}
        <div className="text-sm text-gray-600">
          <div className="flex justify-between py-1">
            <span>Categoría</span>
            <span className="font-medium text-gray-800">{podcast.category.nombre}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Duración total</span>
            <span className="font-medium text-gray-800">{formatMinutesToHumanReadable(podcast.duration)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseStats;
