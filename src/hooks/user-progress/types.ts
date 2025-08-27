
export interface UserCourseProgress {
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
  is_saved: boolean;
  last_listened_at: string;
  completion_modal_shown: boolean;
}
