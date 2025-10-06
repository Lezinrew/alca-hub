import React from 'react';
import { Button } from './ui/button';

const CategoryFilterButtons = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  className = "flex gap-2 overflow-x-auto pb-2"
}) => {
  return (
    <div className={className}>
      {categories.map(category => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onCategorySelect(category)}
          className={`whitespace-nowrap transition-all duration-200 ${
            selectedCategory === category 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
              : 'hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilterButtons;
