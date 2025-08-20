
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CourseWithNotes } from '@/types/notes';
import CourseGroup from './CourseGroup';

interface CategoryGroupProps {
  categoryName: string;
  courses: CourseWithNotes[];
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ categoryName, courses }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalNotes = courses.reduce((sum, course) => sum + course.notesCount, 0);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-lg font-semibold">{categoryName}</span>
            <span className="text-sm text-gray-500">
              ({totalNotes} {totalNotes === 1 ? 'nota' : 'notas'})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseGroup key={course.courseId} course={course} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CategoryGroup;
