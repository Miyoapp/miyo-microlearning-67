
import { useState } from 'react';
import { CategoryModel } from '../types';

interface CategoryFilterProps {
  categories: CategoryModel[];
  selectedCategory: CategoryModel | null;
  onSelectCategory: (category: CategoryModel | null) => void;
}

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) => {
  return (
    <div className="mb-8 animate-fade-in">
      <h3 className="text-lg font-medium text-gray-700 mb-3">Filter by category</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-miyo-800 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory?.id === category.id
                ? 'bg-miyo-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
