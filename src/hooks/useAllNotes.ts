
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { CourseWithNotes, LessonNote } from '@/types/notes';

export function useAllNotes() {
  const [coursesWithNotes, setCoursesWithNotes] = useState<CourseWithNotes[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAllNotes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Obtener todas las notas del usuario con información del curso
      const { data: notesData, error: notesError } = await supabase
        .from('lesson_notes' as any)
        .select(`
          *,
          lecciones!inner(
            titulo,
            modulos!inner(
              curso_id,
              cursos!inner(
                titulo,
                categorias!inner(
                  id,
                  nombre
                )
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Agrupar notas por curso
      const courseMap = new Map<string, CourseWithNotes>();
      
      if (notesData) {
        for (const noteRaw of notesData) {
          const note = noteRaw as any;
          const courseId = note.lecciones.modulos.curso_id;
          const courseTitle = note.lecciones.modulos.cursos.titulo;
          const categoryName = note.lecciones.modulos.cursos.categorias.nombre;
          const categoryId = note.lecciones.modulos.cursos.categorias.id;

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
            note_title: note.note_title,
            timestamp_seconds: note.timestamp_seconds,
            tags: note.tags || [],
            is_favorite: note.is_favorite || false,
            created_at: note.created_at,
            updated_at: note.updated_at
          } as LessonNote);
          
          courseWithNotes.notesCount++;
        }
      }

      setCoursesWithNotes(Array.from(courseMap.values()));
    } catch (error) {
      console.error('Error fetching all notes:', error);
      toast.error('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  return {
    coursesWithNotes,
    loading,
    refetch: fetchAllNotes
  };
}
