import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { LessonNote, CourseWithNotes } from '@/types/notes';

interface NotesState {
  coursesWithNotes: CourseWithNotes[];
  loading: boolean;
  error: string | null;
}

type NotesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COURSES_WITH_NOTES'; payload: CourseWithNotes[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTE'; payload: { courseId: string; note: LessonNote } }
  | { type: 'UPDATE_NOTE'; payload: { noteId: string; updates: Partial<LessonNote> } }
  | { type: 'DELETE_NOTE'; payload: { noteId: string } }
  | { type: 'OPTIMISTIC_TOGGLE_FAVORITE'; payload: { noteId: string; isFavorite: boolean } };

const initialState: NotesState = {
  coursesWithNotes: [],
  loading: false,
  error: null,
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_COURSES_WITH_NOTES':
      return { ...state, coursesWithNotes: action.payload, loading: false, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'ADD_NOTE': {
      const { courseId, note } = action.payload;
      return {
        ...state,
        coursesWithNotes: state.coursesWithNotes.map(course =>
          course.courseId === courseId
            ? {
                ...course,
                notes: [...course.notes, note],
                notesCount: course.notesCount + 1,
                lastNoteDate: note.created_at
              }
            : course
        )
      };
    }
    
    case 'UPDATE_NOTE': {
      const { noteId, updates } = action.payload;
      return {
        ...state,
        coursesWithNotes: state.coursesWithNotes.map(course => ({
          ...course,
          notes: course.notes.map(note =>
            note.id === noteId ? { ...note, ...updates } : note
          )
        }))
      };
    }
    
    case 'DELETE_NOTE': {
      const { noteId } = action.payload;
      return {
        ...state,
        coursesWithNotes: state.coursesWithNotes.map(course => ({
          ...course,
          notes: course.notes.filter(note => note.id !== noteId),
          notesCount: course.notes.filter(note => note.id !== noteId).length
        })).filter(course => course.notesCount > 0)
      };
    }
    
    case 'OPTIMISTIC_TOGGLE_FAVORITE': {
      const { noteId, isFavorite } = action.payload;
      return {
        ...state,
        coursesWithNotes: state.coursesWithNotes.map(course => ({
          ...course,
          notes: course.notes.map(note =>
            note.id === noteId ? { ...note, is_favorite: isFavorite } : note
          )
        }))
      };
    }
    
    default:
      return state;
  }
}

interface NotesContextType {
  state: NotesState;
  fetchAllNotes: () => Promise<void>;
  addNote: (courseId: string, lessonId: string, noteText: string, timestampSeconds: number, tags?: string[]) => Promise<LessonNote | undefined>;
  updateNote: (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'tags' | 'is_favorite'>>) => Promise<void>;
  toggleFavorite: (noteId: string, currentState: boolean) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  const { user } = useAuth();

  const fetchAllNotes = useCallback(async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('lesson_notes')
        .select(`
          *,
          lecciones (
            titulo,
            modulos (
              curso_id,
              cursos (
                titulo,
                categorias (
                  id,
                  nombre
                )
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        throw notesError;
      }
      
      const courseMap = new Map<string, CourseWithNotes>();
      
      if (notesData) {
        for (const noteRaw of notesData) {
          const note = noteRaw as any;
          
          if (!note.lecciones?.modulos?.cursos) {
            continue;
          }
          
          const courseId = note.lecciones.modulos.curso_id;
          const courseTitle = note.lecciones.modulos.cursos.titulo;
          const categoryName = note.lecciones.modulos.cursos.categorias?.nombre || 'Sin categoría';
          const categoryId = note.lecciones.modulos.cursos.categorias?.id || 'no-category';

          if (!courseMap.has(courseId)) {
            courseMap.set(courseId, {
              courseId,
              courseTitle,
              categoryName,
              categoryId,
              notesCount: 0,
              lastNoteDate: note.created_at,
              notes: []
            });
          }

          const courseWithNotes = courseMap.get(courseId)!;
          courseWithNotes.notes.push({
            id: note.id,
            lesson_id: note.lesson_id,
            course_id: note.course_id,
            user_id: note.user_id,
            note_text: note.note_text,
            timestamp_seconds: note.timestamp_seconds,
            tags: note.tags || [],
            is_favorite: note.is_favorite || false,
            created_at: note.created_at,
            updated_at: note.updated_at
          } as LessonNote);
          
          courseWithNotes.notesCount++;
          
          if (new Date(note.created_at) > new Date(courseWithNotes.lastNoteDate)) {
            courseWithNotes.lastNoteDate = note.created_at;
          }
        }
      }

      dispatch({ type: 'SET_COURSES_WITH_NOTES', payload: Array.from(courseMap.values()) });
    } catch (error) {
      console.error('Error fetching all notes:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las notas' });
      toast.error('Error al cargar las notas');
    }
  }, [user]);

  const addNote = useCallback(async (courseId: string, lessonId: string, noteText: string, timestampSeconds: number, tags: string[] = []) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          note_text: noteText,
          timestamp_seconds: Math.floor(timestampSeconds),
          tags: tags,
          is_favorite: false
        })
        .select()
        .single();

      if (error) throw error;
      
      const newNote = data as unknown as LessonNote;
      dispatch({ type: 'ADD_NOTE', payload: { courseId, note: newNote } });
      toast.success('Nota guardada exitosamente');
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Error al guardar la nota');
    }
  }, [user]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'tags' | 'is_favorite'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedNote = data as unknown as LessonNote;
      dispatch({ type: 'UPDATE_NOTE', payload: { noteId, updates: updatedNote } });
      toast.success('Nota actualizada');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Error al actualizar la nota');
      // Revert optimistic update if it was a favorite toggle
      if ('is_favorite' in updates) {
        dispatch({ type: 'OPTIMISTIC_TOGGLE_FAVORITE', payload: { noteId, isFavorite: !updates.is_favorite! } });
      }
    }
  }, [user]);

  const toggleFavorite = useCallback(async (noteId: string, currentState: boolean) => {
    const newFavoriteState = !currentState;
    
    // Optimistic update
    dispatch({ type: 'OPTIMISTIC_TOGGLE_FAVORITE', payload: { noteId, isFavorite: newFavoriteState } });
    
    // Actual update
    await updateNote(noteId, { is_favorite: newFavoriteState });
  }, [updateNote]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_notes' as any)
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      dispatch({ type: 'DELETE_NOTE', payload: { noteId } });
      toast.success('Nota eliminada');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Error al eliminar la nota');
    }
  }, [user]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('lesson_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_notes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime note change:', payload);
          // Refetch notes to keep in sync with other tabs/devices
          fetchAllNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAllNotes]);

  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  return (
    <NotesContext.Provider 
      value={{
        state,
        fetchAllNotes,
        addNote,
        updateNote,
        toggleFavorite,
        deleteNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
}
