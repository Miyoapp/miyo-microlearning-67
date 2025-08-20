
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrichedNote, NOTE_TAGS } from '@/types/notes';
import { Heart, Edit, Trash2, Play, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoteItemProps {
  note: EnrichedNote;
  onEdit: (note: EnrichedNote) => void;
  onDelete: (noteId: string) => void;
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
  onNavigateToLesson: (note: EnrichedNote) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onNavigateToLesson 
}) => {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timeAgo = formatDistanceToNow(new Date(note.created_at), { 
    addSuffix: true, 
    locale: es 
  });

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
      <CardContent className="p-4">
        {/* Header con metadatos */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className="font-medium">{note.course_title}</span>
              <span>•</span>
              <span>{note.lesson_title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>{formatTime(note.timestamp_seconds)}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(note.id, !note.is_favorite)}
            className={`p-1 ${note.is_favorite ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart size={16} fill={note.is_favorite ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {/* Título si existe */}
        {note.note_title && (
          <h4 className="font-semibold text-gray-900 mb-2">{note.note_title}</h4>
        )}

        {/* Contenido de la nota */}
        <p className="text-gray-700 leading-relaxed mb-3 line-clamp-3">
          {note.note_text}
        </p>

        {/* Etiquetas */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs ${NOTE_TAGS[tag as keyof typeof NOTE_TAGS]?.color || 'bg-gray-100 text-gray-800'}`}
              >
                {NOTE_TAGS[tag as keyof typeof NOTE_TAGS]?.label || tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToLesson(note)}
            className="text-primary hover:text-primary/80 hover:bg-purple-50"
          >
            <Play size={14} className="mr-1" />
            Ir al momento
          </Button>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
              className="p-1 text-gray-500 hover:text-red-600"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteItem;
