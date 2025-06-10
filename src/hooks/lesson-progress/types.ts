
export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  current_position: number;
  created_at: string;
  updated_at: string;
}

export interface LessonProgressUpdates {
  is_completed?: boolean;
  current_position?: number;
}
