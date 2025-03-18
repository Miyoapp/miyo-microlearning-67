
import { Podcast } from '../../types';

export const mindfulnessPodcast: Podcast = {
  id: '4',
  title: 'Mindfulness for Beginners',
  creator: {
    id: 'c4',
    name: 'Sarah Lee',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  },
  duration: 40,
  lessonCount: 4,
  category: {
    id: '5',
    nombre: 'Health'
  },
  imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  description: 'Learn practical mindfulness techniques to reduce stress, improve focus, and enhance overall well-being in your daily life.',
  lessons: [
    {
      id: 'l4-1',
      title: 'Introduction to Mindfulness',
      duration: 10,
      audioUrl: '/placeholder.mp3',
      isCompleted: false,
      isLocked: false
    },
    {
      id: 'l4-2',
      title: 'Mindful Breathing Techniques',
      duration: 11,
      audioUrl: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true
    },
    {
      id: 'l4-3',
      title: 'Body Scan Meditation',
      duration: 9,
      audioUrl: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true
    },
    {
      id: 'l4-4',
      title: 'Integrating Mindfulness into Daily Life',
      duration: 10,
      audioUrl: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true
    }
  ],
  modules: [
    {
      id: 'module-4-1',
      title: 'Conceptos Básicos',
      lessonIds: ['l4-1', 'l4-2']
    },
    {
      id: 'module-4-2',
      title: 'Técnicas Avanzadas',
      lessonIds: ['l4-3', 'l4-4']
    }
  ]
};
