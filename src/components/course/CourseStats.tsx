
import { Podcast } from '../../types';
import { Star, Flame, Zap, Trophy, Target } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMinutesToHumanReadable } from '@/lib/formatters';

interface CourseStatsProps {
  podcast: Podcast;
}

const CourseStats = ({ podcast }: CourseStatsProps) => {
  const completedLessons = podcast.lessons.filter(l => l.isCompleted).length;
  const percentComplete = Math.round((completedLessons / podcast.lessonCount) * 100);
  const streakDays = 3; // Placeholder, should come from user data in a real app
  
  // Calculate XP based on actual minutes listened
  const totalMinutesListened = podcast.lessons
    .filter(l => l.isCompleted)
    .reduce((total, lesson) => total + lesson.duration, 0);
    
  // Add partial progress for the current lesson that's not complete
  const currentLessonProgress = podcast.lessons
    .find(l => !l.isCompleted && !l.isLocked)?.duration * 0.5 || 0;
  
  // Calculate XP (10 XP per minute listened)
  const xpPoints = Math.round((totalMinutesListened + currentLessonProgress) * 10);
  
  return (
    <Card className="border-2 border-indigo-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#E5DEFF] to-[#D6BCFA] pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-900">Tu Progreso</span>
          <Badge variant="outline" className="bg-white font-semibold text-indigo-700 border-indigo-200">
            Nivel {Math.floor(xpPoints / 500) + 1}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* XP and Streak Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex flex-col items-center">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Flame size={18} className="text-amber-500" />
              <span className="font-bold">Racha</span>
            </div>
            <span className="text-2xl font-bold text-amber-700">{streakDays} días</span>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 flex flex-col items-center">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Zap size={18} className="text-indigo-500" />
              <span className="font-bold">XP</span>
            </div>
            <span className="text-2xl font-bold text-indigo-700">{xpPoints}</span>
            <span className="text-xs text-indigo-500">{totalMinutesListened} min escuchados</span>
          </div>
        </div>
        
        {/* Course Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Progreso del curso</span>
            <span className="font-bold text-indigo-800">{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} className="h-3 bg-gray-200" />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {completedLessons} de {podcast.lessonCount} lecciones completadas
          </div>
        </div>
        
        {/* Achievements */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-indigo-600" />
            <span className="font-bold text-gray-800">Logros</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className={`flex flex-col items-center p-2 rounded-lg ${completedLessons > 0 ? 'bg-green-50 border border-green-100' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
              <Star size={24} className={completedLessons > 0 ? 'text-yellow-500' : 'text-gray-400'} />
              <span className="text-xs mt-1 text-center">Primera Lección</span>
            </div>
            
            <div className={`flex flex-col items-center p-2 rounded-lg ${percentComplete >= 50 ? 'bg-purple-50 border border-purple-100' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
              <Target size={24} className={percentComplete >= 50 ? 'text-purple-500' : 'text-gray-400'} />
              <span className="text-xs mt-1 text-center">Mitad del Camino</span>
            </div>
            
            <div className={`flex flex-col items-center p-2 rounded-lg ${percentComplete === 100 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
              <Trophy size={24} className={percentComplete === 100 ? 'text-blue-500' : 'text-gray-400'} />
              <span className="text-xs mt-1 text-center">¡Completado!</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Course Info */}
        <div className="text-sm text-gray-600">
          <div className="flex justify-between py-1">
            <span>Categoría</span>
            <span className="font-medium text-gray-800">{podcast.category}</span>
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
