
import React, { useState, useMemo } from 'react';
import { useAllActionPlans, EnrichedActionPlan } from '@/hooks/useAllActionPlans';
import ActionPlansHeader from './ActionPlansHeader';
import ActionPlansFilters, { FilterType } from './ActionPlansFilters';
import CategoryGroup from './CategoryGroup';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ActionPlansList = () => {
  const { actionPlans, loading, toggleComplete, deleteActionPlan } = useAllActionPlans();
  const [activeFilter, setActiveFilter] = useState<FilterType>('Por Categoría');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter and group action plans
  const filteredAndGroupedData = useMemo(() => {
    // First apply search filter
    let filtered = actionPlans.filter(plan => 
      plan.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.summary_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then group by active filter
    if (activeFilter === 'Por Categoría') {
      const grouped = filtered.reduce((acc, plan) => {
        const key = plan.category_name;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            icon: plan.category_icon || '📚',
            plans: []
          };
        }
        acc[key].plans.push(plan);
        return acc;
      }, {} as Record<string, { name: string; icon: string; plans: EnrichedActionPlan[] }>);

      return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    } 
    else if (activeFilter === 'Por Curso') {
      const grouped = filtered.reduce((acc, plan) => {
        const key = plan.course_title;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            icon: plan.category_icon || '📚',
            plans: []
          };
        }
        acc[key].plans.push(plan);
        return acc;
      }, {} as Record<string, { name: string; icon: string; plans: EnrichedActionPlan[] }>);

      return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    } 
    else { // Cronológico
      return [{
        name: 'Todos los planes de acción',
        icon: '🎯',
        plans: filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }];
    }
  }, [actionPlans, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="bg-white p-6 rounded-2xl">
          <div className="flex gap-3 mb-5">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (actionPlans.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <div className="text-6xl mb-6 opacity-50">🎯</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Aún no tienes planes de acción
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Completa cursos y crea resúmenes personalizados con planes de acción para construir tu lista de objetivos por alcanzar.
        </p>
        <Button 
          onClick={() => navigate('/dashboard/discover')}
          className="bg-gradient-to-r from-miyo-600 to-miyo-700 hover:from-miyo-700 hover:to-miyo-800"
        >
          Explorar Cursos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ActionPlansHeader planCount={actionPlans.length} />
      
      <ActionPlansFilters 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="space-y-6">
        {filteredAndGroupedData.map((group, index) => (
          <CategoryGroup 
            key={`${group.name}-${index}`}
            category={group}
            actionPlans={group.plans}
            onToggleComplete={toggleComplete}
            onDelete={deleteActionPlan}
          />
        ))}
      </div>

      {filteredAndGroupedData.length === 0 && searchQuery && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <div className="text-4xl mb-4 opacity-50">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron planes de acción
          </h3>
          <p className="text-gray-600">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionPlansList;
