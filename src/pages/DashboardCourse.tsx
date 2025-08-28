
import { useParams } from 'react-router-dom';
import CourseAccessHandler from '@/components/course/CourseAccessHandler';
import MetaTags from '@/components/MetaTags';
import { useCourseData } from '@/hooks/useCourseData';

export default function DashboardCourse() {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';
  
  const { podcast, isLoading, error } = useCourseData(courseId);

  if (!courseId) {
    return <div>Error: ID de curso no válido</div>;
  }

  return (
    <>
      <MetaTags
        title={podcast?.title ? `${podcast.title} - Ruta de Aprendizaje` : 'Curso - Ruta de Aprendizaje'}
        description={podcast?.description || 'Descubre contenido de calidad en nuestra plataforma de cursos'}
        url={`${window.location.origin}/courses/${courseId}`}
      />
      
      <CourseAccessHandler 
        podcast={podcast}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
