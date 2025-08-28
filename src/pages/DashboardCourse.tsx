
import { useParams } from 'react-router-dom';
import CoursePageManager from '@/components/course/CoursePageManager';
import MetaTags from '@/components/MetaTags';
import { useCourseData } from '@/hooks/useCourseData';
import CourseLoading from '@/components/course/CourseLoading';
import CourseErrorState from '@/components/course/CourseErrorState';

export default function DashboardCourse() {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';
  
  const { podcast, isLoading, error } = useCourseData(courseId);

  if (!courseId) {
    return <div>Error: ID de curso no válido</div>;
  }

  if (isLoading) {
    return <CourseLoading />;
  }

  if (error || !podcast) {
    return <CourseErrorState error={error} />;
  }

  return (
    <>
      <MetaTags
        title={podcast.title ? `${podcast.title} - Ruta de Aprendizaje` : 'Curso - Ruta de Aprendizaje'}
        description={podcast.description || 'Descubre contenido de calidad en nuestra plataforma de cursos'}
        url={`${window.location.origin}/courses/${courseId}`}
      />
      
      <CoursePageManager podcast={podcast} />
    </>
  );
}
