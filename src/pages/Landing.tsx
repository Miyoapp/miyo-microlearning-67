
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Landing = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with floating elements */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="miyo-container relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Aprende, escucha y</span> <span className="text-miyo-800">crece</span>
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-400 mb-8">
              todo en un solo lugar
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Microaprendizaje a través de podcast para personas ocupadas. Expande tu conocimiento con lecciones de audio breves.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-miyo-700 hover:bg-miyo-800 text-white px-8 py-6 text-lg rounded-xl">
                    Comenzar ahora
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                      <TabsTrigger value="register">Registrarse</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login" className="space-y-4">
                      <DialogHeader>
                        <DialogTitle>Iniciar sesión</DialogTitle>
                        <DialogDescription>
                          Ingresa tus credenciales para acceder a Miyo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="tu@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input id="password" type="password" />
                        </div>
                        <Button type="submit" className="w-full bg-miyo-700 hover:bg-miyo-800">
                          Iniciar sesión
                        </Button>
                        <div className="text-center">
                          <Link to="#" className="text-sm text-miyo-700 hover:underline">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="register" className="space-y-4">
                      <DialogHeader>
                        <DialogTitle>Crear cuenta</DialogTitle>
                        <DialogDescription>
                          Crea tu cuenta para comenzar a aprender en Miyo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input id="name" placeholder="Tu nombre" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input id="register-email" type="email" placeholder="tu@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Contraseña</Label>
                          <Input id="register-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button type="submit" className="w-full bg-miyo-700 hover:bg-miyo-800">
                          Registrarse
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="px-8 py-6 text-lg rounded-xl border-gray-300">
                Ver demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating UI elements */}
        <div className="absolute top-[20%] left-[5%] w-[250px] h-[180px] bg-yellow-100 p-5 rounded-lg shadow-lg transform rotate-[-5deg] opacity-90 hidden md:block">
          <div className="text-gray-800 text-sm font-handwriting">
            <p>"Escucha sobre inversiones mientras vas al trabajo, y aplica lo aprendido ese mismo día"</p>
          </div>
          <div className="absolute bottom-3 right-3 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
        
        <div className="absolute top-[40%] right-[5%] w-[280px] bg-white p-4 rounded-lg shadow-lg transform rotate-[3deg] hidden md:block">
          <div className="mb-3">
            <h4 className="font-bold text-gray-900">Progreso de aprendizaje</h4>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Finanzas Personales</span>
                <span>80%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Mindfulness</span>
                <span>45%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-miyo-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-[10%] left-[15%] w-[220px] bg-white p-4 rounded-lg shadow-lg transform rotate-[7deg] hidden md:block">
          <img src="/lovable-uploads/9b8ba46f-c504-4679-8bf2-ac0c1f38118a.png" alt="Persona escuchando podcast" className="w-full h-auto rounded-lg" />
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmOGY5ZmEiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMzBhMzAgMzAgMCAxMS02MCAwIDMwIDMwIDAgMDE2MCAweiIgc3Ryb2tlPSIjZTllYmVjIiBzdHJva2Utd2lkdGg9Ii41Ii8+PC9nPjwvc3ZnPg==')] opacity-50 z-0" />
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="miyo-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Características de Miyo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre por qué Miyo es la mejor plataforma para el microaprendizaje a través de podcast
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-miyo-100 text-miyo-800 rounded-full flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hourglass"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Aprendizaje eficiente</h3>
              <p className="text-gray-600">
                Lecciones breves y concisas diseñadas para encajar en tu agenda ocupada. 5-10 minutos de contenido valioso y enfocado.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-miyo-100 text-miyo-800 rounded-full flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Expertos en cada tema</h3>
              <p className="text-gray-600">
                Aprende de líderes reconocidos en sus campos. Contenido curado y presentado por expertos de primer nivel.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-miyo-100 text-miyo-800 rounded-full flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headphones"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Aprendizaje flexible</h3>
              <p className="text-gray-600">
                Escucha mientras te desplazas, haces ejercicio o durante descansos. Aprende en cualquier momento y lugar.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="miyo-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cómo funciona</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comenzar tu aprendizaje con Miyo es simple y rápido
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-miyo-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Crea tu cuenta</h3>
              <p className="text-gray-600">
                Regístrate en minutos y personaliza tu perfil de aprendizaje
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-miyo-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Selecciona tus temas</h3>
              <p className="text-gray-600">
                Elige de nuestra amplia biblioteca de temas y cursos disponibles
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-miyo-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Comienza a aprender</h3>
              <p className="text-gray-600">
                Escucha lecciones de 5-10 minutos y aplica lo aprendido inmediatamente
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-miyo-50 bg-opacity-50">
        <div className="miyo-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para comenzar tu viaje de aprendizaje?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Únete a miles de personas que ya están expandiendo sus conocimientos con Miyo
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-miyo-700 hover:bg-miyo-800 text-white px-8 py-6 text-lg rounded-xl">
                  Comenzar ahora
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                    <TabsTrigger value="register">Registrarse</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Iniciar sesión</DialogTitle>
                      <DialogDescription>
                        Ingresa tus credenciales para acceder a Miyo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-2">Email</Label>
                        <Input id="email-2" type="email" placeholder="tu@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-2">Contraseña</Label>
                        <Input id="password-2" type="password" />
                      </div>
                      <Button type="submit" className="w-full bg-miyo-700 hover:bg-miyo-800">
                        Iniciar sesión
                      </Button>
                      <div className="text-center">
                        <Link to="#" className="text-sm text-miyo-700 hover:underline">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Crear cuenta</DialogTitle>
                      <DialogDescription>
                        Crea tu cuenta para comenzar a aprender en Miyo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name-2">Nombre</Label>
                        <Input id="name-2" placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email-2">Email</Label>
                        <Input id="register-email-2" type="email" placeholder="tu@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password-2">Contraseña</Label>
                        <Input id="register-password-2" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password-2">Confirmar contraseña</Label>
                        <Input id="confirm-password-2" type="password" />
                      </div>
                      <Button type="submit" className="w-full bg-miyo-700 hover:bg-miyo-800">
                        Registrarse
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="miyo-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-tight text-miyo-800">MIYO</span>
              </Link>
              <p className="text-gray-600 mt-2">
                Microaprendizaje a través de podcast
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <Link to="/" className="text-gray-600 hover:text-miyo-800">
                Términos de servicio
              </Link>
              <Link to="/" className="text-gray-600 hover:text-miyo-800">
                Política de privacidad
              </Link>
              <Link to="/" className="text-gray-600 hover:text-miyo-800">
                Contacto
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
