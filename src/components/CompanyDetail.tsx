import React from 'react';
import { CompanyData, Device } from '../hooks/Fan';
import { companyImages, getFlagEmoji, getDeviceTypeIcon } from '../data/mockData';
import { ArrowLeft, Star, AlertTriangle, X, Globe, ExternalLink, LucideIcon } from 'lucide-react';

interface CompanyDetailProps {
  company: CompanyData;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (company: CompanyData) => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ 
  company, 
  onBack, 
  isFavorite,
  onToggleFavorite 
}) => {
  const handleFavoriteClick = () => {
    onToggleFavorite(company);
  };

  const DeviceItem: React.FC<{ device: Device }> = ({ device }) => {
    // Dynamically import the icon based on device type
    const iconName = getDeviceTypeIcon(device.device_type);
    const IconComponent = React.createElement(iconName as unknown as LucideIcon, { 
      size: 20, 
      className: "text-blue-500" 
    });

    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer">
        <div className="flex items-start">
          <div className="bg-blue-50 p-2 rounded-lg mr-3">
            {IconComponent}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{device.device_name}</h4>
            <p className="text-sm text-gray-500">{device.device_type}</p>
            <div className="mt-2 text-xs font-mono text-gray-400">{device.device_id}</div>
            <div className="text-xs text-gray-500 mt-1">Code: {device.device_code_name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-64">
        <img 
          src={companyImages[company.company_id] || 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg'} 
          alt={company.company_name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          <button 
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg ${isFavorite ? 'bg-amber-100' : 'bg-white/90 hover:bg-white'} transition-colors duration-200 flex items-center gap-1`}
          >
            <Star size={18} className={`${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-700'}`} />
            <span className="text-sm">{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">{company.company_name}</h1>
            <div className="flex gap-2 items-center">
              <span className="text-white/90 font-medium text-lg">{company.flag}</span>
              <span className="text-2xl">{getFlagEmoji(company.flag)}</span>
            </div>
          </div>
          <div className="text-white/80 flex items-center gap-2 mt-1">
            <Globe size={14} />
            <span>{company.company_id}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Release Status</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              company.undergoing_active_release === 'Yes' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {company.undergoing_active_release === 'Yes' ? 'Active Release' : 'No Active Release'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-blue-800 text-sm font-medium mb-2">DA-IR Releases</h3>
              {company.active_releases["DA-IR"].length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {company.active_releases["DA-IR"].map((version, index) => (
                    <span key={`ir-${index}`} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      v{version}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-blue-600/60 text-sm italic">No active DA-IR releases</p>
              )}
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-purple-800 text-sm font-medium mb-2">DA-MR Releases</h3>
              {company.active_releases["DA-MR"].length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {company.active_releases["DA-MR"].map((version, index) => (
                    <span key={`mr-${index}`} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      v{version}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-purple-600/60 text-sm italic">No active DA-MR releases</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Devices ({company.devices.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.devices.map((device, index) => (
              <DeviceItem key={device.device_id} device={device} />
            ))}
          </div>
        </div>

        {(company.pending_registrations > 0 || company.expired_ndas > 0) && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">Alerts</h2>
            
            {company.pending_registrations > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-800 p-4 rounded-lg">
                <AlertTriangle size={20} />
                <span>{company.pending_registrations} pending registration{company.pending_registrations !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {company.expired_ndas > 0 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-800 p-4 rounded-lg">
                <X size={20} />
                <span>{company.expired_ndas} expired NDA{company.expired_ndas !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
            <span>View Full Details</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;