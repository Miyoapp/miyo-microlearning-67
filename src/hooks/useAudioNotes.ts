
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface AudioNote {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  note_text: string;
  timestamp_seconds: number;
  created_at: string;
  updated_at: string;
}

export function useAudioNotes(lessonId: string | null, courseId: string | null) {
  const [notes, setNotes] = useState<AudioNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user || !lessonId || !courseId) {
      setNotes([]);
      return;
    }

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
      setNotes(data || []);
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
        .from('lesson_notes')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          note_text: noteText,
          timestamp_seconds: Math.round(timestampSeconds)
        })
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => [...prev, data].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      toast.success('Nota agregada exitosamente');
      
      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Error al agregar la nota');
    }
  }, [user, lessonId, courseId]);

  const updateNote = useCallback(async (noteId: string, noteText: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .update({ note_text: noteText })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => prev.map(note => note.id === noteId ? data : note));
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

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
}
