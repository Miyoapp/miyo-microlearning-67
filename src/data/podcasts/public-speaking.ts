
import { Podcast } from '../../types';

export const speakingPodcast: Podcast = {
  id: '8',
  title: 'Public Speaking Mastery',
  creator: {
    id: 'c8',
    name: 'Olivia Parker',
    imageUrl: 'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    linkedinUrl: null
  },
  duration: 42,
  lessonCount: 4,
  category: {
    id: '4',
    nombre: 'Personal Development'
  },
  imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  description: 'Overcome your fear of public speaking and learn to deliver powerful presentations that engage and inspire your audience.',
  lessons: [
    {
      id: 'l8-1',
      title: 'Understanding Speech Anxiety',
      duracion: 10,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: false,
      description: null,
      orden: 1
    },
    {
      id: 'l8-2',
      title: 'Structuring Your Presentation',
      duracion: 12,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 2
    },
    {
      id: 'l8-3',
      title: 'Body Language and Voice Modulation',
      duracion: 11,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 3
    },
    {
      id: 'l8-4',
      title: 'Engaging Your Audience',
      duracion: 9,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 4
    }
  ],
  modules: [
    {
      id: 'module-8-1',
      title: 'Preparación Mental',
      lessonIds: ['l8-1', 'l8-2']
    },
    {
      id: 'module-8-2',
      title: 'Técnicas de Presentación',
      lessonIds: ['l8-3', 'l8-4']
    }
  ],
  tipo_curso: 'libre',
  likes: 0,
  dislikes: 0
};
