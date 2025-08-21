
import React from 'react';
import { EnrichedActionPlan } from '@/hooks/useAllActionPlans';
import ActionPlanCard from './ActionPlanCard';

interface CategoryGroupProps {
  category: {
    name: string;
    icon: string;
  };
  actionPlans: EnrichedActionPlan[];
  onToggleComplete: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ 
  category, 
  actionPlans, 
  onToggleComplete, 
  onDelete 
}) => {
  const completedPlans = actionPlans.filter(plan => plan.is_completed).length;
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {category.icon} {category.name}
        </div>
        <div className="text-sm text-gray-600">
          {actionPlans.length} {actionPlans.length === 1 ? 'plan' : 'planes'} 
          {completedPlans > 0 && (
            <span className="text-green-600 ml-2">
              ({completedPlans} completado{completedPlans !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>
      
      <div>
        {actionPlans.map(actionPlan => (
          <ActionPlanCard 
            key={actionPlan.id} 
            actionPlan={actionPlan} 
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryGroup;
