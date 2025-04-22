import React from 'react';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

const HistoryTable = ({ data, onRowClick, selectedEventId }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 text-center border border-slate-700/50">
        <p className="text-gray-400">No events to display</p>
      </div>
    );
  }

  return (
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
            {data.map(item => {
              const [datePart, timePart] = formatDate(item.timestamp);
              return (
                <tr
                  key={item.id}
                  onClick={() => onRowClick(item.id)}
                  className={`hover:bg-slate-700/70 cursor-pointer transition-colors duration-150 ease-in-out ${selectedEventId === item.id ? 'bg-slate-700/40' : ''}`}
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
  );
};

export default HistoryTable; 