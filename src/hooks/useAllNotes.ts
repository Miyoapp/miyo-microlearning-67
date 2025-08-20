
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
      // Usar consulta SQL cruda con JOINs explícitos para obtener notas con información del curso
      const { data: notesData, error: notesError } = await supabase
        .rpc('get_notes_with_course_info', { user_id_param: user.id });

      if (notesError) {
        console.error('Error from RPC:', notesError);
        
        // Fallback: usar consulta directa si RPC no existe
        const { data: fallbackData, error: fallbackError } = await supabase
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

        if (fallbackError) throw fallbackError;
        
        // Procesar datos del fallback
        const courseMap = new Map<string, CourseWithNotes>();
        
        if (fallbackData) {
          for (const noteRaw of fallbackData) {
            const note = noteRaw as any;
            
            // Verificar que tenemos todos los datos necesarios
            if (!note.lecciones?.modulos?.cursos) {
              console.warn('Nota sin información completa del curso:', note.id);
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
              note_title: note.note_title,
              timestamp_seconds: note.timestamp_seconds,
              tags: note.tags || [],
              is_favorite: note.is_favorite || false,
              created_at: note.created_at,
              updated_at: note.updated_at
            } as LessonNote);
            
            courseWithNotes.notesCount++;
            
            // Actualizar la fecha de la última nota si es más reciente
            if (new Date(note.created_at) > new Date(courseWithNotes.lastNoteDate)) {
              courseWithNotes.lastNoteDate = note.created_at;
            }
          }
        }

        setCoursesWithNotes(Array.from(courseMap.values()));
        return;
      }

      // Procesar datos del RPC si funciona
      const courseMap = new Map<string, CourseWithNotes>();
      
      if (notesData) {
        for (const note of notesData) {
          const courseId = note.course_id;
          const courseTitle = note.course_title;
          const categoryName = note.category_name || 'Sin categoría';
          const categoryId = note.category_id || 'no-category';

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
          
          // Actualizar la fecha de la última nota si es más reciente
          if (new Date(note.created_at) > new Date(courseWithNotes.lastNoteDate)) {
            courseWithNotes.lastNoteDate = note.created_at;
          }
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
