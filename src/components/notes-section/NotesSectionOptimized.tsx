import React from 'react';
import { useAllNotesOptimized } from '@/hooks/useAllNotesOptimized';
import { useNotesStats } from '@/hooks/useNotesStats';
import { useNotesFilters } from '@/hooks/useNotesFilters';
import NotesHeader from './NotesHeader';
import NotesStats from './NotesStats';
import NotesFilters from './NotesFilters';
import NotesContentList from './NotesContentList';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const NotesSectionOptimized = () => {
  const { coursesWithNotes, loading } = useAllNotesOptimized();
  const stats = useNotesStats(coursesWithNotes);
  const {
    filters,
    filteredCourses,
    updateSearchTerm,
    updateFilterType,
    updateSelectedTags
  } = useNotesFilters(coursesWithNotes);

  console.log('📝 NOTAS SECTION: Rendering with data:', {
    coursesCount: coursesWithNotes.length,
    loading,
    filteredCount: filteredCourses.length
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (coursesWithNotes.length === 0) {
    return (
      <div className="space-y-6">
        <NotesHeader />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Aún no tienes notas</h3>
          <p className="text-gray-600 mb-6">
            Comienza a tomar notas mientras escuchas tus cursos favoritos
          </p>
        </div>
      </div>
    );
  }

  // Group courses by category
  const coursesByCategory = filteredCourses.reduce((acc, course) => {
    if (!acc[course.categoryName]) {
      acc[course.categoryName] = [];
    }
    acc[course.categoryName].push(course);
    return acc;
  }, {} as Record<string, typeof filteredCourses>);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <NotesHeader />
        
        <NotesStats stats={stats} />
        
        <NotesFilters
          filters={filters}
          onSearchChange={updateSearchTerm}
          onFilterTypeChange={updateFilterType}
          onTagsChange={updateSelectedTags}
        />

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <NotesContentList coursesByCategory={coursesByCategory} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default NotesSectionOptimized;