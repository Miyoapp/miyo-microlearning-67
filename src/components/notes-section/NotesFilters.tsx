
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { NotesFilters as NotesFiltersType, NOTE_TAGS } from '@/types/notes';

interface NotesFiltersProps {
  filters: NotesFiltersType;
  onSearchChange: (search: string) => void;
  onFilterTypeChange: (type: NotesFiltersType['filterType']) => void;
  onTagsChange: (tags: string[]) => void;
}

const NotesFilters: React.FC<NotesFiltersProps> = ({
  filters,
  onSearchChange,
  onFilterTypeChange,
  onTagsChange
}) => {
  const filterTypes = [
    { id: 'all', label: 'Todas', icon: '📝' },
    { id: 'recent', label: 'Recientes', icon: '🔥' },
    { id: 'favorites', label: 'Favoritas', icon: '⭐' }
  ] as const;

  const toggleTag = (tagId: string) => {
    const newTags = filters.selectedTags.includes(tagId)
      ? filters.selectedTags.filter(t => t !== tagId)
      : [...filters.selectedTags, tagId];
    onTagsChange(newTags);
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar en tus notas..."
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {filters.searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        {filterTypes.map((type) => (
          <Button
            key={type.id}
            variant={filters.filterType === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterTypeChange(type.id)}
            className="flex items-center space-x-2"
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </Button>
        ))}
      </div>

      {/* Filtros por tags */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Filtrar por etiquetas:</p>
        <div className="flex flex-wrap gap-2">
          {NOTE_TAGS.map((tag) => (
            <Badge
              key={tag.id}
              variant={filters.selectedTags.includes(tag.id) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filters.selectedTags.includes(tag.id) ? tag.color : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleTag(tag.id)}
            >
              <span className="mr-1">{tag.icon}</span>
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesFilters;
