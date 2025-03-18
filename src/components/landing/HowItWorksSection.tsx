
import { UserPlus, List, Play } from 'lucide-react';

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Step = ({ number, icon, title, description }: StepProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-miyo-100 text-miyo-800">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-miyo-800 text-white text-sm font-bold">
          {number}
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 max-w-xs">{description}</p>
    </div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <UserPlus size={24} />,
      title: "Regístrate",
      description: "Crea tu cuenta en menos de un minuto y accede a todos nuestros contenidos."
    },
    {
      icon: <List size={24} />,
      title: "Elige tus temas",
      description: "Selecciona los temas que más te interesan de nuestro amplio catálogo."
    },
    {
      icon: <Play size={24} />,
      title: "Comienza a aprender",
      description: "Dedica 5-10 minutos diarios y notarás resultados en pocas semanas."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="miyo-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cómo Funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comenzar tu viaje de aprendizaje con Miyo es muy sencillo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {steps.map((step, index) => (
            <Step 
              key={index}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
