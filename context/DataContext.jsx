'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [shonchoiData, setShonchoiData] = useState([]);
  const [shonchoi2Data, setShonchoi2Data] = useState([]);
  const [shonchoi3Data, setShonchoi3Data] = useState([]);
const [rinData,setRinData]=useState([])
const [rinData2,setRinData2]=useState([])
const [rinData3,setRinData3]=useState([])

  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [res1, res2,res3,res4,res5,res6] = await Promise.all([
        fetch('/api/members'),   
        fetch('/api/members2'),
        fetch('/api/members3'),
        fetch('/api/rinmembers'),
        fetch('/api/rinmembers2'),
        fetch('/api/rinmembers3'),

      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();
      const data3 = await res3.json();
      const data4 = await res4.json();
      const data5 = await res5.json();
      const data6 = await res6.json();



      setShonchoiData(data1.data || data1);
      setShonchoi2Data(data2.data || data2);
      setShonchoi3Data(data3.data || data3);
setRinData(data4.data || data4)
setRinData(data5.data || data5)
setRinData(data6.data || data6)

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
    <DataContext.Provider value={{ shonchoiData, shonchoi2Data,shonchoi3Data,rinData,rinData2,
    rinData3, isLoading, refetchAll: fetchAllData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useAppData = () => useContext(DataContext);