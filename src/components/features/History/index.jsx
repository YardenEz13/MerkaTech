import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { AlertCircle } from 'lucide-react';
import HistoryTable from './HistoryTable';
import HistoryFilters from './HistoryFilters';
import StatusIndicator from '../../common/StatusIndicator';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorBoundary from '../../common/ErrorBoundary';
import ExpandableCard from '@/components/ExpandableCard';

const History = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = () => {
    setIsLoading(true);
    const db = getDatabase();
    const historyRef = ref(db, "history");
    
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsArray = Object.keys(data)
          .map(key => {
            // Ensure timestamp is valid
            const item = data[key];
            return {
              ...item,
              id: item.id || key, // Ensure we have an id
              // Convert timestamp to a valid format if it's not already
              timestamp: item.timestamp ? new Date(item.timestamp).getTime() : Date.now()
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
        setHistoryData(eventsArray);
      } else {
        setHistoryData([]);
      }
      setIsLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      setIsLoading(false);
      setRefreshing(false);
    });
  };

  const handleRowClick = (eventId) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId);
  };

  const selectedEvent = historyData.find(item => item.id === selectedEventId);

  // Format date for display with better error handling
  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return ['תאריך לא זמין', ''];
      
      // Ensure timestamp is a number
      const timeValue = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
      
      // Check if valid
      if (isNaN(timeValue)) return ['תאריך לא זמין', ''];
      
      const date = new Date(timeValue);
      
      // Format the date
      const formattedDate = new Intl.DateTimeFormat('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      // Split into date and time parts
      const parts = formattedDate.split(',');
      return parts.length > 1 ? parts : [formattedDate, ''];
    } catch (error) {
      console.error("Date formatting error:", error, timestamp);
      return ['תאריך לא זמין', ''];
    }
  };

  // Filter data based on search term
  const filteredData = historyData.filter(item => 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistoryData();
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">היסטוריית אירועים</h1>
        
        <HistoryFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          handleRefresh={handleRefresh}
        />
      </div>
      
      {/* Status indicator */}
      <StatusIndicator 
        status={isLoading ? 'loading' : 'success'} 
        text={isLoading ? '' : `${filteredData.length} אירועים${searchTerm ? ' נמצאו' : ''}`}
        loading={isLoading}
      />

      {/* Modal Card for the selected event */}
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
          <LoadingSpinner message="טוען היסטוריית אירועים..." />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow p-8 text-center border border-slate-700/50">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? 'לא נמצאו תוצאות' : 'אין אירועים להצגה'}
          </h3>
          <p className="text-gray-400">
            {searchTerm 
              ? `לא נמצאו אירועים התואמים את החיפוש "${searchTerm}"`
              : 'לא נמצאו אירועים בהיסטוריה'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-slate-700 rounded-md text-white hover:bg-slate-600 transition-colors"
            >
              נקה חיפוש
            </button>
          )}
        </div>
      ) : (
        <HistoryTable 
          data={filteredData}
          onRowClick={handleRowClick}
          selectedEventId={selectedEventId}
          formatDate={formatDate}
        />
      )}
    </ErrorBoundary>
  );
};

export default History; 