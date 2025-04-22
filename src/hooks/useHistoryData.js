import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useHistoryData() {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const historyRef = ref(db, "history");
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const eventsArray = Object.keys(data)
            .map(key => {
              const item = data[key];
              return {
                ...item,
                id: item.id || key,
                timestamp: item.timestamp || Date.now()
              };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
          setHistoryData(eventsArray);
        } else {
          setHistoryData([]);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    }, (error) => {
      setError(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { historyData, isLoading, error };
} 