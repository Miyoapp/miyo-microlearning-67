
export interface LessonNote {
  id: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  note_text: string;
  note_title?: string;
  timestamp_seconds: number;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanItem {
  id: string;
  summary_id: string;
  text: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseSummary {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  summary_content: string;
  summary_type: string;
  key_concepts?: string;
  personal_insight?: string;
  action_plans?: any[];
  created_at: string;
  updated_at: string;
}

export interface CourseCompletionStats {
  totalLessons: number;
  completedLessons: number;
  totalNotes: number;
  totalTimeSpent: number;
  courseDuration: number;
}

export interface SummaryFormData {
  title: string;
  keyConcepts: string;
  personalInsight: string;
  actionPlans: string[];
}

// Nuevas interfaces para la gestión de notas
export interface CourseWithNotes {
  courseId: string;
  courseTitle: string;
  categoryName: string;
  categoryId: string;
  notesCount: number;
  lastNoteDate: string;
  notes: LessonNote[];
}

export interface NotesStats {
  totalNotes: number;
  coursesWithNotes: number;
  favoriteNotes: number;
  recentNotesCount: number;
}

export interface NotesFilters {
  searchTerm: string;
  filterType: 'all' | 'recent' | 'favorites';
  selectedTags: string[];
}

export interface LessonWithNotes {
  lessonId: string;
  lessonTitle: string;
  notes: LessonNote[];
}

export interface NoteTag {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const NOTE_TAGS: NoteTag[] = [
  { id: 'insight', name: 'Insight', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '💡' },
  { id: 'action', name: 'Acción', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🎯' },
  { id: 'quote', name: 'Cita', color: 'bg-green-100 text-green-800 border-green-200', icon: '💬' },
  { id: 'reflection', name: 'Reflexión', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🤔' }
];
