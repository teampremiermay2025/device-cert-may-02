import React from 'react';
import { CompanyData } from '../hooks/Fan';
import { companyImages, getFlagEmoji } from '../data/mockData';
import { Star, Smartphone, ChevronRight, AlertTriangle } from 'lucide-react';

interface CompanyCardProps {
  company: CompanyData;
  onSelect: (company: CompanyData) => void;
  isFavorite: boolean;
  onToggleFavorite: (company: CompanyData) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  onSelect, 
  isFavorite,
  onToggleFavorite 
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(company);
  };

  const totalReleases = company.active_releases["DA-IR"].length + company.active_releases["DA-MR"].length;
  const deviceCount = company.devices.length;
  
  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 w-full cursor-pointer"
      onClick={() => onSelect(company)}
    >
      <div className="relative h-32 overflow-hidden">
        <img 
          src={companyImages[company.company_id] || 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg'} 
          alt={company.company_name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute top-2 right-2">
          <button 
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full ${isFavorite ? 'bg-amber-100' : 'bg-white/80 hover:bg-white'} transition-colors duration-200`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={18} className={`${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-500'}`} />
          </button>
        </div>
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
          <h3 className="text-white font-semibold text-lg truncate">{company.company_name}</h3>
          <span className="text-sm font-medium bg-white/90 text-gray-800 px-2 py-1 rounded-md flex items-center gap-1">
            {getFlagEmoji(company.flag)} {company.flag}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">{company.company_id}</span>
          <div className={`flex items-center gap-1 text-xs font-medium ${company.undergoing_active_release === 'Yes' ? 'text-green-600' : 'text-gray-500'} px-2 py-1 rounded-full ${company.undergoing_active_release === 'Yes' ? 'bg-green-50' : 'bg-gray-50'}`}>
            {company.undergoing_active_release === 'Yes' ? '• Active Release' : 'No Active Release'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-3">
          <div className="bg-blue-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-blue-700 font-medium">Devices</p>
            <p className="text-xl font-semibold text-blue-900 flex justify-center items-center gap-1">
              <Smartphone size={18} /> {deviceCount}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-purple-700 font-medium">Releases</p>
            <p className="text-xl font-semibold text-purple-900">{totalReleases}</p>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {company.pending_registrations > 0 && (
            <div className="flex items-center gap-1 text-amber-600 text-xs">
              <AlertTriangle size={14} />
              <span>{company.pending_registrations} pending</span>
            </div>
          )}
          
          {company.expired_ndas > 0 && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <AlertTriangle size={14} />
              <span>{company.expired_ndas} expired NDAs</span>
            </div>
          )}
          
          <div className="ml-auto flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
            Details <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;