
export interface LessonNote {
  id: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  note_text: string;
  timestamp_seconds: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  is_favorite?: boolean;
  note_title?: string;
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
  summary_type: string; // Changed from union type to string to match database
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

export interface EnrichedNote extends LessonNote {
  category_name: string;
  course_title: string;
  lesson_title: string;
  course_image: string;
}

export interface NoteStats {
  totalNotes: number;
  coursesWithNotes: number;
  favoriteNotes: number;
  recentNotes: number;
}

export interface NoteFilters {
  search: string;
  filterType: 'all' | 'recent' | 'favorites';
  selectedTags: string[];
}

export const NOTE_TAGS = {
  insight: { label: '💡 Insight', color: 'bg-yellow-100 text-yellow-800' },
  action: { label: '🎯 Acción', color: 'bg-blue-100 text-blue-800' },
  quote: { label: '💬 Cita', color: 'bg-green-100 text-green-800' },
  reflection: { label: '🤔 Reflexión', color: 'bg-gray-100 text-gray-800' }
} as const;

export type NoteTagType = keyof typeof NOTE_TAGS;
