'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [shonchoiData, setShonchoiData] = useState([]);
  const [shonchoi2Data, setShonchoi2Data] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [res1, res2] = await Promise.all([
        fetch('/api/shonchoi'),   
        fetch('/api/shonchoi2')  
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      setShonchoiData(data1.data || data1);
      setShonchoi2Data(data2.data || data2);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <DataContext.Provider value={{ shonchoiData, shonchoi2Data, isLoading, refetchAll: fetchAllData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useAppData = () => useContext(DataContext);