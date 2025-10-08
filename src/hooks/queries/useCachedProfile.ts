import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

// Query keys
export const profileKeys = {
  all: ['userProfile'] as const,
  user: (userId: string) => [...profileKeys.all, userId] as const,
};

// Hook principal para obtener el perfil
export const useCachedProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: profileKeys.user(user?.id || ''),
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar_url: data.avatar_url,
      } as Profile;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Mutation para actualizar el perfil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ name }) => {
      if (!user) return;
      
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: profileKeys.user(user.id) });
      
      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.user(user.id));
      
      // Optimistically update
      queryClient.setQueryData<Profile>(profileKeys.user(user.id), (old) => {
        if (!old) return old;
        return {
          ...old,
          name,
        };
      });
      
      return { previousProfile };
    },
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente');
    },
    onError: (error, variables, context) => {
      if (!user) return;
      
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.user(user.id), context.previousProfile);
      }
      
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    },
  });
};

// Mutation para actualizar la contraseña
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating password:', error);
      toast.error('Error al actualizar la contraseña');
    },
  });
};
