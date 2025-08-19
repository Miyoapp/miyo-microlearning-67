
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { LessonNote } from '@/types/notes';

export function useNotes(lessonId?: string, courseId?: string) {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user || !lessonId || !courseId) {
      console.log('❌ NOTES: Missing required parameters', { user: !!user, lessonId, courseId });
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 NOTES: Fetching notes for lesson:', lessonId, 'course:', courseId, 'user:', user.id);
      
      // Use direct query to lesson_notes table
      const { data, error } = await (supabase as any)
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('course_id', courseId)
        .order('timestamp_seconds', { ascending: true });

      if (error) {
        console.error('❌ NOTES: Error fetching notes:', error);
        throw error;
      }
      
      console.log('✅ NOTES: Fetched notes successfully:', data?.length || 0, 'notes');
      setNotes((data || []) as LessonNote[]);
    } catch (error) {
      console.error('❌ NOTES: Error in fetchNotes:', error);
      toast.error('Error al cargar las notas');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [user, lessonId, courseId]);

  const addNote = useCallback(async (noteText: string, timestampSeconds: number) => {
    if (!user || !lessonId || !courseId) {
      console.error('❌ NOTES: Missing required parameters for addNote', { 
        user: !!user, 
        lessonId, 
        courseId, 
        noteText: noteText.slice(0, 50) + '...',
        timestampSeconds 
      });
      toast.error('Error: Faltan parámetros requeridos');
      return;
    }

    console.log('💾 NOTES: Adding note...', { 
      lessonId, 
      courseId, 
      userId: user.id, 
      timestampSeconds,
      noteLength: noteText.length 
    });

    try {
      const noteData = {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        note_text: noteText,
        timestamp_seconds: timestampSeconds
      };

      console.log('💾 NOTES: Inserting note data:', noteData);

      const { data, error } = await (supabase as any)
        .from('lesson_notes')
        .insert(noteData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ NOTES: Database error inserting note:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ NOTES: No data returned from insert');
        throw new Error('No se pudo crear la nota');
      }
      
      console.log('✅ NOTES: Note added successfully:', data);
      
      const newNote = data as LessonNote;
      setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      toast.success('Nota guardada exitosamente');
      return newNote;
    } catch (error: any) {
      console.error('❌ NOTES: Error adding note:', error);
      
      if (error?.message?.includes('violates row-level security')) {
        toast.error('Error de permisos al guardar la nota');
      } else if (error?.code === 'PGRST301') {
        toast.error('Error: Usuario no autorizado');
      } else {
        toast.error(`Error al guardar la nota: ${error?.message || 'Error desconocido'}`);
      }
    }
  }, [user, lessonId, courseId]);

  const updateNote = useCallback(async (noteId: string, noteText: string) => {
    if (!user) {
      console.error('❌ NOTES: No user found for updateNote');
      return;
    }

    console.log('✏️ NOTES: Updating note:', noteId);

    try {
      const { data, error } = await (supabase as any)
        .from('lesson_notes')
        .update({ note_text: noteText })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ NOTES: Error updating note:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ NOTES: No data returned from update');
        throw new Error('No se pudo actualizar la nota');
      }
      
      console.log('✅ NOTES: Note updated successfully:', data);
      
      const updatedNote = data as LessonNote;
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
      toast.success('Nota actualizada');
    } catch (error: any) {
      console.error('❌ NOTES: Error updating note:', error);
      toast.error(`Error al actualizar la nota: ${error?.message || 'Error desconocido'}`);
    }
  }, [user]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user) {
      console.error('❌ NOTES: No user found for deleteNote');
      return;
    }

    console.log('🗑️ NOTES: Deleting note:', noteId);

    try {
      const { error } = await (supabase as any)
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ NOTES: Error deleting note:', error);
        throw error;
      }
      
      console.log('✅ NOTES: Note deleted successfully');
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Nota eliminada');
    } catch (error: any) {
      console.error('❌ NOTES: Error deleting note:', error);
      toast.error(`Error al eliminar la nota: ${error?.message || 'Error desconocido'}`);
    }
  }, [user]);

  return {
    notes,
    loading,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote
  };
}
