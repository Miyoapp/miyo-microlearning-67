
import { useMemo } from 'react';
import { CourseWithNotes, NotesStats } from '@/types/notes';

export function useNotesStats(coursesWithNotes: CourseWithNotes[]): NotesStats {
  return useMemo(() => {
    const totalNotes = coursesWithNotes.reduce((sum, course) => sum + course.notesCount, 0);
    const coursesWithNotesCount = coursesWithNotes.length;
    
    const favoriteNotes = coursesWithNotes.reduce((sum, course) => 
      sum + course.notes.filter(note => note.is_favorite).length, 0
    );
    
    // Notas de los últimos 7 días
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentNotesCount = coursesWithNotes.reduce((sum, course) => 
      sum + course.notes.filter(note => new Date(note.created_at) > weekAgo).length, 0
    );

    return {
      totalNotes,
      coursesWithNotes: coursesWithNotesCount,
      favoriteNotes,
      recentNotesCount
    };
  }, [coursesWithNotes]);
}
