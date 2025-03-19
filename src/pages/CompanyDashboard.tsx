
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
import { Building, GraduationCap, User, TrendingUp, BarChart } from "lucide-react";
import CompanyCourseCard from "@/components/company/CompanyCourseCard";
import { Podcast } from "@/types";
import { obtenerCursos } from "@/lib/api";

const CompanyDashboard = () => {
  const [courses, setCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const companyName = localStorage.getItem("company") || "Inversiones Demo";

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
            course.id.includes("ux") ? "Estrategias para Inversión Bursátil" :
            course.id.includes("startup") ? "Análisis Técnico para Inversiones" : 
            "Fundamentos de Inversión",
          description: "Curso especializado en inversiones para clientes de " + companyName + ".",
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
              <BreadcrumbPage>Portal de Inversiones de {companyName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-miyo-100 rounded-full flex items-center justify-center mb-4">
                    <User size={40} className="text-miyo-800" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{userData.name || "Inversionista"}</h2>
                  <p className="text-sm text-gray-500 mb-4">{userData.email || "inversionista@ejemplo.com"}</p>
                  
                  <div className="w-full pt-4 border-t">
                    <div className="flex items-center gap-3 py-2">
                      <Building size={18} className="text-gray-500" />
                      <span className="text-sm">Empresa: <strong>{companyName}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 py-2">
                      <GraduationCap size={18} className="text-gray-500" />
                      <span className="text-sm">Cursos completados: <strong>0</strong></span>
                    </div>
                    <div className="flex items-center gap-3 py-2">
                      <TrendingUp size={18} className="text-gray-500" />
                      <span className="text-sm">Rendimiento: <strong>+12.4%</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-3/4">
            <h1 className="text-3xl font-bold mb-8">Bienvenido al portal de inversiones</h1>
            
            <Tabs defaultValue="cursos">
              <TabsList className="mb-6">
                <TabsTrigger value="cursos">Cursos de Inversión</TabsTrigger>
                <TabsTrigger value="progreso">Mi Portafolio</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cursos">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <div className="bg-gray-200 aspect-video"></div>
                        <CardContent className="p-4">
                          <div className="h-5 bg-gray-200 rounded mb-4 w-1/3"></div>
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
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
                <div className="rounded-lg border bg-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Resumen de inversiones</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      +12.4% este mes
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center">
                        <BarChart className="text-blue-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Acciones diversificadas</h4>
                          <p className="text-sm text-gray-500">60% de su portafolio</p>
                        </div>
                        <span className="ml-auto text-green-600 font-semibold">+8.2%</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center">
                        <TrendingUp className="text-purple-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Bonos corporativos</h4>
                          <p className="text-sm text-gray-500">25% de su portafolio</p>
                        </div>
                        <span className="ml-auto text-green-600 font-semibold">+3.5%</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center">
                        <Building className="text-amber-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Bienes raíces</h4>
                          <p className="text-sm text-gray-500">15% de su portafolio</p>
                        </div>
                        <span className="ml-auto text-red-600 font-semibold">-1.8%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center text-sm text-gray-500">
                    Complete nuestros cursos de inversión para mejorar sus estrategias y rendimientos
                  </div>
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
