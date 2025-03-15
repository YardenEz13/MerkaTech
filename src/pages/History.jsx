import React, { useState, useEffect } from 'react';
import ExpandableCard from '../components/ExpandableCard'; // Adjust the path if needed
import Navbar from '../components/Navbar'; // Adjust the path if needed
import { getDatabase, ref, onValue } from 'firebase/database';

const History = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const historyRef = ref(db, "history");
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsArray = Object.keys(data).map(key => data[key]);
        setHistoryData(eventsArray);
      }
    }, (error) => {
      console.error("Error fetching history:", error);
    });
  }, []);

  const handleRowClick = (eventId) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId);
  };

  const selectedEvent = historyData.find(item => item.id === selectedEventId);

  return (
    <div dir="ltr" className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Camera History</h1>

        {/* Modal Card for the selected event */}
        {selectedEvent && (
          <ExpandableCard
            isOpen={Boolean(selectedEvent)}
            onClose={() => setSelectedEventId(null)}
            card={selectedEvent}
            id="uniqueModalId"
          />
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">זמן</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">תיאור מקרה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">תמונה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 bg-slate-600">
                {historyData.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    className={`hover:bg-slate-700  cursor-pointer transition ${selectedEventId === item.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-3 text-right whitespace-nowrap text-sm text-gray-200">{item.timestamp}</td>
                    <td className="px-6 py-3 text-right text-sm text-white">{item.description}</td>
                    <td className="px-6 py-3 whitespace-nowrap my-2">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.alt}
                          className="h-40 w-40 object-cover rounded-md inline-block float-right" 
                        />
                      ) : (
                        "No image"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
