import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { LessonNote, CourseWithNotes } from '@/types/notes';

const notesQueryKeys = {
  all: ['notes'] as const,
  user: (userId: string) => [...notesQueryKeys.all, 'user', userId] as const,
};

export function useAllNotesOptimized() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: coursesWithNotes = [],
    isLoading: loading,
    refetch: fetchAllNotes
  } = useQuery({
    queryKey: notesQueryKeys.user(user?.id || ''),
    queryFn: async (): Promise<CourseWithNotes[]> => {
      if (!user) return [];

      console.log('🔍 NOTAS: Fetching notes for user (multi-query approach):', user.id);
      
      try {
        // Step 1: Get all notes for the user
        const { data: notesData, error: notesError } = await supabase
          .from('lesson_notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (notesError) {
          console.error('❌ NOTAS: Error fetching notes:', notesError);
          throw notesError;
        }

        if (!notesData || notesData.length === 0) {
          console.log('📝 NOTAS: No notes found for user');
          return [];
        }

        console.log('📝 NOTAS: Found', notesData.length, 'notes');

        // Step 2: Extract unique IDs
        const courseIds = [...new Set(notesData.map(note => note.course_id))];
        const lessonIds = [...new Set(notesData.map(note => note.lesson_id))];

        // Step 3: Fetch courses data
        const { data: coursesData, error: coursesError } = await supabase
          .from('cursos')
          .select('id, titulo, categoria_id')
          .in('id', courseIds);

        if (coursesError) {
          console.error('❌ NOTAS: Error fetching courses:', coursesError);
        }

        // Step 4: Extract category IDs and fetch categories
        const categoryIds = [...new Set(coursesData?.map(course => course.categoria_id).filter(Boolean) || [])];
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categorias')
          .select('id, nombre')
          .in('id', categoryIds);

        if (categoriesError) {
          console.error('❌ NOTAS: Error fetching categories:', categoriesError);
        }

        // Step 5: Fetch lessons data for titles
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lecciones')
          .select('id, titulo')
          .in('id', lessonIds);

        if (lessonsError) {
          console.error('❌ NOTAS: Error fetching lessons:', lessonsError);
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

        console.log('✅ NOTAS: Successfully grouped notes into', courseNotesMap.size, 'courses');
        return Array.from(courseNotesMap.values());

      } catch (error) {
        console.error('❌ NOTAS: Error in multi-query fetch:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes for notes (more dynamic)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ courseId, lessonId, noteText, timestampSeconds, tags = [] }: {
      courseId: string;
      lessonId: string;
      noteText: string;
      timestampSeconds: number;
      tags?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('lesson_notes')
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
      
      return {
        ...data,
        lesson_title: lessonData?.titulo || 'Lección sin título'
      } as LessonNote;
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.user(user?.id || '') });
      toast.success('Nota guardada exitosamente');
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error('Error al guardar la nota');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: {
      noteId: string;
      updates: Partial<Pick<LessonNote, 'note_text' | 'tags' | 'is_favorite'>>;
    }) => {
      const { data, error } = await supabase
        .from('lesson_notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return { noteId, updates: data as LessonNote };
    },
    onMutate: async ({ noteId, updates }) => {
      // Optimistic update for favorites
      if ('is_favorite' in updates) {
        await queryClient.cancelQueries({ queryKey: notesQueryKeys.user(user?.id || '') });
        
        const previousData = queryClient.getQueryData<CourseWithNotes[]>(
          notesQueryKeys.user(user?.id || '')
        );

        queryClient.setQueryData<CourseWithNotes[]>(
          notesQueryKeys.user(user?.id || ''),
          (old = []) => old.map(course => ({
            ...course,
            notes: course.notes.map(note =>
              note.id === noteId ? { ...note, is_favorite: updates.is_favorite! } : note
            )
          }))
        );

        return { previousData };
      }
    },
    onSuccess: ({ updates }) => {
      if (!('is_favorite' in updates)) {
        queryClient.invalidateQueries({ queryKey: notesQueryKeys.user(user?.id || '') });
      }
      toast.success('Nota actualizada');
    },
    onError: (error, { noteId, updates }, context) => {
      console.error('Error updating note:', error);
      toast.error('Error al actualizar la nota');
      
      // Revert optimistic update for favorites
      if ('is_favorite' in updates && context?.previousData) {
        queryClient.setQueryData(
          notesQueryKeys.user(user?.id || ''),
          context.previousData
        );
      }
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id);

      if (error) throw error;
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.user(user?.id || '') });
      toast.success('Nota eliminada');
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast.error('Error al eliminar la nota');
    },
  });

  // Helper functions
  const addNote = async (courseId: string, lessonId: string, noteText: string, timestampSeconds: number, tags?: string[]) => {
    return addNoteMutation.mutateAsync({ courseId, lessonId, noteText, timestampSeconds, tags });
  };

  const updateNote = async (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'tags' | 'is_favorite'>>) => {
    return updateNoteMutation.mutateAsync({ noteId, updates });
  };

  const toggleFavorite = async (noteId: string, currentState: boolean) => {
    return updateNoteMutation.mutateAsync({ noteId, updates: { is_favorite: !currentState } });
  };

  const deleteNote = async (noteId: string) => {
    return deleteNoteMutation.mutateAsync(noteId);
  };

  return {
    coursesWithNotes,
    loading,
    fetchAllNotes,
    addNote,
    updateNote,
    toggleFavorite,
    deleteNote
  };
}