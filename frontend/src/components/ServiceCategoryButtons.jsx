import React from 'react';
import { motion } from 'framer-motion';

const ServiceCategoryButtons = ({ 
  categories, 
  onCategorySelect, 
  selectedCategory = null,
  className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4",
  showDescription = true 
}) => {
  return (
    <div className={className}>
      {categories.map((category) => (
        <motion.button
          key={category.id || category.categoria}
          onClick={() => onCategorySelect(category)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-center group hover:bg-indigo-50 ${
            selectedCategory === category ? 'border-indigo-300 bg-indigo-50 shadow-md' : ''
          }`}
        >
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
            {category.icon || '🔧'}
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
            {category.name || category.categoria}
          </div>
          {showDescription && (category.description || category.serviços) && (
            <div className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">
              {category.description || `${category.serviços?.length || 0} serviços`}
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default ServiceCategoryButtons;
