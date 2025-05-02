import React, { useState, useEffect } from 'react';
import { useFanData } from '../hooks/useFanData';
import { FanData } from '../hooks/Fan';
import SiteCard from './SiteCard';
import PreviewCard from './PreviewCard';
import Carousel from './Carousel';
import { Search } from 'lucide-react';

const SitesManager: React.FC = () => {
  const { 
    loading, 
    recentData, 
    mySiteData, 
    myFavData, 
    filteredData, 
    handleSearch, 
    addToMySites, 
    addToFavorites 
  } = useFanData();
  
  const [selectedBanner, setSelectedBanner] = useState<'RV' | 'MS' | 'FS'>('RV');
  const [previewItem, setPreviewItem] = useState<FanData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRecentView, setShowRecentView] = useState(true);
  const [breakpoint, setBreakpoint] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const newBreakpoint = width <= 400 ? 1 : Math.floor(width / 350) - 1;
      setBreakpoint(Math.max(1, newBreakpoint));
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  const handleCardClick = (fan: number) => {
    console.log(`Navigating to fan details: ${fan}`);
  };

  const handleMouseEnter = (item: FanData) => {
    setPreviewItem(item);
    setShowPreview(true);
    setShowRecentView(false);
  };

  const handleMouseLeave = () => {
    setPreviewItem(null);
    setShowPreview(false);
    setShowRecentView(true);
  };

  const handleAddToMySites = (event: React.MouseEvent, item: FanData) => {
    event.stopPropagation();
    addToMySites(item);
    setSelectedBanner('MS');
  };

  const handleAddToFavorites = (event: React.MouseEvent, item: FanData) => {
    event.stopPropagation();
    addToFavorites(item);
    setSelectedBanner('FS');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearch(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-8 lg:px-12">
      <div 
        className={`bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-lg h-[420px] mb-8 p-6 transition-all duration-500 ease-in-out transform ${
          showRecentView ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <select
            className="text-lg font-medium bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:border-blue-300 cursor-pointer"
            value={selectedBanner}
            onChange={(e) => setSelectedBanner(e.target.value as 'RV' | 'MS' | 'FS')}
          >
            <option value="RV">Recently viewed sites</option>
            <option value="MS">My List</option>
            <option value="FS">Favourite sites</option>
          </select>
        </div>

        {selectedBanner === 'RV' && <Carousel items={recentData} onCardClick={handleCardClick} />}
        {selectedBanner === 'MS' && <Carousel items={mySiteData} onCardClick={handleCardClick} />}
        {selectedBanner === 'FS' && <Carousel items={myFavData} onCardClick={handleCardClick} />}
      </div>

      {showPreview && previewItem && (
        <div className="mb-8 transform transition-all duration-500 ease-out">
          <PreviewCard item={previewItem} />
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Quick Search</h2>
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-600"
                placeholder="Search by FAN or Name..."
                value={searchValue}
                onChange={handleSearchChange}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <div className="h-[500px] overflow-auto px-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-12 justify-items-center">
            {filteredData.map((item, index) => (
              <SiteCard
                key={`${item.FAN}-${index}`}
                item={item}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onCardClick={handleCardClick}
                onAddToFavorites={handleAddToFavorites}
                onAddToMySites={handleAddToMySites}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitesManager;