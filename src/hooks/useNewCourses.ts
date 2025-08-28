
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Podcast } from '@/types';
import { transformarCursoAModelo } from '@/lib/api/transformers';

export const useNewCourses = () => {
  const [newCourses, setNewCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fecha de hace 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      console.log('🔍 Fetching new courses created after:', thirtyDaysAgo.toISOString());
      
      // Buscar cursos nuevos (últimos 30 días)
      const { data: recentCourses, error: recentError } = await supabase
        .from('cursos')
        .select('*')
        .eq('show', true)
        .gte('fecha_creacion', thirtyDaysAgo.toISOString())
        .order('fecha_creacion', { ascending: false })
        .limit(4);

      if (recentError) {
        throw recentError;
      }

      let coursesToShow = recentCourses || [];
      
      // Si no hay suficientes cursos nuevos, expandir a 60 días
      if (coursesToShow.length < 4) {
        console.log(`📅 Only ${coursesToShow.length} courses in last 30 days, expanding to 60 days`);
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        const { data: olderCourses, error: olderError } = await supabase
          .from('cursos')
          .select('*')
          .eq('show', true)
          .gte('fecha_creacion', sixtyDaysAgo.toISOString())
          .order('fecha_creacion', { ascending: false })
          .limit(4);

        if (olderError) {
          throw olderError;
        }
        
        coursesToShow = olderError ? coursesToShow : (olderCourses || []);
      }

      // Si aún no hay suficientes, usar criterio de fallback
      if (coursesToShow.length < 4) {
        console.log(`📊 Still only ${coursesToShow.length} courses, using fallback strategy`);
        
        // Fallback: cursos con menos interacciones (más "nuevos" para descubrir)
        const { data: fallbackCourses, error: fallbackError } = await supabase
          .from('cursos')
          .select('*')
          .eq('show', true)
          .order('likes', { ascending: true }) // Menos likes = menos descubiertos
          .order('fecha_creacion', { ascending: false })
          .limit(4);

        if (fallbackError) {
          throw fallbackError;
        }
        
        coursesToShow = fallbackError ? coursesToShow : (fallbackCourses || []);
      }

      console.log(`✅ Found ${coursesToShow.length} new courses to display`);

      // Transformar cursos al modelo de la aplicación
      const transformedCourses = await Promise.all(
        coursesToShow.map(curso => transformarCursoAModelo({
          id: curso.id,
          titulo: curso.titulo,
          descripcion: curso.descripcion,
          imagen_portada: curso.imagen_portada,
          categoria_id: curso.categoria_id,
          creador_id: curso.creador_id,
          duracion_total: curso.duracion_total,
          numero_lecciones: curso.numero_lecciones,
          fecha_creacion: curso.fecha_creacion,
          fecha_actualizacion: curso.fecha_actualizacion,
          tipo_curso: (curso.tipo_curso as 'libre' | 'pago') || 'libre',
          precio: curso.precio,
          moneda: curso.moneda || 'USD',
          nivel: curso.nivel,
          likes: curso.likes,
          dislikes: curso.dislikes
        }))
      );

      setNewCourses(transformedCourses);
    } catch (error) {
      console.error('❌ Error fetching new courses:', error);
      setError('Error al cargar cursos nuevos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewCourses();
  }, [fetchNewCourses]);

  const refetch = useCallback(async () => {
    await fetchNewCourses();
  }, [fetchNewCourses]);

  return { newCourses, loading, error, refetch };
};
