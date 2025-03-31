import React, { useState, useEffect } from 'react';
import ExpandableCard from '../components/ExpandableCard';
import Navbar from '../components/Navbar';
import { getDatabase, ref, onValue } from 'firebase/database';
import { CalendarIcon, ClockIcon, AlertCircleIcon, SearchIcon, FilterIcon, RefreshCw } from 'lucide-react';

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
            const item = data[key];
            return {
              ...item,
              id: item.id || key,
              // Don't attempt to convert a Hebrew string to a timestamp
              // Just pass through the string as is
              timestamp: item.timestamp || Date.now()
            };
          })
          .sort((a, b) => {
            // Custom sort for Hebrew dates (you might need to adjust this)
            if (typeof a.timestamp === 'string' && typeof b.timestamp === 'string') {
              // Simple string comparison - may not sort correctly for Hebrew dates
              return b.timestamp.localeCompare(a.timestamp);
            }
            // Fallback to numeric comparison
            return b.timestamp - a.timestamp;
          });
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
  
  // Format date with error handling
  const formatDate = (timestamp) => {
    try {
      // For debugging
      console.log("Formatting timestamp:", timestamp);
      
      if (!timestamp) return ['תאריך לא זמין', ''];
      
      // If timestamp is a string in Hebrew format (which we now know it is)
      if (typeof timestamp === 'string') {
        // Check if it contains the Hebrew word for "at" (בשעה)
        if (timestamp.includes('בשעה')) {
          const parts = timestamp.split('בשעה');
          return [parts[0].trim(), parts.length > 1 ? parts[1].trim() : ''];
        }
        return [timestamp, ''];
      }
      
      // The rest of your existing code for numeric timestamps
      const timeValue = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
      
      if (isNaN(timeValue)) return ['תאריך לא זמין', ''];
      
      const date = new Date(timeValue);
      
      const formattedDate = new Intl.DateTimeFormat('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      const parts = formattedDate.split(',');
      return parts.length > 1 ? parts : [formattedDate, ''];
    } catch (error) {
      console.error("Date formatting error:", error, timestamp);
      return ['תאריך לא זמין', ''];
    }
  };

 

  const handleRowClick = (eventId) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId);
  };

  const selectedEvent = historyData.find(item => item.id === selectedEventId);


  // Filter data based on search term
  const filteredData = historyData.filter(item => 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div  className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <Navbar />
      
      {/* Main content with padding for fixed navbar */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">היסטוריית אירועים</h1>
          
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
        </div>
        
        {/* Status indicator */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300 inline-flex items-center mb-6">
          <div className={`h-2 w-2 rounded-full mr-2 ${isLoading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
          {isLoading ? 'טוען נתונים...' : `${filteredData.length} אירועים${searchTerm ? ' נמצאו' : ''}`}
        </div>

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
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">טוען היסטוריית אירועים...</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow p-8 text-center border border-slate-700/50">
            <AlertCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow overflow-hidden border border-slate-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/80 text-white">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">זמן</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">תיאור מקרה</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">תמונה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/70">
                  {filteredData.map(item => {
                    const [datePart, timePart] = formatDate(item.timestamp);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item.id)}
                        className="hover:bg-slate-700/70 cursor-pointer transition-colors duration-150 ease-in-out"
                      >
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm font-medium text-gray-200">
                              <CalendarIcon className="h-4 w-4 ml-2 text-blue-400" />
                              {datePart}
                            </div>
                            {timePart && (
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <ClockIcon className="h-3 w-3 ml-2 text-blue-400" />
                                {timePart}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-medium text-white">{item.description || 'אין תיאור'}</div>
                          {item.details && (
                            <div className="text-xs text-gray-400 mt-1">{item.details}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.imageUrl ? (
                            <div className="relative group">
                              <img
                                src={item.imageUrl}
                                alt={item.description || 'תמונת אירוע'}
                                className="h-20 w-32 object-cover rounded-md inline-block float-right border-2 border-transparent group-hover:border-blue-500 transition-all duration-200 shadow-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150?text=תמונה+לא+זמינה';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                                <span className="absolute bottom-1 right-1 text-xs text-white">לחץ להגדלה</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 w-32 bg-slate-700/70 rounded-md flex items-center justify-center text-xs text-gray-400 float-right">
                              אין תמונה
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
