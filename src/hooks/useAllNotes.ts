
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { EnrichedNote, NoteFilters } from '@/types/notes';

export function useAllNotes() {
  const [notes, setNotes] = useState<EnrichedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAllNotes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select(`
          *,
          lecciones:lesson_id (
            titulo,
            modulos:modulo_id (
              cursos:curso_id (
                titulo,
                imagen_portada,
                categorias:categoria_id (
                  nombre
                )
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const enrichedNotes: EnrichedNote[] = (data || []).map((note: any) => ({
        ...note,
        category_name: note.lecciones?.modulos?.cursos?.categorias?.nombre || 'Sin categoría',
        course_title: note.lecciones?.modulos?.cursos?.titulo || 'Curso desconocido',
        lesson_title: note.lecciones?.titulo || 'Lección desconocida',
        course_image: note.lecciones?.modulos?.cursos?.imagen_portada || '/placeholder.svg',
        tags: note.tags || [],
        is_favorite: note.is_favorite || false
      }));

      setNotes(enrichedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<EnrichedNote>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      ));
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

  const filterNotes = useCallback((notes: EnrichedNote[], filters: NoteFilters) => {
    let filtered = [...notes];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(note =>
        note.note_text.toLowerCase().includes(searchLower) ||
        note.course_title.toLowerCase().includes(searchLower) ||
        note.lesson_title.toLowerCase().includes(searchLower) ||
        note.category_name.toLowerCase().includes(searchLower) ||
        (note.note_title && note.note_title.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por tipo
    if (filters.filterType === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(note => new Date(note.created_at) >= oneWeekAgo);
    } else if (filters.filterType === 'favorites') {
      filtered = filtered.filter(note => note.is_favorite);
    }

    // Filtro por etiquetas
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        filters.selectedTags.some(tag => note.tags?.includes(tag))
      );
    }

    return filtered;
  }, []);

  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  return {
    notes,
    loading,
    fetchAllNotes,
    updateNote,
    deleteNote,
    filterNotes
  };
}
