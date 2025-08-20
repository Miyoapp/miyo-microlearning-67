
import { useMemo } from 'react';
import { EnrichedNote } from '@/types/notes';

export function useNoteStats(notes: EnrichedNote[]) {
  return useMemo(() => {
    const totalNotes = notes.length;
    const favoriteNotes = notes.filter(note => note.is_favorite).length;
    const coursesWithNotes = new Set(notes.map(note => note.course_id)).size;
    const recentNotes = notes.filter(note => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(note.created_at) >= oneWeekAgo;
    }).length;

    return {
      totalNotes,
      favoriteNotes,
      coursesWithNotes,
      recentNotes
    };
  }, [notes]);
}
