import React, { useState } from 'react';
import { useAllActionPlansOptimized } from '@/hooks/useAllActionPlansOptimized';
import ActionPlansHeader from './ActionPlansHeader';
import ActionPlanCard from './ActionPlanCard';
import CategoryGroup from './CategoryGroup';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const ActionPlansListOptimized = () => {
  const { actionPlans, loading, toggleComplete, deleteActionPlan } = useAllActionPlansOptimized();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter action plans based on search
  const filteredActionPlans = actionPlans.filter(plan => 
    plan.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (actionPlans.length === 0) {
    return (
      <div className="space-y-6">
        <ActionPlansHeader planCount={0} />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">Aún no tienes planes de acción</h3>
          <p className="text-gray-600 mb-6">
            Completa un curso y crea tu primer resumen para generar planes de acción
          </p>
        </div>
      </div>
    );
  }

  // Group action plans by category
  const plansByCategory = filteredActionPlans.reduce((acc, plan) => {
    if (!acc[plan.category_name]) {
      acc[plan.category_name] = [];
    }
    acc[plan.category_name].push(plan);
    return acc;
  }, {} as Record<string, typeof filteredActionPlans>);

  return (
    <div className="space-y-6">
      <ActionPlansHeader planCount={actionPlans.length} />
      
      <div className="space-y-4">
        <Input
          placeholder="Buscar planes de acción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(plansByCategory).map(([categoryName, plans]) => (
          <CategoryGroup
            key={categoryName}
            category={{ name: categoryName, icon: '📚' }}
            actionPlans={plans}
            onToggleComplete={toggleComplete}
            onDelete={deleteActionPlan}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionPlansListOptimized;