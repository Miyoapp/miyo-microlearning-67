
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface NotesHeaderProps {
  onCreateNote: () => void;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({ onCreateNote }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          📝 Mis Notas
        </h1>
        <p className="text-gray-600 mt-1">
          Organiza y gestiona todas tus notas de aprendizaje
        </p>
      </div>
      
      <Button
        onClick={onCreateNote}
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center gap-2"
      >
        <Plus size={16} />
        Nueva Nota
      </Button>
    </div>
  );
};

export default NotesHeader;
