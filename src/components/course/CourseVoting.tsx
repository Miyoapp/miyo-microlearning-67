
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourseVotes } from '@/hooks/useCourseVotes';
import { cn } from '@/lib/utils';

interface CourseVotingProps {
  courseId: string;
  className?: string;
}

const CourseVoting: React.FC<CourseVotingProps> = ({ courseId, className }) => {
  const { votes, loading, vote } = useCourseVotes(courseId);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={votes.userVote === 'like' ? 'default' : 'outline'}
        size="sm"
        onClick={() => vote('like')}
        className={cn(
          "flex items-center gap-1",
          votes.userVote === 'like' && "bg-green-600 hover:bg-green-700"
        )}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>{votes.likes}</span>
      </Button>
      
      <Button
        variant={votes.userVote === 'dislike' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => vote('dislike')}
        className={cn(
          "flex items-center gap-1",
          votes.userVote === 'dislike' && "bg-gray-600 hover:bg-gray-700"
        )}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CourseVoting;
