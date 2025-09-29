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

      console.log('🔍 NOTAS: Fetching notes for user:', user.id);
      
      // Single optimized query with more tolerant JOINs
      const { data: notesData, error } = await supabase
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

      console.log('📝 NOTAS: Query result:', { 
        notesCount: notesData?.length || 0, 
        error: error?.message 
      });

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }

      // Group notes by course efficiently
      const courseMap = new Map<string, CourseWithNotes>();
      
      (notesData || []).forEach(noteRaw => {
        const note = noteRaw as any;
        
        if (!note.lecciones?.modulos?.cursos) return;
        
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
          lesson_title: note.lecciones?.titulo,
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
      });

      return Array.from(courseMap.values());
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
        .select(`
          *,
          lecciones (
            titulo
          )
        `)
        .single();

      if (error) throw error;
      
      const rawNote = data as any;
      return {
        ...rawNote,
        lesson_title: rawNote.lecciones?.titulo
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