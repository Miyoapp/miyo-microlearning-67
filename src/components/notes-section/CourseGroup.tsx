
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, Heart } from 'lucide-react';
import { CourseWithNotes, NOTE_TAGS } from '@/types/notes';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CourseGroupProps {
  course: CourseWithNotes;
}

const CourseGroup: React.FC<CourseGroupProps> = ({ course }) => {
  const navigate = useNavigate();
  
  const favoriteCount = course.notes.filter(note => note.is_favorite).length;
  const uniqueTags = [...new Set(course.notes.flatMap(note => note.tags))];
  
  const handleClick = () => {
    navigate(`/dashboard/mis-notas/curso/${course.courseId}`);
  };

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer border hover:border-blue-200"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-gray-900">{course.courseTitle}</h3>
              <Badge variant="secondary" className="text-xs">
                {course.notesCount} {course.notesCount === 1 ? 'nota' : 'notas'}
              </Badge>
              {favoriteCount > 0 && (
                <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  {favoriteCount}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  Última nota {formatDistanceToNow(new Date(course.lastNoteDate), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {uniqueTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {uniqueTags.slice(0, 3).map((tagId) => {
                  const tag = NOTE_TAGS.find(t => t.id === tagId);
                  return tag ? (
                    <Badge 
                      key={tagId} 
                      variant="outline" 
                      className={`text-xs ${tag.color}`}
                    >
                      {tag.icon} {tag.name}
                    </Badge>
                  ) : null;
                })}
                {uniqueTags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{uniqueTags.length - 3} más
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseGroup;
