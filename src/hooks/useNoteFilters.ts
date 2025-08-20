
import { useState, useCallback } from 'react';
import { NoteFilters } from '@/types/notes';

export function useNoteFilters() {
  const [filters, setFilters] = useState<NoteFilters>({
    search: '',
    filterType: 'all',
    selectedTags: []
  });

  const updateSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const updateFilterType = useCallback((filterType: NoteFilters['filterType']) => {
    setFilters(prev => ({ ...prev, filterType }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      filterType: 'all',
      selectedTags: []
    });
  }, []);

  return {
    filters,
    updateSearch,
    updateFilterType,
    toggleTag,
    clearFilters
  };
}
