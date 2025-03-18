
export interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export const StepCard = ({ number, title, description }: StepCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-miyo-100 text-miyo-800 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
