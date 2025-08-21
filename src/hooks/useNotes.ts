
import { useCallback } from 'react';
import { useNotesContext } from '@/contexts/NotesContext';
import { LessonNote } from '@/types/notes';

export function useNotes(lessonId?: string, courseId?: string) {
  let context;
  
  try {
    context = useNotesContext();
  } catch (error) {
    console.warn('useNotes called outside of NotesProvider context. Notes functionality will be disabled.');
    // Return safe defaults when context is not available
    return {
      notes: [],
      loading: false,
      fetchNotes: () => {},
      addNote: async () => undefined,
      updateNote: async () => {},
      toggleFavorite: async () => {},
      deleteNote: async () => {}
    };
  }

  const { state, addNote, updateNote, toggleFavorite, deleteNote } = context;

  // Filter notes for the specific lesson if lessonId and courseId are provided
  const notes = lessonId && courseId 
    ? state.coursesWithNotes
        .find(course => course.courseId === courseId)?.notes
        .filter(note => note.lesson_id === lessonId) || []
    : [];

  const handleAddNote = useCallback(async (noteText: string, timestampSeconds: number, tags: string[] = []) => {
    if (!lessonId || !courseId) return;
    return await addNote(courseId, lessonId, noteText, timestampSeconds, tags);
  }, [addNote, lessonId, courseId]);

  const handleToggleFavorite = useCallback(async (noteId: string, isFavorite: boolean) => {
    await toggleFavorite(noteId, isFavorite);
  }, [toggleFavorite]);

  return {
    notes,
    loading: state.loading,
    fetchNotes: () => {}, // No longer needed as context handles fetching
    addNote: handleAddNote,
    updateNote,
    toggleFavorite: handleToggleFavorite,
    deleteNote
  };
}
