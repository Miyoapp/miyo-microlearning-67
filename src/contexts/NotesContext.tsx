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
      
      // Check if course already exists
      const existingCourseIndex = state.coursesWithNotes.findIndex(course => course.courseId === courseId);
      
      if (existingCourseIndex !== -1) {
        // Course exists, add note to existing course
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
      } else {
        // Course doesn't exist, create new course with the note
        const newCourse = {
          courseId: courseId,
          courseTitle: 'Curso', // Default title, will be updated by realtime sync
          categoryName: 'General', // Default category
          categoryId: '',
          notesCount: 1,
          lastNoteDate: note.created_at,
          notes: [note]
        };
        
        return {
          ...state,
          coursesWithNotes: [...state.coursesWithNotes, newCourse]
        };
      }
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
      console.log('🔍 CONTEXT: Fetching notes for user (multi-query approach):', user.id);
      
      // Step 1: Get all notes for the user
      const { data: notesData, error: notesError } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('❌ CONTEXT: Error fetching notes:', notesError);
        throw notesError;
      }

      if (!notesData || notesData.length === 0) {
        console.log('📝 CONTEXT: No notes found for user');
        dispatch({ type: 'SET_COURSES_WITH_NOTES', payload: [] });
        return;
      }

      console.log('📝 CONTEXT: Found', notesData.length, 'notes');

      // Step 2: Extract unique IDs
      const courseIds = [...new Set(notesData.map(note => note.course_id))];
      const lessonIds = [...new Set(notesData.map(note => note.lesson_id))];

      // Step 3: Fetch courses data
      const { data: coursesData, error: coursesError } = await supabase
        .from('cursos')
        .select('id, titulo, categoria_id')
        .in('id', courseIds);

      if (coursesError) {
        console.error('❌ CONTEXT: Error fetching courses:', coursesError);
      }

      // Step 4: Extract category IDs and fetch categories
      const categoryIds = [...new Set(coursesData?.map(course => course.categoria_id).filter(Boolean) || [])];
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categorias')
        .select('id, nombre')
        .in('id', categoryIds);

      if (categoriesError) {
        console.error('❌ CONTEXT: Error fetching categories:', categoriesError);
      }

      // Step 5: Fetch lessons data for titles
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lecciones')
        .select('id, titulo')
        .in('id', lessonIds);

      if (lessonsError) {
        console.error('❌ CONTEXT: Error fetching lessons:', lessonsError);
      }

      // Step 6: Create lookup maps
      const courseMap = new Map(coursesData?.map(course => [course.id, course]) || []);
      const categoryMap = new Map(categoriesData?.map(category => [category.id, category]) || []);
      const lessonMap = new Map(lessonsData?.map(lesson => [lesson.id, lesson]) || []);

      // Step 7: Group notes by course
      const courseNotesMap = new Map<string, CourseWithNotes>();
      
      notesData.forEach(noteRaw => {
        const courseId = noteRaw.course_id;
        const course = courseMap.get(courseId);
        const category = course ? categoryMap.get(course.categoria_id) : null;
        const lesson = lessonMap.get(noteRaw.lesson_id);

        if (!courseNotesMap.has(courseId)) {
          courseNotesMap.set(courseId, {
            courseId,
            courseTitle: course?.titulo || 'Curso sin título',
            categoryName: category?.nombre || 'Sin categoría',
            categoryId: category?.id || 'no-category',
            notesCount: 0,
            lastNoteDate: noteRaw.created_at,
            notes: []
          });
        }

        const courseWithNotes = courseNotesMap.get(courseId)!;
        courseWithNotes.notes.push({
          id: noteRaw.id,
          lesson_id: noteRaw.lesson_id,
          course_id: noteRaw.course_id,
          user_id: noteRaw.user_id,
          note_text: noteRaw.note_text,
          lesson_title: lesson?.titulo || 'Lección sin título',
          timestamp_seconds: noteRaw.timestamp_seconds,
          tags: noteRaw.tags || [],
          is_favorite: noteRaw.is_favorite || false,
          created_at: noteRaw.created_at,
          updated_at: noteRaw.updated_at
        } as LessonNote);
        
        courseWithNotes.notesCount++;
        
        if (new Date(noteRaw.created_at) > new Date(courseWithNotes.lastNoteDate)) {
          courseWithNotes.lastNoteDate = noteRaw.created_at;
        }
      });

      console.log('✅ CONTEXT: Successfully grouped notes into', courseNotesMap.size, 'courses');
      dispatch({ type: 'SET_COURSES_WITH_NOTES', payload: Array.from(courseNotesMap.values()) });
    } catch (error) {
      console.error('❌ CONTEXT: Error fetching all notes:', error);
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
        .select('*')
        .single();

      if (error) throw error;
      
      // Fetch lesson title separately
      const { data: lessonData } = await supabase
        .from('lecciones')
        .select('titulo')
        .eq('id', lessonId)
        .single();
      
      const newNote: LessonNote = {
        id: (data as any).id,
        lesson_id: (data as any).lesson_id,
        course_id: (data as any).course_id,
        user_id: (data as any).user_id,
        note_text: (data as any).note_text,
        timestamp_seconds: (data as any).timestamp_seconds,
        tags: (data as any).tags || [],
        is_favorite: (data as any).is_favorite || false,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
        lesson_title: lessonData?.titulo || 'Lección sin título'
      };
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
