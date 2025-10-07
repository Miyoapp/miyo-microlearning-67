import React, { useState } from 'react';
import { useAllSummariesOptimized } from '@/hooks/useAllSummariesOptimized';
import ResumeHeader from './ResumeHeader';
import ResumeCard from './ResumeCard';
import CategoryGroup from './CategoryGroup';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const ResumesListOptimized = () => {
  const { summaries, loading, deleteSummary } = useAllSummariesOptimized();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (summaryId: string) => {
    await deleteSummary(summaryId);
  };

  // Filter summaries based on search
  const filteredSummariesData = summaries.filter(summary =>
    summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (summaries.length === 0) {
    return (
      <div className="space-y-6">
        <ResumeHeader resumeCount={0} />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Aún no tienes resúmenes</h3>
          <p className="text-gray-600 mb-6">
            Completa un curso para crear tu primer resumen
          </p>
        </div>
      </div>
    );
  }

  // Group summaries by category
  const summariesByCategory = filteredSummariesData.reduce((acc, summary) => {
    if (!acc[summary.category_name]) {
      acc[summary.category_name] = [];
    }
    acc[summary.category_name].push(summary);
    return acc;
  }, {} as Record<string, typeof filteredSummariesData>);

  return (
    <div className="space-y-6">
      <ResumeHeader resumeCount={summaries.length} />
      
      <div className="space-y-4">
        <Input
          placeholder="Buscar resúmenes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(summariesByCategory).map(([categoryName, summaries]) => (
          <div key={categoryName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                📚 {categoryName}
              </div>
              <div className="text-sm text-gray-600">
                {summaries.length} {summaries.length === 1 ? 'resumen' : 'resúmenes'}
              </div>
            </div>
            <div>
              {summaries.map((summary) => (
                <ResumeCard 
                  key={summary.id} 
                  resume={summary} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumesListOptimized;