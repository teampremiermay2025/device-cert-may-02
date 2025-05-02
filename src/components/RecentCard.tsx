import React from 'react';
import { FanData } from '../hooks/Fan';
import { X } from 'lucide-react';

interface RecentCardProps {
  item: FanData;
  onClick: (fan: number) => void;
  onClose?: () => void;
}

const RecentCard: React.FC<RecentCardProps> = ({ item, onClick, onClose }) => {
  return (
    <div 
    className="w-[200px] h-[220px] bg-white rounded-2xl shadow-md text-center flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg border-t-4 border-blue-200 hover:border-blue-400"
    onClick={() => onClick(item.FAN || 0)}
  >
        
      <div className="p-2">
        {onClose && (
          <button 
            className="text-gray-500 hover:text-gray-700 float-right text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={16} />
          </button>
        )}
        <h3 className="text-[15px] text-[#D2691E] font-bold line-clamp-2 font-archivo">{item.COMPANY_NAME}</h3>
        <p className="text-[12px] text-black font-archivo">FAN: {item.FAN}</p>
      </div>

      <div className="flex-grow flex justify-center items-center p-2">
        <img 
          className="w-[100px] h-[100px] mx-auto object-cover"
          src={item.LOCATION} 
          alt={`${item.COMPANY_NAME} logo`} 
        />
      </div>

      <div className="text-right p-2 text-xs text-black">6 mins ago</div>
    </div>
  );
};

export default RecentCard;