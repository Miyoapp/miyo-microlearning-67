
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "MIYO ha transformado mi rutina diaria. Ahora aprovecho mi trayecto al trabajo para aprender algo nuevo cada día.",
    author: "Ana García",
    role: "Profesional de Marketing",
    avatar: ""
  },
  {
    quote: "Como director de formación, MIYO nos ha permitido convertir nuestros manuales en contenido de audio accesible para todo el equipo.",
    author: "Carlos Martínez",
    role: "Director de RR.HH",
    avatar: ""
  },
  {
    quote: "La calidad del contenido y la flexibilidad del formato de audio han hecho de MIYO mi plataforma de aprendizaje favorita.",
    author: "Laura Rodríguez",
    role: "Emprendedora",
    avatar: ""
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-gray-50 sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que dicen nuestros usuarios</h2>
          <p className="text-lg text-gray-600">
            Descubre cómo MIYO está transformando la forma en que las personas y empresas aprenden.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-100 shadow-sm hover:shadow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <p className="text-gray-700 mb-6 italic flex-grow">"{testimonial.quote}"</p>
                  <div className="flex items-center mt-auto">
                    <Avatar className="h-10 w-10 mr-3">
                      {testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      ) : (
                        <AvatarFallback className="bg-miyo-100 text-miyo-800">
                          {testimonial.author.split(' ').map(name => name[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
