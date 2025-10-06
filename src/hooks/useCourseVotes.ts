
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface CourseVotes {
  likes: number;
  dislikes: number;
  userVote: 'like' | 'dislike' | 'none';
}

export function useCourseVotes(courseId: string) {
  const [votes, setVotes] = useState<CourseVotes>({
    likes: 0,
    dislikes: 0,
    userVote: 'none'
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Defensive function to ensure non-negative counts
  const sanitizeCount = (value: number | null | undefined): number => {
    const count = value || 0;
    return Math.max(0, count);
  };

  const fetchVotes = async () => {
    try {
      // Get course likes/dislikes
      const { data: courseData, error: courseError } = await supabase
        .from('cursos')
        .select('likes, dislikes')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;

      // Treat null as "course not found" - use safe defaults
      if (!courseData) {
        console.warn('Course not found:', courseId);
        setVotes({ likes: 0, dislikes: 0, userVote: 'none' });
        setLoading(false);
        return;
      }

      // Get user's vote if authenticated
      let userVote: 'like' | 'dislike' | 'none' = 'none';
      if (user) {
        const { data: voteData, error: voteError } = await supabase
          .from('curso_votos')
          .select('tipo_voto')
          .eq('curso_id', courseId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (voteError && voteError.code !== 'PGRST116') throw voteError;
        userVote = (voteData?.tipo_voto as 'like' | 'dislike' | 'none') || 'none';
      }

      // Apply defensive sanitization to ensure non-negative counts
      const sanitizedLikes = sanitizeCount(courseData.likes);
      const sanitizedDislikes = sanitizeCount(courseData.dislikes);

      // Log if we found invalid data (for debugging)
      if (courseData.likes < 0 || courseData.dislikes < 0) {
        console.warn('Found negative vote counts in database:', {
          courseId,
          likes: courseData.likes,
          dislikes: courseData.dislikes
        });
      }

      setVotes({
        likes: sanitizedLikes,
        dislikes: sanitizedDislikes,
        userVote
      });
    } catch (error) {
      console.error('Error fetching votes:', error);
      // Set safe defaults on error
      setVotes({
        likes: 0,
        dislikes: 0,
        userVote: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const vote = async (newVote: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    try {
      const previousVote = votes.userVote;
      let finalVote: 'like' | 'dislike' | 'none' = newVote;

      // Toggle logic: if clicking the same vote, remove it
      if (previousVote === newVote) {
        finalVote = 'none';
      }

      // Update user vote in database
      await supabase
        .from('curso_votos')
        .upsert({
          user_id: user.id,
          curso_id: courseId,
          tipo_voto: finalVote,
          updated_at: new Date().toISOString()
        });

      // Calculate new counts with defensive programming
      let newLikes = sanitizeCount(votes.likes);
      let newDislikes = sanitizeCount(votes.dislikes);

      // Remove previous vote count
      if (previousVote === 'like') newLikes = Math.max(0, newLikes - 1);
      if (previousVote === 'dislike') newDislikes = Math.max(0, newDislikes - 1);

      // Add new vote count
      if (finalVote === 'like') newLikes++;
      if (finalVote === 'dislike') newDislikes++;

      // Ensure counts are never negative (defensive programming)
      newLikes = Math.max(0, newLikes);
      newDislikes = Math.max(0, newDislikes);

      // Update course counts in database
      await supabase
        .from('cursos')
        .update({
          likes: newLikes,
          dislikes: newDislikes
        })
        .eq('id', courseId);

      // Update local state
      setVotes({
        likes: newLikes,
        dislikes: newDislikes,
        userVote: finalVote
      });

      toast.success(finalVote === 'none' ? 'Voto eliminado' : 'Voto registrado');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Error al registrar el voto');
      // Refetch votes to ensure consistency after error
      fetchVotes();
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchVotes();
    }
  }, [courseId, user]);

  return {
    votes,
    loading,
    vote,
    refetch: fetchVotes
  };
}
