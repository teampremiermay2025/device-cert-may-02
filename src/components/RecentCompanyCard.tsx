import React from 'react';
import { CompanyData } from '../hooks/Fan';
import { companyImages, getFlagEmoji } from '../data/mockData';
import { Star } from 'lucide-react';

interface RecentCompanyCardProps {
  company: CompanyData;
  onSelect: (company: CompanyData) => void;
  isFavorite: boolean;
}

const RecentCompanyCard: React.FC<RecentCompanyCardProps> = ({ 
  company, 
  onSelect,
  isFavorite
}) => {
  const deviceCount = company.devices.length;
  const hasActiveReleases = company.undergoing_active_release === 'Yes';
  
  return (
    <div 
      className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer h-24"
      onClick={() => onSelect(company)}
    >
      <div className="w-24 h-full overflow-hidden">
        <img 
          src={companyImages[company.company_id] || 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg'} 
          alt={company.company_name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 p-3 overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900 truncate">{company.company_name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-500">{company.company_id}</span>
              <span className="text-xs">{getFlagEmoji(company.flag)}</span>
            </div>
          </div>
          
          {isFavorite && (
            <Star size={16} className="fill-amber-500 text-amber-500" />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>{deviceCount} device{deviceCount !== 1 ? 's' : ''}</span>
          </div>
          
          {hasActiveReleases && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCompanyCard;