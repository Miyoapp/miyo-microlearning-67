import React from 'react';
import { motion } from 'framer-motion';
import { Route, NotebookPen, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePerformanceOptimization, getMotionProps } from '@/hooks/usePerformanceOptimization';

const steps = [
  {
    id: 1,
    icon: Route,
    title: 'Seguir rutas de aprendizaje',
    description: 'Explora cursos en audio guiados por expertos, diseñados para llevarte paso a paso hacia tus objetivos de crecimiento personal.',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    icon: NotebookPen,
    title: 'Tomar notas personalizadas',
    description: 'Captura las ideas más valiosas mientras aprendes. Crea tu biblioteca personal de conocimiento que realmente importa.',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    icon: FileText,
    title: 'Generar resúmenes inteligentes',
    description: 'Transforma tus notas en resúmenes concisos que condensan las ideas principales y te ayudan a recordarlas fácilmente.',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    icon: Target,
    title: 'Crear planes de acción',
    description: 'Convierte el conocimiento en pasos concretos y aplicables para tu día a día. La teoría se vuelve práctica.',
    gradient: 'from-orange-500 to-orange-600'
  }
];

const UpdatedHowItWorksOptimized: React.FC = () => {
  const config = usePerformanceOptimization();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: config.reduceAnimations ? 0.1 : 0.2,
        delayChildren: config.reduceAnimations ? 0.1 : 0.3
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: config.reduceAnimations ? 10 : 30 },
    visible: { opacity: 1, y: 0 }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: config.reduceAnimations ? 10 : 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <motion.div 
        className="miyo-container"
        {...getMotionProps({
          variants: containerVariants,
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: "-100px" }
        }, config)}
      >
        <div className="max-w-6xl mx-auto">
          {/* Título principal */}
          <motion.div 
            className="text-center mb-16"
            {...getMotionProps({
              variants: titleVariants,
              transition: { duration: config.reduceAnimations ? 0.3 : 0.6 }
            }, config)}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un sistema completo para transformar el aprendizaje en audio en crecimiento personal real y duradero
            </p>
          </motion.div>

          {/* Timeline de pasos */}
          <div className="relative">
            {/* Línea conectora - solo visible en desktop */}
            {!config.simplifyEffects && (
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-miyo-200 to-miyo-400 transform -translate-x-1/2" />
            )}

            {/* Grid de pasos */}
            <div className="space-y-12 lg:space-y-16">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  {...getMotionProps({
                    variants: stepVariants,
                    transition: { duration: config.reduceAnimations ? 0.3 : 0.6 }
                  }, config)}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Contenido */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`${config.simplifyEffects ? 'bg-white border' : 'glass'} rounded-2xl p-8 hover:bg-white/70 transition-all duration-300 group`}>
                      <div className="flex items-center justify-center lg:justify-start mb-6">
                        <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl text-white shadow-lg ${!config.reduceAnimations ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                          <step.icon className="w-8 h-8" />
                          {/* Número de paso */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-miyo-800 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {step.id}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-miyo-800 transition-colors duration-300">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                      
                      {/* Checkmark */}
                      <div className="mt-6 flex items-center justify-center lg:justify-start">
                        <div className="flex items-center text-green-600 font-medium">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          Incluido en tu experiencia
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Punto central en la línea - solo visible en desktop y no en mobile */}
                  {!config.simplifyEffects && (
                    <div className="hidden lg:block relative">
                      <motion.div
                        className="w-4 h-4 bg-miyo-800 rounded-full shadow-lg"
                        {...getMotionProps({
                          whileHover: { scale: 1.5 },
                          transition: { type: "spring", stiffness: 300 }
                        }, config)}
                      />
                      <div className="absolute inset-0 w-4 h-4 bg-miyo-400 rounded-full animate-ping opacity-30" />
                    </div>
                  )}

                  {/* Espacio para mantener simetría */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-16"
            {...getMotionProps({
              variants: stepVariants,
              transition: { duration: config.reduceAnimations ? 0.3 : 0.6 }
            }, config)}
          >
            <Button 
              size="lg" 
              className="bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-4 h-auto text-lg font-medium" 
              onClick={() => window.location.href = '/login?mode=signup'}
            >
              🎧 Explorar cursos
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default UpdatedHowItWorksOptimized;