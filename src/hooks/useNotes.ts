
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
    if (!user || !lessonId || !courseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('course_id', courseId)
        .order('timestamp_seconds', { ascending: true });

      if (error) throw error;
      setNotes((data as unknown as LessonNote[]) || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [user, lessonId, courseId]);

  const addNote = useCallback(async (noteText: string, timestampSeconds: number) => {
    if (!user || !lessonId || !courseId) return;

    try {
      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          note_text: noteText,
          timestamp_seconds: timestampSeconds
        })
        .select()
        .single();

      if (error) throw error;
      
      const newNote = data as unknown as LessonNote;
      setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      toast.success('Nota guardada exitosamente');
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Error al guardar la nota');
    }
  }, [user, lessonId, courseId]);

  const updateNote = useCallback(async (noteId: string, noteText: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .update({ note_text: noteText })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedNote = data as unknown as LessonNote;
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
      toast.success('Nota actualizada');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Error al actualizar la nota');
    }
  }, [user]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_notes' as any)
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Nota eliminada');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Error al eliminar la nota');
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
