
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NotesStats as NotesStatsType } from '@/types/notes';

interface NotesStatsProps {
  stats: NotesStatsType;
}

const NotesStats: React.FC<NotesStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total de Notas',
      value: stats.totalNotes,
      icon: '📝',
      color: 'text-blue-600'
    },
    {
      title: 'Cursos con Notas',
      value: stats.coursesWithNotes,
      icon: '📚',
      color: 'text-green-600'
    },
    {
      title: 'Notas Favoritas',
      value: stats.favoriteNotes,
      icon: '⭐',
      color: 'text-yellow-600'
    },
    {
      title: 'Notas Recientes',
      value: stats.recentNotesCount,
      icon: '🔥',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotesStats;
