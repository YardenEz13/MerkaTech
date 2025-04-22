import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyState = ({ title, description, action, searchTerm }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow p-8 text-center border border-slate-700/50">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400">
        {description}
      </p>
      {action && (
        <button 
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-slate-700 rounded-md text-white hover:bg-slate-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 