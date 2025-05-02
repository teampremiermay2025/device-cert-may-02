import React, { useState } from 'react';
import { useCompanyData } from '../hooks/useCompanyData';
import CompanyCard from './CompanyCard';
import CompanyDetail from './CompanyDetail';
import RecentCompanyCard from './RecentCompanyCard';
import { Search, Smartphone, Filter, X, LayoutGrid, LayoutList, ChevronDown } from 'lucide-react';
import { CompanyData } from '../hooks/Fan';

const CompanyDashboard: React.FC = () => {
  const { 
    loading, 
    filteredData, 
    selectedCompany,
    recentlyViewed,
    favoriteCompanies,
    handleSearch, 
    applyFilters,
    selectCompany,
    clearSelectedCompany,
    toggleFavorite,
    isFavorite,
    getUniqueDeviceTypes
  } = useCompanyData();
  
  const [searchValue, setSearchValue] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
  const [activeReleaseFilter, setActiveReleaseFilter] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState<'all' | 'favorites'>('all');
  
  const deviceTypes = getUniqueDeviceTypes();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearch(value);
  };

  const handleFilterChange = () => {
    applyFilters(deviceTypeFilter, activeReleaseFilter);
  };

  const resetFilters = () => {
    setDeviceTypeFilter('');
    setActiveReleaseFilter(null);
    applyFilters('', null);
  };

  const handleDeviceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeviceTypeFilter(e.target.value);
  };

  const handleActiveReleaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setActiveReleaseFilter(null);
    } else if (value === 'active') {
      setActiveReleaseFilter(true);
    } else {
      setActiveReleaseFilter(false);
    }
  };

  const handleToggleFavorite = (company: CompanyData) => {
    toggleFavorite(company);
  };

  const displayData = viewType === 'favorites' 
    ? favoriteCompanies 
    : filteredData;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-8 lg:px-12">
      {!selectedCompany ? (
        <>
          {/* Main Dashboard View */}
         

          {/* Recent & Favorite Companies */}
          {recentlyViewed.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Viewed</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {recentlyViewed.map(company => (
                  <div key={company.company_id} className="flex-shrink-0 w-64">
                    <RecentCompanyCard 
                      company={company} 
                      onSelect={() => selectCompany(company)} 
                      isFavorite={isFavorite(company.company_id)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="relative flex-grow max-w-xl">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Search companies, devices, or IDs..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setViewType(viewType === 'all' ? 'favorites' : 'all')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    viewType === 'favorites' 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {viewType === 'favorites' ? 'Showing Favorites' : 'All Companies'}
                </button>
                
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    aria-label="List view"
                  >
                    <LayoutList size={20} />
                  </button>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                  <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="min-w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                    <select
                      value={deviceTypeFilter}
                      onChange={handleDeviceTypeChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                    >
                      <option value="">All Device Types</option>
                      {deviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="min-w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Status</label>
                    <select
                      value={activeReleaseFilter === null ? 'all' : activeReleaseFilter ? 'active' : 'inactive'}
                      onChange={handleActiveReleaseChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Release</option>
                      <option value="inactive">No Active Release</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleFilterChange}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                    
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                    >
                      <X size={16} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Company List */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {viewType === 'favorites' ? 'Favorite Companies' : 'All Companies'}
                <span className="ml-2 text-gray-500 text-base font-normal">({displayData.length})</span>
              </h2>
            </div>

            {displayData.length === 0 ? (
              <div className="text-center py-16">
                <Smartphone size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No companies found</h3>
                <p className="text-gray-500">
                  {viewType === 'favorites' 
                    ? "You haven't added any favorites yet"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            ) : (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }`}>
                {displayData.map(company => (
                  <CompanyCard
                    key={company.company_id}
                    company={company}
                    onSelect={selectCompany}
                    isFavorite={isFavorite(company.company_id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Company Detail View */
        <CompanyDetail
          company={selectedCompany}
          onBack={clearSelectedCompany}
          isFavorite={isFavorite(selectedCompany.company_id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;