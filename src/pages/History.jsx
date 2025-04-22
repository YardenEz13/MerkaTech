import React, { useState } from 'react';
import { useHistoryData } from '@/hooks/useHistoryData';
import Navbar from '@/components/Navbar';
import HistoryFilters from '@/components/features/History/HistoryFilters';
import HistoryTable from '@/components/features/History/HistoryTable';
import EmptyState from '@/components/common/EmptyState';
import StatusIndicator from '@/components/common/StatusIndicator';
import ExpandableCard from '@/components/ExpandableCard';

const History = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { historyData, isLoading, error } = useHistoryData();

  const handleRowClick = (eventId) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId);
  };

  const selectedEvent = historyData.find(item => item.id === selectedEventId);

  const filteredData = historyData.filter(item => 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = () => {
    // Refresh logic will be handled by the useHistoryData hook
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <Navbar />
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">היסטוריית אירועים</h1>
          <HistoryFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            handleRefresh={handleRefresh}
          />
        </div>

        <StatusIndicator 
          status={isLoading ? 'loading' : 'success'} 
          text={isLoading ? 'טוען נתונים...' : `${filteredData.length} אירועים${searchTerm ? ' נמצאו' : ''}`}
          loading={isLoading}
        />

        {selectedEvent && (
          <ExpandableCard
            isOpen={Boolean(selectedEvent)}
            onClose={() => setSelectedEventId(null)}
            card={selectedEvent}
            id="uniqueModalId"
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'לא נמצאו תוצאות' : 'אין אירועים להצגה'}
            description={searchTerm 
              ? `לא נמצאו אירועים התואמים את החיפוש "${searchTerm}"`
              : 'לא נמצאו אירועים בהיסטוריה'}
            action={searchTerm ? {
              onClick: () => setSearchTerm(''),
              label: 'נקה חיפוש'
            } : null}
          />
        ) : (
          <HistoryTable 
            data={filteredData}
            onRowClick={handleRowClick}
            selectedEventId={selectedEventId}
          />
        )}
      </div>
    </div>
  );
};

export default History;
