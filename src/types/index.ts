
export interface Creator {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Podcast {
  id: string;
  title: string;
  creator: Creator;
  duration: number; // in minutes
  lessonCount: number;
  category: Category;
  imageUrl: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  audioUrl: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export type Category = 
  | 'Productivity' 
  | 'Business' 
  | 'Technology' 
  | 'Personal Development' 
  | 'Health' 
  | 'Design'
  | 'Marketing';
