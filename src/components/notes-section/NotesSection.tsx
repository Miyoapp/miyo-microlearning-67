
import React from 'react';
import { useAllNotes } from '@/hooks/useAllNotes';
import { useNotesStats } from '@/hooks/useNotesStats';
import { useNotesFilters } from '@/hooks/useNotesFilters';
import NotesHeader from './NotesHeader';
import NotesStats from './NotesStats';
import NotesFilters from './NotesFilters';
import CategoryGroup from './CategoryGroup';
import { Skeleton } from '@/components/ui/skeleton';

const NotesSection = () => {
  const { coursesWithNotes, loading } = useAllNotes();
  const stats = useNotesStats(coursesWithNotes);
  const {
    filters,
    filteredCourses,
    updateSearchTerm,
    updateFilterType,
    updateSelectedTags
  } = useNotesFilters(coursesWithNotes);

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

  // Agrupar cursos por categoría
  const coursesByCategory = filteredCourses.reduce((acc, course) => {
    if (!acc[course.categoryName]) {
      acc[course.categoryName] = [];
    }
    acc[course.categoryName].push(course);
    return acc;
  }, {} as Record<string, typeof filteredCourses>);

  return (
    <div className="space-y-6">
      <NotesHeader />
      
      <NotesStats stats={stats} />
      
      <NotesFilters
        filters={filters}
        onSearchChange={updateSearchTerm}
        onFilterTypeChange={updateFilterType}
        onTagsChange={updateSelectedTags}
      />

      {Object.keys(coursesByCategory).length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600">No se encontraron notas con los filtros aplicados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(coursesByCategory).map(([categoryName, courses]) => (
            <CategoryGroup
              key={categoryName}
              categoryName={categoryName}
              courses={courses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesSection;
