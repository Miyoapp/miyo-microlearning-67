import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { X, Edit2, Plus, Trash2, Check } from 'lucide-react';
import { CourseSummary, ActionPlanItem } from '@/types/notes';
import { useSummaries } from '@/hooks/useSummaries';

interface ViewSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: CourseSummary;
}

const ViewSummaryModal: React.FC<ViewSummaryModalProps> = ({
  isOpen,
  onClose,
  summary
}) => {
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);
  const [newActionPlan, setNewActionPlan] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const { fetchActionPlanItems, updateActionPlanItem, deleteActionPlanItem } = useSummaries();

  useEffect(() => {
    if (isOpen && summary.id) {
      loadActionPlans();
    }
  }, [isOpen, summary.id]);

  const loadActionPlans = async () => {
    const items = await fetchActionPlanItems(summary.id);
    setActionPlans(items);
  };

  const handleToggleComplete = async (item: ActionPlanItem) => {
    await updateActionPlanItem(item.id, { is_completed: !item.is_completed });
    setActionPlans(prev => 
      prev.map(p => p.id === item.id ? { ...p, is_completed: !p.is_completed } : p)
    );
  };

  const handleAddActionPlan = async () => {
    if (!newActionPlan.trim()) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('action_plan_items')
        .insert({
          summary_id: summary.id,
          text: newActionPlan.trim(),
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setActionPlans(prev => [...prev, data]);
      setNewActionPlan('');
    } catch (error) {
      console.error('Error adding action plan:', error);
    }
  };

  const handleStartEdit = (item: ActionPlanItem) => {
    setEditingItem(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingText.trim()) return;

    await updateActionPlanItem(editingItem, { text: editingText.trim() });
    setActionPlans(prev => 
      prev.map(p => p.id === editingItem ? { ...p, text: editingText.trim() } : p)
    );
    setEditingItem(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingText('');
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteActionPlanItem(itemId);
    setActionPlans(prev => prev.filter(p => p.id !== itemId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            {summary.title}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Concepts */}
          {summary.key_concepts && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Conceptos clave que aprendí</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{summary.key_concepts}</p>
              </div>
            </div>
          )}

          {/* Personal Insight */}
          {summary.personal_insight && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Mi gran insight personal</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{summary.personal_insight}</p>
              </div>
            </div>
          )}

          {/* Action Plans */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Planes de Acción</h3>
            
            {/* Existing Action Plans */}
            <div className="space-y-2">
              {actionPlans.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={() => handleToggleComplete(item)}
                  />
                  
                  {editingItem === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className={`flex-1 ${item.is_completed ? 'line-through text-gray-500' : ''}`}
                      >
                        {item.text}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Action Plan */}
            <div className="flex gap-2">
              <Input
                value={newActionPlan}
                onChange={(e) => setNewActionPlan(e.target.value)}
                placeholder="Agregar nuevo plan de acción..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddActionPlan();
                }}
              />
              <Button onClick={handleAddActionPlan} disabled={!newActionPlan.trim()}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-[#5e16ea] hover:bg-[#4a11ba]">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSummaryModal;
