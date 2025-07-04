
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Building, GraduationCap, User } from "lucide-react";
import CompanyCourseCard from "@/components/company/CompanyCourseCard";
import { Podcast } from "@/types";
import { obtenerCursos } from "@/lib/api";

const CompanyDashboard = () => {
  const [courses, setCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const companyName = localStorage.getItem("company") || "Demo";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const allCourses = await obtenerCursos();
        
        // Filter to just a few courses for the demo
        const filteredCourses = allCourses.slice(0, 4);
        
        // Add company specific information and update titles for investment theme
        const companyCourses = filteredCourses.map(course => ({
          ...course,
          title: course.title.includes("Finanzas") ? course.title : 
            course.id.includes("ai") ? "Inteligencia Artificial para Inversiones" :
            course.id.includes("ux") ? "Experiencia de Usuario en Plataformas de Inversión" :
            course.id.includes("startup") ? "Análisis Técnico para Inversiones" : 
            "Fundamentos de Inversión Bursátil",
          description: "Curso especializado para profesionales de " + companyName + ".",
        }));
        
        setCourses(companyCourses);
        setLoading(false);
      } catch (error) {
        console.error('Error loading courses:', error);
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [companyName]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Panel de {companyName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-miyo-100 rounded-full flex items-center justify-center mb-4">
                    <User size={32} className="text-miyo-800 sm:w-10 sm:h-10" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mb-1">{userData.name || "Usuario"}</h2>
                  <p className="text-sm text-gray-500 mb-4 break-all">{userData.email || "usuario@ejemplo.com"}</p>
                  
                  <div className="w-full pt-4 border-t">
                    <div className="flex items-center gap-3 py-2">
                      <Building size={16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Empresa: <strong>{companyName}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 py-2">
                      <GraduationCap size={16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Cursos completados: <strong>0</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="w-full lg:w-3/4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Bienvenido al portal de {companyName}</h1>
            
            <Tabs defaultValue="cursos">
              <TabsList className="mb-6 w-full sm:w-auto">
                <TabsTrigger value="cursos" className="flex-1 sm:flex-none">Cursos</TabsTrigger>
                <TabsTrigger value="progreso" className="flex-1 sm:flex-none">Mi Progreso</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cursos">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <div className="bg-gray-200 aspect-[4/3]"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                          <div className="h-5 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    courses.map((podcast) => (
                      <CompanyCourseCard key={podcast.id} podcast={podcast} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="progreso">
                <div className="rounded-lg border bg-card p-6 sm:p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No hay progreso aún</h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Comienza tomando alguno de nuestros cursos de inversión para ver tu progreso aquí.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
