
import { Podcast } from '../../types';

export const mindfulnessPodcast: Podcast = {
  id: '4',
  title: 'Mindfulness for Beginners',
  creator: {
    id: 'c4',
    name: 'Sarah Lee',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    linkedinUrl: null
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
      duracion: 10,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: false,
      description: null,
      orden: 1
    },
    {
      id: 'l4-2',
      title: 'Mindful Breathing Techniques',
      duracion: 11,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 2
    },
    {
      id: 'l4-3',
      title: 'Body Scan Meditation',
      duracion: 9,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 3
    },
    {
      id: 'l4-4',
      title: 'Integrating Mindfulness into Daily Life',
      duracion: 10,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 4
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
  ],
  tipo_curso: 'libre',
  likes: 0,
  dislikes: 0
};
