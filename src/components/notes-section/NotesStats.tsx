
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NoteStats } from '@/types/notes';
import { StickyNote, BookOpen, Heart, Clock } from 'lucide-react';

interface NotesStatsProps {
  stats: NoteStats;
}

const NotesStats: React.FC<NotesStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total de Notas',
      value: stats.totalNotes,
      icon: StickyNote,
      color: 'text-blue-600'
    },
    {
      title: 'Cursos con Notas',
      value: stats.coursesWithNotes,
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      title: 'Notas Favoritas',
      value: stats.favoriteNotes,
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Notas Recientes',
      value: stats.recentNotes,
      icon: Clock,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotesStats;
