
import { useNotesContext } from '@/contexts/NotesContext';

export function useAllNotes() {
  const { state, fetchAllNotes } = useNotesContext();
  
  return {
    coursesWithNotes: state.coursesWithNotes,
    loading: state.loading,
    refetch: fetchAllNotes
  };
}
