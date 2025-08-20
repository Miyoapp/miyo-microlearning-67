
import React from 'react';
import { useAllNotes } from '@/hooks/useAllNotes';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import CourseNotesHeader from './CourseNotesHeader';
import LessonNotesGroup from './LessonNotesGroup';

interface CourseNotesSectionProps {
  courseId: string;
}

const CourseNotesSection = ({ courseId }: CourseNotesSectionProps) => {
  const { coursesWithNotes, loading } = useAllNotes();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const course = coursesWithNotes.find(c => c.courseId === courseId);

  if (!course) {
    return (
      <div className="space-y-6">
        <Link 
          to="/dashboard/mis-notas" 
          className="inline-flex items-center text-[#5e16ea] hover:text-[#4a11ba] transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver a Mis Notas
        </Link>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Curso no encontrado</h3>
          <p className="text-gray-600">
            No se encontraron notas para este curso
          </p>
        </div>
      </div>
    );
  }

  // Group notes by lesson
  const notesByLesson = course.notes.reduce((acc, note) => {
    if (!acc[note.lesson_id]) {
      acc[note.lesson_id] = [];
    }
    acc[note.lesson_id].push(note);
    return acc;
  }, {} as Record<string, typeof course.notes>);

  return (
    <div className="space-y-6">
      <CourseNotesHeader course={course} />
      
      {Object.keys(notesByLesson).length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600">No hay notas para este curso</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(notesByLesson).map(([lessonId, lessonNotes]) => (
            <LessonNotesGroup
              key={lessonId}
              lessonId={lessonId}
              notes={lessonNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseNotesSection;
