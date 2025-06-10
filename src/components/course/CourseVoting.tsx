
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share } from 'lucide-react';
import { useCourseVotes } from '@/hooks/useCourseVotes';
import { useCourseData } from '@/hooks/useCourseData';
import ShareCourseModal from './ShareCourseModal';

interface CourseVotingProps {
  courseId: string;
}

const CourseVoting: React.FC<CourseVotingProps> = ({ courseId }) => {
  const { votes, loading, vote } = useCourseVotes(courseId);
  const { podcast } = useCourseData(courseId);
  const [showShareModal, setShowShareModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => vote('like')}
          className={`flex items-center gap-1 ${
            votes.userVote === 'like' 
              ? 'bg-gray-100 text-gray-700 border-gray-300' 
              : 'hover:bg-gray-50'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${votes.userVote === 'like' ? 'fill-current' : ''}`} />
          <span>{votes.likes}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => vote('dislike')}
          className={`flex items-center gap-1 ${
            votes.userVote === 'dislike' 
              ? 'bg-gray-100 text-gray-700 border-gray-300' 
              : 'hover:bg-gray-50'
          }`}
        >
          <ThumbsDown className={`w-4 h-4 ${votes.userVote === 'dislike' ? 'fill-current' : ''}`} />
          <span>{votes.dislikes}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShareModal(true)}
          className="hover:bg-gray-50"
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>

      {podcast && (
        <ShareCourseModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          course={podcast}
        />
      )}
    </>
  );
};

export default CourseVoting;
