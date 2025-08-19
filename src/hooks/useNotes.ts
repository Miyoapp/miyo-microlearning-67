
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { LessonNote } from '@/types/notes';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Type aliases for better readability
type LessonNoteRow = Tables<'lesson_notes'>;
type LessonNoteInsert = TablesInsert<'lesson_notes'>;
type LessonNoteUpdate = TablesUpdate<'lesson_notes'>;

export function useNotes(lessonId?: string, courseId?: string) {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user || !lessonId || !courseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('course_id', courseId)
        .order('timestamp_seconds', { ascending: true });

      if (error) throw error;
      
      // Convert Supabase row to LessonNote type
      const convertedNotes: LessonNote[] = (data || []).map((row: LessonNoteRow) => ({
        id: row.id,
        lesson_id: row.lesson_id,
        course_id: row.course_id,
        user_id: row.user_id,
        note_text: row.note_text,
        timestamp_seconds: row.timestamp_seconds,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
      
      setNotes(convertedNotes);
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
      const insertData: LessonNoteInsert = {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        note_text: noteText,
        timestamp_seconds: timestampSeconds
      };

      const { data, error } = await supabase
        .from('lesson_notes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      // Convert Supabase row to LessonNote type
      const newNote: LessonNote = {
        id: data.id,
        lesson_id: data.lesson_id,
        course_id: data.course_id,
        user_id: data.user_id,
        note_text: data.note_text,
        timestamp_seconds: data.timestamp_seconds,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
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
      const updateData: LessonNoteUpdate = {
        note_text: noteText
      };

      const { data, error } = await supabase
        .from('lesson_notes')
        .update(updateData)
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Convert Supabase row to LessonNote type
      const updatedNote: LessonNote = {
        id: data.id,
        lesson_id: data.lesson_id,
        course_id: data.course_id,
        user_id: data.user_id,
        note_text: data.note_text,
        timestamp_seconds: data.timestamp_seconds,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
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
        .from('lesson_notes')
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
