
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { NoteFilters, NOTE_TAGS, NoteTagType } from '@/types/notes';

interface NotesFiltersProps {
  filters: NoteFilters;
  onSearchChange: (search: string) => void;
  onFilterTypeChange: (type: NoteFilters['filterType']) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

const NotesFilters: React.FC<NotesFiltersProps> = ({
  filters,
  onSearchChange,
  onFilterTypeChange,
  onTagToggle,
  onClearFilters
}) => {
  const filterButtons = [
    { key: 'all' as const, label: 'Todas' },
    { key: 'recent' as const, label: 'Recientes' },
    { key: 'favorites' as const, label: 'Favoritas' }
  ];

  const hasActiveFilters = filters.search || filters.filterType !== 'all' || filters.selectedTags.length > 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Buscar en notas, cursos, lecciones..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filtros principales */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={16} className="text-gray-500" />
        {filterButtons.map((button) => (
          <Button
            key={button.key}
            variant={filters.filterType === button.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterTypeChange(button.key)}
            className={filters.filterType === button.key ? 'bg-primary hover:bg-primary/90' : ''}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {/* Filtros por etiquetas */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Etiquetas:</span>
        {Object.entries(NOTE_TAGS).map(([key, tag]) => (
          <Badge
            key={key}
            variant={filters.selectedTags.includes(key) ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              filters.selectedTags.includes(key) 
                ? 'bg-primary hover:bg-primary/90' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onTagToggle(key)}
          >
            {tag.label}
          </Badge>
        ))}
      </div>

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-600 hover:text-gray-800"
        >
          <X size={14} className="mr-1" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default NotesFilters;
