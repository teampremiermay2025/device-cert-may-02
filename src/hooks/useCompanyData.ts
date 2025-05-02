import { useState, useEffect } from 'react';
import { CompanyData } from './Fan';
import { mockCompanyData } from '../data/mockData';

export const useCompanyData = () => {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<CompanyData[]>([]);
  const [filteredData, setFilteredData] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<CompanyData[]>([]);
  const [favoriteCompanies, setFavoriteCompanies] = useState<CompanyData[]>([]);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('');
  const [activeReleaseFilter, setActiveReleaseFilter] = useState<boolean | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, we would fetch from an API instead of using mock data
        setAllData(mockCompanyData);
        setFilteredData(mockCompanyData);
        
        // Check for stored data in localStorage
        const storedRecent = localStorage.getItem('recentlyViewedCompanies');
        const storedFavorites = localStorage.getItem('favoriteCompanies');
        
        if (storedRecent) {
          setRecentlyViewed(JSON.parse(storedRecent));
        } else {
          // Set default recently viewed (first 5 companies)
          setRecentlyViewed(mockCompanyData.slice(0, 5));
        }
        
        if (storedFavorites) {
          setFavoriteCompanies(JSON.parse(storedFavorites));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching company data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search functionality
  const handleSearch = (searchValue: string) => {
    if (!searchValue.trim()) {
      // Apply only active filters if search is empty
      applyFilters(deviceTypeFilter, activeReleaseFilter);
      return;
    }

    const lowerSearchValue = searchValue.toLowerCase();
    
    // Filter by search term
    let results = allData.filter(company => 
      company.company_name.toLowerCase().includes(lowerSearchValue) || 
      company.company_id.toLowerCase().includes(lowerSearchValue) ||
      company.devices.some(device => 
        device.device_name.toLowerCase().includes(lowerSearchValue) ||
        device.device_id.toLowerCase().includes(lowerSearchValue) ||
        device.device_type.toLowerCase().includes(lowerSearchValue)
      )
    );
    
    // Apply additional filters if they exist
    if (deviceTypeFilter) {
      results = results.filter(company => 
        company.devices.some(device => 
          device.device_type.toLowerCase().includes(deviceTypeFilter.toLowerCase())
        )
      );
    }
    
    if (activeReleaseFilter !== null) {
      const filterValue = activeReleaseFilter ? "Yes" : "No";
      results = results.filter(company => 
        company.undergoing_active_release === filterValue
      );
    }
    
    setFilteredData(results);
  };

  // Filter by device type
  const applyFilters = (deviceType: string, activeRelease: boolean | null) => {
    setDeviceTypeFilter(deviceType);
    setActiveReleaseFilter(activeRelease);
    
    let results = [...allData];
    
    // Filter by device type if specified
    if (deviceType) {
      results = results.filter(company => 
        company.devices.some(device => 
          device.device_type.toLowerCase().includes(deviceType.toLowerCase())
        )
      );
    }
    
    // Filter by active release status if specified
    if (activeRelease !== null) {
      const filterValue = activeRelease ? "Yes" : "No";
      results = results.filter(company => 
        company.undergoing_active_release === filterValue
      );
    }
    
    setFilteredData(results);
  };

  // Select a company to view details
  const selectCompany = (company: CompanyData) => {
    setSelectedCompany(company);
    
    // Add to recently viewed if not already present
    if (!recentlyViewed.some(item => item.company_id === company.company_id)) {
      const updatedRecent = [company, ...recentlyViewed].slice(0, 5);
      setRecentlyViewed(updatedRecent);
      localStorage.setItem('recentlyViewedCompanies', JSON.stringify(updatedRecent));
    }
  };

  // Toggle favorite status for a company
  const toggleFavorite = (company: CompanyData) => {
    const isFavorite = favoriteCompanies.some(item => item.company_id === company.company_id);
    
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favoriteCompanies.filter(item => item.company_id !== company.company_id);
    } else {
      updatedFavorites = [...favoriteCompanies, company];
    }
    
    setFavoriteCompanies(updatedFavorites);
    localStorage.setItem('favoriteCompanies', JSON.stringify(updatedFavorites));
    
    return !isFavorite; // Return new status
  };

  // Check if a company is a favorite
  const isFavorite = (companyId: string) => {
    return favoriteCompanies.some(item => item.company_id === companyId);
  };

  // Clear selection
  const clearSelectedCompany = () => {
    setSelectedCompany(null);
  };

  // Get unique device types for filtering
  const getUniqueDeviceTypes = (): string[] => {
    const deviceTypes = new Set<string>();
    
    allData.forEach(company => {
      company.devices.forEach(device => {
        deviceTypes.add(device.device_type);
      });
    });
    
    return Array.from(deviceTypes).sort();
  };

  return {
    loading,
    allData,
    filteredData,
    selectedCompany,
    recentlyViewed,
    favoriteCompanies,
    deviceTypeFilter,
    activeReleaseFilter,
    handleSearch,
    applyFilters,
    selectCompany,
    clearSelectedCompany,
    toggleFavorite,
    isFavorite,
    getUniqueDeviceTypes
  };
};