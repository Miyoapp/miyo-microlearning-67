
import React from 'react';
import { EnrichedActionPlan } from '@/hooks/useAllActionPlans';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ActionPlanCardProps {
  actionPlan: EnrichedActionPlan;
  onToggleComplete: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
}

const ActionPlanCard: React.FC<ActionPlanCardProps> = ({
  actionPlan,
  onToggleComplete,
  onDelete
}) => {
  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plan de acción?')) {
      onDelete(actionPlan.id);
    }
  };

  return (
    <div className="p-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Checkbox
            checked={actionPlan.is_completed}
            onCheckedChange={() => onToggleComplete(actionPlan.id, actionPlan.is_completed)}
            className="mt-1 h-5 w-5"
          />
          
          <div className="flex-1 space-y-3">
            <div className={`text-base ${actionPlan.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {actionPlan.text}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>📚</span>
                <span>{actionPlan.course_title}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <span>🏷️</span>
                <span>{actionPlan.category_name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <span>📋</span>
                <span>{actionPlan.summary_title}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              Creado el {new Date(actionPlan.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ActionPlanCard;
