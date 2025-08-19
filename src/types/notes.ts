
export interface LessonNote {
  id: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  note_text: string;
  timestamp_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface CourseSummary {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  summary_content: string;
  summary_type: 'personal' | 'highlights' | 'insights';
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
