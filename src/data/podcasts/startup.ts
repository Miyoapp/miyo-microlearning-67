
import { Podcast } from '../../types';

export const startupPodcast: Podcast = {
  id: '6',
  title: 'Startup Fundamentals',
  creator: {
    id: 'c6',
    name: 'Jessica Taylor',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    linkedinUrl: null
  },
  duration: 65,
  lessonCount: 6,
  category: {
    id: '2',
    nombre: 'Business'
  },
  imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  description: 'Everything you need to know to start your own business, from ideation to launch and beyond.',
  lessons: [
    {
      id: 'l6-1',
      title: 'Identifying Business Opportunities',
      duracion: 11,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: false,
      description: null,
      orden: 1
    },
    {
      id: 'l6-2',
      title: 'Market Research and Validation',
      duracion: 10,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 2
    },
    {
      id: 'l6-3',
      title: 'Business Plan Development',
      duracion: 12,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 3
    },
    {
      id: 'l6-4',
      title: 'Funding Strategies',
      duracion: 11,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 4
    },
    {
      id: 'l6-5',
      title: 'Legal Considerations',
      duracion: 9,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 5
    },
    {
      id: 'l6-6',
      title: 'Building Your Team',
      duracion: 12,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 6
    }
  ],
  modules: [
    {
      id: 'module-6-1',
      title: 'Conceptos Básicos',
      lessonIds: ['l6-1', 'l6-2']
    },
    {
      id: 'module-6-2',
      title: 'Planificación',
      lessonIds: ['l6-3', 'l6-4']
    },
    {
      id: 'module-6-3',
      title: 'Implementación',
      lessonIds: ['l6-5', 'l6-6']
    }
  ],
  tipo_curso: 'libre',
  likes: 0,
  dislikes: 0
};
