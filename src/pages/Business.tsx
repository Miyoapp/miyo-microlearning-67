
import { useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Business = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="miyo-container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-miyo-800 mb-6">MIYO for Business</h1>
            <p className="text-xl text-gray-600 mb-12">
              Potencia el desarrollo profesional de tu equipo con contenido educativo de alta calidad
            </p>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-10">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-8 w-full justify-start border-b border-gray-200 pb-0">
                  <TabsTrigger value="overview" className="pb-3 data-[state=active]:border-b-2 data-[state=active]:border-miyo-800 rounded-none">
                    Información General
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="pb-3 data-[state=active]:border-b-2 data-[state=active]:border-miyo-800 rounded-none">
                    Precios
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="pb-3 data-[state=active]:border-b-2 data-[state=active]:border-miyo-800 rounded-none">
                    Contacto
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold text-miyo-800 mb-4">Aprende al ritmo de tu empresa</h2>
                    <p className="text-gray-600 mb-6">
                      MIYO for Business ofrece cursos de audio diseñados específicamente para empresas que buscan mejorar
                      las habilidades de sus equipos sin comprometer su tiempo de trabajo.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-miyo-800 mb-3">Aprendizaje eficiente</h3>
                        <p className="text-gray-600">
                          Cursos en formato de audio que permiten a tus empleados aprender mientras realizan otras actividades.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-miyo-800 mb-3">Contenido de calidad</h3>
                        <p className="text-gray-600">
                          Creado por expertos en diversas áreas como negocios, tecnología, productividad y desarrollo personal.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-miyo-800 mb-3">Seguimiento de progreso</h3>
                        <p className="text-gray-600">
                          Panel administrativo para supervisar el avance de tu equipo y medir el impacto del aprendizaje.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-miyo-800 mb-3">Contenido personalizado</h3>
                        <p className="text-gray-600">
                          Posibilidad de crear cursos específicos para las necesidades de tu empresa.
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold text-miyo-800 mb-4">Empresas que confían en nosotros</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-6">
                      <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">Logo 1</div>
                      <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">Logo 2</div>
                      <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">Logo 3</div>
                      <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">Logo 4</div>
                    </div>
                  </section>
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold text-miyo-800 mb-6">Planes adaptados a tu empresa</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                        <h3 className="text-xl font-bold text-miyo-800 mb-2">Básico</h3>
                        <p className="text-gray-600 mb-4">Para equipos pequeños</p>
                        <div className="text-3xl font-bold text-miyo-800 mb-4">€29<span className="text-lg font-normal text-gray-500">/usuario/mes</span></div>
                        <ul className="space-y-3 mb-8 flex-grow">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Acceso a 20 cursos</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Seguimiento básico</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Soporte por email</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-miyo-800 hover:bg-miyo-700">Empezar prueba</Button>
                      </div>
                      
                      <div className="border-2 border-miyo-800 rounded-lg p-6 flex flex-col relative">
                        <div className="absolute top-0 right-0 bg-miyo-800 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">Popular</div>
                        <h3 className="text-xl font-bold text-miyo-800 mb-2">Profesional</h3>
                        <p className="text-gray-600 mb-4">Para equipos medianos</p>
                        <div className="text-3xl font-bold text-miyo-800 mb-4">€49<span className="text-lg font-normal text-gray-500">/usuario/mes</span></div>
                        <ul className="space-y-3 mb-8 flex-grow">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Acceso a todos los cursos</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Seguimiento avanzado</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Soporte prioritario</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Reportes mensuales</span>
                          </li>
                        </ul>
                        <Button className="w-full">Empezar prueba</Button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                        <h3 className="text-xl font-bold text-miyo-800 mb-2">Empresarial</h3>
                        <p className="text-gray-600 mb-4">Para grandes organizaciones</p>
                        <div className="text-3xl font-bold text-miyo-800 mb-4">Personalizado</div>
                        <ul className="space-y-3 mb-8 flex-grow">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Todo lo del plan Profesional</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Contenido personalizado</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Implementación dedicada</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Gestión de cuentas</span>
                          </li>
                        </ul>
                        <Button variant="outline" className="w-full border-miyo-800 text-miyo-800 hover:bg-miyo-50">Contactar ventas</Button>
                      </div>
                    </div>
                    
                    <div className="mt-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-bold text-miyo-800 mb-4">¿Necesitas un plan personalizado?</h3>
                      <p className="text-gray-600 mb-6">
                        Contáctanos para crear un plan adaptado a las necesidades específicas de tu empresa.
                      </p>
                      <Button>Hablar con ventas</Button>
                    </div>
                  </section>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold text-miyo-800 mb-6">Contacta con nosotros</h2>
                    
                    <div className="grid md:grid-cols-2 gap-12">
                      <div>
                        <p className="text-gray-600 mb-8">
                          Completa el formulario y un representante de nuestro equipo se pondrá en contacto contigo
                          en las próximas 24 horas para discutir cómo MIYO puede ayudar a tu empresa.
                        </p>
                        
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                            <Input id="name" className="w-full" placeholder="Tu nombre" />
                          </div>
                          
                          <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                            <Input id="company" className="w-full" placeholder="Nombre de tu empresa" />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email corporativo</label>
                            <Input id="email" type="email" className="w-full" placeholder="tu@empresa.com" />
                          </div>
                          
                          <div>
                            <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">Tamaño del equipo</label>
                            <select id="teamSize" className="w-full rounded-md border border-input bg-background px-3 py-2 text-base">
                              <option value="">Seleccionar...</option>
                              <option value="1-10">1-10 empleados</option>
                              <option value="11-50">11-50 empleados</option>
                              <option value="51-200">51-200 empleados</option>
                              <option value="201-500">201-500 empleados</option>
                              <option value="501+">Más de 500 empleados</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                            <textarea 
                              id="message" 
                              rows={4} 
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                              placeholder="Cuéntanos lo que necesitas"
                            ></textarea>
                          </div>
                          
                          <Button className="w-full md:w-auto">Enviar solicitud</Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-8 rounded-lg">
                        <h3 className="text-xl font-bold text-miyo-800 mb-6">Otros canales de contacto</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Email de ventas</h4>
                            <p className="text-miyo-800">empresas@miyo.com</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Teléfono</h4>
                            <p className="text-miyo-800">+34 911 23 45 67</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Horario de atención</h4>
                            <p className="text-gray-600">Lunes a Viernes: 9:00 - 18:00 (CET)</p>
                          </div>
                        </div>
                        
                        <div className="mt-10">
                          <h4 className="font-semibold text-gray-800 mb-3">Preguntas frecuentes</h4>
                          <Menubar className="border-none bg-transparent p-0">
                            <MenubarMenu>
                              <MenubarTrigger className="w-full justify-between bg-white border border-gray-200 mb-2 py-3">
                                ¿Cómo funciona el periodo de prueba?
                              </MenubarTrigger>
                              <MenubarContent>
                                <MenubarItem className="text-sm">
                                  Ofrecemos un periodo de prueba de 14 días con acceso completo a todas las funcionalidades.
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                          
                          <Menubar className="border-none bg-transparent p-0">
                            <MenubarMenu>
                              <MenubarTrigger className="w-full justify-between bg-white border border-gray-200 mb-2 py-3">
                                ¿Puedo cancelar mi suscripción?
                              </MenubarTrigger>
                              <MenubarContent>
                                <MenubarItem className="text-sm">
                                  Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones.
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                          
                          <Menubar className="border-none bg-transparent p-0">
                            <MenubarMenu>
                              <MenubarTrigger className="w-full justify-between bg-white border border-gray-200 py-3">
                                ¿Ofrecen descuentos por volumen?
                              </MenubarTrigger>
                              <MenubarContent>
                                <MenubarItem className="text-sm">
                                  Sí, ofrecemos descuentos especiales basados en el número de usuarios que necesites.
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                        </div>
                      </div>
                    </div>
                  </section>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-12">
        <div className="miyo-container">
          <div className="text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} MIYO for Business. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Business;
