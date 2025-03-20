
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
}

const StepCard = ({ icon, title, description, step }: StepCardProps) => {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-miyo-700 bg-miyo-50 px-3 py-1 rounded-full mb-4">
            Paso {step}
          </span>
          <div className="mb-4 p-3 bg-miyo-100 rounded-full">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepCard;
