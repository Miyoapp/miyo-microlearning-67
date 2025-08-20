
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllNotes } from '@/hooks/useAllNotes';
import { useNoteStats } from '@/hooks/useNoteStats';
import { useNoteFilters } from '@/hooks/useNoteFilters';
import { EnrichedNote } from '@/types/notes';
import NotesHeader from './NotesHeader';
import NotesStats from './NotesStats';
import NotesFilters from './NotesFilters';
import CategoryGroup from './CategoryGroup';
import NoteModal from './NoteModal';
import { StickyNote } from 'lucide-react';
import { toast } from 'sonner';

const NotesSection: React.FC = () => {
  const navigate = useNavigate();
  const { notes, loading, updateNote, deleteNote, filterNotes } = useAllNotes();
  const stats = useNoteStats(notes);
  const { filters, updateSearch, updateFilterType, toggleTag, clearFilters } = useNoteFilters();
  
  const [selectedNote, setSelectedNote] = useState<EnrichedNote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');

  // Filtrar notas
  const filteredNotes = useMemo(() => {
    return filterNotes(notes, filters);
  }, [notes, filters, filterNotes]);

  // Agrupar notas por categoría
  const notesByCategory = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      const category = note.category_name;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(note);
      return acc;
    }, {} as Record<string, EnrichedNote[]>);
  }, [filteredNotes]);

  const handleEditNote = (note: EnrichedNote) => {
    setSelectedNote(note);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteId: string, updates: Partial<EnrichedNote>) => {
    await updateNote(noteId, updates);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      await deleteNote(noteId);
    }
  };

  const handleToggleFavorite = async (noteId: string, isFavorite: boolean) => {
    await updateNote(noteId, { is_favorite: isFavorite });
  };

  const handleNavigateToLesson = (note: EnrichedNote) => {
    // Navegar al curso con el timestamp específico
    navigate(`/dashboard/course/${note.course_id}?lesson=${note.lesson_id}&t=${note.timestamp_seconds}`);
  };

  const handleCreateNoteFromModal = (noteData: { note_title: string; note_text: string; tags: string[]; is_favorite: boolean }) => {
    // Por ahora solo mostramos un mensaje, ya que crear notas independientes requiere más lógica
    toast.info('Funcionalidad de creación manual próximamente disponible');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotesHeader onCreateNote={handleCreateNote} />
      
      <NotesStats stats={stats} />
      
      <NotesFilters
        filters={filters}
        onSearchChange={updateSearch}
        onFilterTypeChange={updateFilterType}
        onTagToggle={toggleTag}
        onClearFilters={clearFilters}
      />

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {notes.length === 0 ? 'Aún no tienes notas' : 'No se encontraron notas'}
          </h3>
          <p className="text-gray-600 mb-4">
            {notes.length === 0 
              ? 'Comienza a tomar notas mientras escuchas tus lecciones favoritas'
              : 'Intenta ajustar los filtros para encontrar lo que buscas'
            }
          </p>
          {notes.length === 0 && (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Explorar cursos →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(notesByCategory).map(([categoryName, categoryNotes]) => (
            <CategoryGroup
              key={categoryName}
              categoryName={categoryName}
              notes={categoryNotes}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onNavigateToLesson={handleNavigateToLesson}
            />
          ))}
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
        onSave={handleSaveNote}
        onCreate={handleCreateNoteFromModal}
        mode={modalMode}
      />
    </div>
  );
};

export default NotesSection;
