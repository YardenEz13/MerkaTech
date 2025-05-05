import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HistoryFilters = ({ searchTerm, setSearchTerm, handleRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="חיפוש אירועים..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pr-10 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
   
      
    </div>
  );
};

export default HistoryFilters; 