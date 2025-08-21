
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export type FilterType = 'Por Categoría' | 'Por Curso' | 'Cronológico';

interface ActionPlansFiltersProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ActionPlansFilters: React.FC<ActionPlansFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery
}) => {
  const filters: FilterType[] = ['Por Categoría', 'Por Curso', 'Cronológico'];

  return (
    <section className="bg-white p-6 rounded-2xl mb-8 shadow-sm">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-5">
        {filters.map(filter => (
          <button 
            key={filter}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter 
                ? 'bg-miyo-600 text-white border-2 border-miyo-600' 
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-miyo-200'
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          type="text"
          placeholder="Buscar por texto del plan, curso o categoría..."
          className="pl-10 border-2 border-gray-200 focus:border-miyo-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </section>
  );
};

export default ActionPlansFilters;
