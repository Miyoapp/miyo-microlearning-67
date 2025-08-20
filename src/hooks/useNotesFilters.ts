
import { useState, useMemo } from 'react';
import { CourseWithNotes, NotesFilters } from '@/types/notes';

export function useNotesFilters(coursesWithNotes: CourseWithNotes[]) {
  const [filters, setFilters] = useState<NotesFilters>({
    searchTerm: '',
    filterType: 'all',
    selectedTags: []
  });

  const filteredCourses = useMemo(() => {
    return coursesWithNotes.map(course => {
      let filteredNotes = course.notes;

      // Filtrar por búsqueda
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        filteredNotes = filteredNotes.filter(note => 
          note.note_text.toLowerCase().includes(search) ||
          note.note_title?.toLowerCase().includes(search) ||
          course.courseTitle.toLowerCase().includes(search)
        );
      }

      // Filtrar por tipo
      if (filters.filterType === 'favorites') {
        filteredNotes = filteredNotes.filter(note => note.is_favorite);
      } else if (filters.filterType === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredNotes = filteredNotes.filter(note => new Date(note.created_at) > weekAgo);
      }

      // Filtrar por tags
      if (filters.selectedTags.length > 0) {
        filteredNotes = filteredNotes.filter(note => 
          filters.selectedTags.some(tag => note.tags.includes(tag))
        );
      }

      return {
        ...course,
        notes: filteredNotes,
        notesCount: filteredNotes.length
      };
    }).filter(course => course.notesCount > 0);
  }, [coursesWithNotes, filters]);

  const updateSearchTerm = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const updateFilterType = (filterType: NotesFilters['filterType']) => {
    setFilters(prev => ({ ...prev, filterType }));
  };

  const updateSelectedTags = (selectedTags: string[]) => {
    setFilters(prev => ({ ...prev, selectedTags }));
  };

  return {
    filters,
    filteredCourses,
    updateSearchTerm,
    updateFilterType,
    updateSelectedTags
  };
}
