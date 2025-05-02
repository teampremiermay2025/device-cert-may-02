import { useState, useEffect } from 'react';
import { FanData } from './Fan';
import { mockFanData, generateExtendedData } from '../data/mockData';

export const useFanData = () => {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<FanData[]>([]);
  const [recentData, setRecentData] = useState<FanData[]>([]);
  const [mySiteData, setMySiteData] = useState<FanData[]>([]);
  const [myFavData, setMyFavData] = useState<FanData[]>([]);
  const [filteredData, setFilteredData] = useState<FanData[]>([]);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, we would fetch from an API instead of using mock data
        const extendedData = generateExtendedData(mockFanData, 150);
        
        // Store the complete dataset
        setAllData(extendedData);
        
        // Set recent data (first 9 items)
        setRecentData(extendedData.slice(0, 6));
        
        // Set filtered data (items 10-150)
        setFilteredData(extendedData.slice(10, 150));
        
        // Check for stored data in sessionStorage
        const storedMySites = sessionStorage.getItem('mySiteData');
        const storedFavorites = sessionStorage.getItem('myFavData');
        
        if (storedMySites) {
          setMySiteData(JSON.parse(storedMySites));
        } else {
          // Default my sites (items 54-61)
          const defaultMySites = extendedData.slice(54, 61);
          setMySiteData(defaultMySites);
          sessionStorage.setItem('mySiteData', JSON.stringify(defaultMySites));
        }
        
        if (storedFavorites) {
          setMyFavData(JSON.parse(storedFavorites));
        } else {
          // Default favorites (items 98-104)
          const defaultFavorites = extendedData.slice(98, 104);
          setMyFavData(defaultFavorites);
          sessionStorage.setItem('myFavData', JSON.stringify(defaultFavorites));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search functionality
  const handleSearch = (searchValue: string) => {
    if (!searchValue.trim()) {
      setFilteredData(allData.slice(10, 150));
      return;
    }

    const upperSearchValue = searchValue.toUpperCase();
    const filtered = allData
      .filter(item => 
        item.FAN?.toString().includes(upperSearchValue) || 
        item.FAN_NAME?.toString().includes(upperSearchValue)
      )
      .sort((a, b) => {
        const aContainsFan = a.FAN?.toString().includes(upperSearchValue);
        const bContainsFan = b.FAN?.toString().includes(upperSearchValue);
        
        if (aContainsFan && !bContainsFan) return -1;
        if (!aContainsFan && bContainsFan) return 1;
        return 0;
      });
    
    setFilteredData(filtered);
  };

  // Add to My Sites
  const addToMySites = (item: FanData) => {
    const exists = mySiteData.some(site => site.FAN === item.FAN);
    
    if (!exists) {
      const updatedSites = [item, ...mySiteData];
      setMySiteData(updatedSites);
      sessionStorage.setItem('mySiteData', JSON.stringify(updatedSites));
    }
  };

  // Add to Favorites
  const addToFavorites = (item: FanData) => {
    const exists = myFavData.some(fav => fav.FAN === item.FAN);
    
    if (!exists) {
      const updatedFavorites = [item, ...myFavData];
      setMyFavData(updatedFavorites);
      sessionStorage.setItem('myFavData', JSON.stringify(updatedFavorites));
    }
  };

  return {
    loading,
    allData,
    recentData,
    mySiteData,
    myFavData,
    filteredData,
    handleSearch,
    addToMySites,
    addToFavorites
  };
};