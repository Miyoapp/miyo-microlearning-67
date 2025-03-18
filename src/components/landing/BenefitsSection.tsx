
import { Clock, Target, Award, Users } from 'lucide-react';

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Benefit = ({ icon, title, description }: BenefitProps) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-miyo-100 rounded-full text-miyo-800 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Clock size={24} />,
      title: "Aprende en cualquier momento",
      description: "Convierte tiempos muertos en oportunidades de aprendizaje. Escucha mientras viajas, haces ejercicio o cocinas."
    },
    {
      icon: <Target size={24} />,
      title: "Contenido conciso y enfocado",
      description: "Lecciones de 5-10 minutos diseñadas para maximizar la retención y aplicación práctica."
    },
    {
      icon: <Award size={24} />,
      title: "Expertos en cada tema",
      description: "Contenido creado por profesionales con amplia experiencia en sus áreas de especialización."
    },
    {
      icon: <Users size={24} />,
      title: "Aprende a tu ritmo",
      description: "Flexibilidad total para adaptar tu aprendizaje a tu estilo de vida, sin presiones ni plazos."
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="miyo-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Beneficios
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre por qué Miyo es la forma ideal de seguir aprendiendo sin sacrificar tu valioso tiempo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Benefit 
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
