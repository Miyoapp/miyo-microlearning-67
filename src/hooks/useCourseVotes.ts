
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

  const fetchVotes = async () => {
    try {
      // Get course likes/dislikes
      const { data: courseData, error: courseError } = await supabase
        .from('cursos')
        .select('likes, dislikes')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

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

      setVotes({
        likes: courseData.likes || 0,
        dislikes: courseData.dislikes || 0,
        userVote
      });
    } catch (error) {
      console.error('Error fetching votes:', error);
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

      // Calculate new counts
      let newLikes = votes.likes;
      let newDislikes = votes.dislikes;

      // Remove previous vote count
      if (previousVote === 'like') newLikes--;
      if (previousVote === 'dislike') newDislikes--;

      // Add new vote count
      if (finalVote === 'like') newLikes++;
      if (finalVote === 'dislike') newDislikes++;

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
