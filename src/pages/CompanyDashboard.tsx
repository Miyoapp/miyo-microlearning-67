
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, BarChart, Users } from "lucide-react";
import { podcasts } from "@/data/podcasts";
import PodcastCard from "@/components/PodcastCard";

// Simulate fetching company-specific courses
const getCompanyCourses = () => {
  // Just use existing podcasts but limit and modify them to fit the finance theme
  return podcasts.slice(0, 4).map((podcast, index) => ({
    ...podcast,
    title: index === 0 
      ? "Fundamentos de Inversión en Bolsa" 
      : index === 1 
        ? "Análisis Técnico para Principiantes" 
        : index === 2 
          ? "Gestión de Riesgos en Inversiones" 
          : "Finanzas Personales e Inversión",
    category: { ...podcast.category, nombre: "Finanzas" }
  }));
};

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const companyName = localStorage.getItem("company");
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    if (companyName) {
      setCompany(companyName);
    }
    
    // Get courses data
    setCourses(getCompanyCourses());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="miyo-container py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-miyo-800 mr-2">MIYO</div>
            <div className="px-3 py-1 rounded bg-miyo-100 text-miyo-800 text-sm font-medium">
              {company.charAt(0).toUpperCase() + company.slice(1)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Hola, <span className="font-medium">{user?.name || 'Usuario'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Salir
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="miyo-container py-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Bienvenido a Demo</h1>
          <p className="text-lg text-gray-600 max-w-4xl">
            Democratizando las inversiones en bolsa en Latinoamérica a través del conocimiento. 
            Explora nuestros cursos diseñados específicamente para ayudarte a capacitar a tus clientes sobre finanzas e inversiones.
          </p>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Disponibles</CardTitle>
              <BookOpen className="h-4 w-4 text-miyo-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
              <BarChart className="h-4 w-4 text-miyo-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-miyo-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Courses section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cursos de Inversión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <PodcastCard key={course.id} podcast={course} />
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="miyo-container text-center">
          <p className="text-gray-600 text-sm">
            © 2023 MIYO para Demo. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CompanyDashboard;
