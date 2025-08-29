
import { useNotes } from './useNotes';
import { LessonNote } from '@/types/notes';

interface UseNotesConditionalResult {
  notes: LessonNote[];
  addNote: (noteText: string, timeInSeconds?: number) => Promise<void>;
  updateNote: (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'note_title' | 'tags' | 'is_favorite'>>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  fetchNotes: () => Promise<void>;
}

/**
 * Conditional wrapper for useNotes to avoid React hook rules violations
 */
export function useNotesConditional(
  lessonId: string | undefined,
  courseId: string | undefined
): UseNotesConditionalResult {
  // Always call useNotes, but with undefined values when conditions not met
  const notesHook = useNotes(lessonId, courseId);

  // If conditions not met, return empty/no-op functions
  if (!lessonId || !courseId) {
    return {
      notes: [],
      addNote: async () => {},
      updateNote: async () => {},
      deleteNote: async () => {},
      fetchNotes: async () => {}
    };
  }

  return {
    notes: notesHook.notes,
    addNote: notesHook.addNote,
    updateNote: notesHook.updateNote,
    deleteNote: notesHook.deleteNote,
    fetchNotes: async () => {
      notesHook.fetchNotes();
    }
  };
}
