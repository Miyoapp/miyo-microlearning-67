
import { useMemo } from 'react';
import { EnrichedNote, NoteStats } from '@/types/notes';

export function useNoteStats(notes: EnrichedNote[]): NoteStats {
  return useMemo(() => {
    const totalNotes = notes.length;
    const coursesWithNotes = new Set(notes.map(note => note.course_id)).size;
    const favoriteNotes = notes.filter(note => note.is_favorite).length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentNotes = notes.filter(note => new Date(note.created_at) >= oneWeekAgo).length;

    return {
      totalNotes,
      coursesWithNotes,
      favoriteNotes,
      recentNotes
    };
  }, [notes]);
}
