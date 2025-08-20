
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { NOTE_TAGS, NoteTagType } from '@/types/notes';

interface TagSelectorProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags, 
  onTagToggle, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(NOTE_TAGS).map(([key, tag]) => (
        <Badge
          key={key}
          variant={selectedTags.includes(key) ? 'default' : 'outline'}
          className={`cursor-pointer transition-all ${
            selectedTags.includes(key) 
              ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white' 
              : `${tag.color} hover:opacity-80`
          }`}
          onClick={() => onTagToggle(key)}
        >
          {tag.label}
        </Badge>
      ))}
    </div>
  );
};

export default TagSelector;
