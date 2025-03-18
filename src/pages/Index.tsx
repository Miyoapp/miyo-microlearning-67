
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import PodcastCard from '../components/PodcastCard';
import { Podcast, CategoryModel } from '../types';
import { obtenerCursos, obtenerCategorias } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, Clock, Zap, Brain, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState<Podcast[]>([]);
  const [popularPodcasts, setPopularPodcasts] = useState<Podcast[]>([]);
  const [newPodcasts, setNewPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Cargar datos desde Supabase
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        // Cargar categorías y cursos en paralelo
        const [categoriasData, cursosData] = await Promise.all([
          obtenerCategorias(),
          obtenerCursos()
        ]);
        
        setCategories(categoriasData);
        setPodcasts(cursosData);
        setFilteredPodcasts(cursosData);
        
        // Crear subconjuntos para los carruseles
        // Para este ejemplo, simplemente usamos el mismo conjunto pero en producción
        // esto se basaría en métricas reales como tendencias, popularidad, etc.
        setTrendingPodcasts(shuffleArray([...cursosData]).slice(0, 8));
        setPopularPodcasts(shuffleArray([...cursosData]).slice(0, 8));
        setNewPodcasts(shuffleArray([...cursosData]).slice(0, 8));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    cargarDatos();
  }, [toast]);
  
  // Función auxiliar para mezclar array
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Filter podcasts when category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredPodcasts(podcasts.filter(podcast => podcast.category.id === selectedCategory.id));
    } else {
      setFilteredPodcasts(podcasts);
    }
  }, [selectedCategory, podcasts]);
  
  // Simulate loading for smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
        <div className="miyo-container">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 max-w-3xl">
              <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
                Aprende en cualquier momento y lugar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-slide-down">
                Microaprendizaje, <span className="text-miyo-800">impacto macro</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 animate-slide-up">
                Expande tu conocimiento con lecciones de audio breves diseñadas para personas ocupadas. Aprende de expertos en minutos al día.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
                <Button size="lg" className="bg-miyo-800 hover:bg-miyo-700">
                  Comenzar Ahora
                </Button>
                <Button size="lg" variant="outline">
                  Ver Demo
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1616598814158-21668e45f1b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="Persona escuchando podcast" 
                className="rounded-2xl shadow-lg animate-fade-in max-w-sm object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Explicación del producto */}
      <section className="py-20 bg-white">
        <div className="miyo-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Qué es MIYO?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              MIYO es una plataforma de microaprendizaje mediante podcasts educativos. 
              Transformamos complejos conceptos en lecciones compactas de audio que puedes 
              consumir en cualquier momento del día, optimizando tu tiempo y maximizando tu aprendizaje.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-md transition-shadow">
              <div className="bg-miyo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-miyo-800" />
              </div>
              <h3 className="text-xl font-bold mb-3">Optimiza tu tiempo</h3>
              <p className="text-gray-600">Lecciones breves de 5-15 minutos diseñadas para encajar en cualquier momento de tu día.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-md transition-shadow">
              <div className="bg-miyo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-miyo-800" />
              </div>
              <h3 className="text-xl font-bold mb-3">Conocimiento experto</h3>
              <p className="text-gray-600">Contenido creado por profesionales líderes en sus campos, garantizando calidad y relevancia.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-md transition-shadow">
              <div className="bg-miyo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-miyo-800" />
              </div>
              <h3 className="text-xl font-bold mb-3">Aprendizaje efectivo</h3>
              <p className="text-gray-600">Metodología basada en microaprendizaje que mejora la retención y aplicación del conocimiento.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Cómo funciona */}
      <section className="py-20 bg-gray-50">
        <div className="miyo-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Cómo funciona</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Diseñado para adaptarse a tu vida, no al revés. Aprende a tu ritmo y en tus términos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-miyo-800 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Regístrate</h3>
              <p className="text-gray-600">Crea tu cuenta y explora nuestro catálogo de podcasts educativos.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-miyo-800 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Elige tu contenido</h3>
              <p className="text-gray-600">Selecciona cursos basados en tus intereses y objetivos de aprendizaje.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-miyo-800 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Escucha y aprende</h3>
              <p className="text-gray-600">Consume el contenido en cualquier momento, incluso sin conexión.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-miyo-800 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">4</div>
              <h3 className="text-xl font-semibold mb-3">Aplica y crece</h3>
              <p className="text-gray-600">Pon en práctica lo aprendido y avanza a tu propio ritmo.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Carrusel: Tendencias actuales */}
      <section className="py-16 bg-white">
        <div className="miyo-container">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Tendencias actuales</h2>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full mb-16"
          >
            <CarouselContent>
              {trendingPodcasts.map((podcast) => (
                <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <PodcastCard podcast={podcast} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="relative static" />
              <CarouselNext className="relative static" />
            </div>
          </Carousel>
        </div>
      </section>
      
      {/* Carrusel: Más escuchados */}
      <section className="py-16 bg-gray-50">
        <div className="miyo-container">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Más escuchados</h2>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full mb-16"
          >
            <CarouselContent>
              {popularPodcasts.map((podcast) => (
                <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <PodcastCard podcast={podcast} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="relative static" />
              <CarouselNext className="relative static" />
            </div>
          </Carousel>
        </div>
      </section>
      
      {/* Carrusel: Recién agregados */}
      <section className="py-16 bg-white">
        <div className="miyo-container">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recién agregados</h2>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full mb-16"
          >
            <CarouselContent>
              {newPodcasts.map((podcast) => (
                <CarouselItem key={podcast.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <PodcastCard podcast={podcast} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="relative static" />
              <CarouselNext className="relative static" />
            </div>
          </Carousel>
        </div>
      </section>
      
      {/* Beneficios adicionales - Testimonios */}
      <section className="py-20 bg-gray-50">
        <div className="miyo-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Lo que nuestros usuarios dicen</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Descubre cómo MIYO está transformando la forma en que las personas aprenden
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Award key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">
                    "MIYO ha revolucionado mi rutina de aprendizaje. Puedo aprender nuevas habilidades mientras camino al trabajo o mientras espero en la fila del supermercado."
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">María González</p>
                    <p className="text-sm text-gray-500">Profesional de Marketing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Award key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">
                    "Las lecciones cortas pero impactantes me han permitido adquirir conocimientos valiosos sin sentir que estoy dedicando demasiado tiempo."
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">Carlos Rodríguez</p>
                    <p className="text-sm text-gray-500">Emprendedor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Award key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">
                    "Como profesional ocupada, MIYO me ha permitido continuar aprendiendo sin sacrificar tiempo con mi familia. El formato de audio es perfecto para mi estilo de vida."
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">Ana Torres</p>
                    <p className="text-sm text-gray-500">Gerente de Proyectos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-miyo-800 text-white">
        <div className="miyo-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para transformar tu aprendizaje?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Únete a miles de personas que están expandiendo su conocimiento en minutos al día.
          </p>
          <Button size="lg" className="bg-white text-miyo-800 hover:bg-gray-100">
            Comenzar ahora
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="miyo-container">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
