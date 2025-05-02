import React, { useState } from 'react';
import { FanData } from '../hooks/Fan';
import { Heart, Share, PlusSquare } from 'lucide-react';

interface SiteCardProps {
  item: FanData;
  onMouseEnter: (item: FanData) => void;
  onMouseLeave: () => void;
  onCardClick: (fan: number) => void;
  onAddToFavorites: (event: React.MouseEvent, item: FanData) => void;
  onAddToMySites: (event: React.MouseEvent, item: FanData) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({ 
  item, 
  onMouseEnter, 
  onMouseLeave, 
  onCardClick,
  onAddToFavorites,
  onAddToMySites
}) => {
  const [elevation, setElevation] = useState(2);

  const handleMouseEnter = () => {
    setElevation(8);
    onMouseEnter(item);
  };

  const handleMouseLeave = () => {
    setElevation(2);
    onMouseLeave();
  };

  return (
    <div 
      className={`transform transition-all duration-300 hover:scale-105 bg-white rounded-xl shadow-md hover:shadow-xl w-[320px] h-[270px] flex flex-col overflow-hidden relative cursor-pointer`}
      style={{ boxShadow: `0 ${elevation}px ${elevation * 2}px 0 rgba(0, 0, 0, 0.1)` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick(item.FAN || 0)}
    >
      <div className="p-3 pt-2 h-[200px] relative">
        <div className="absolute -mt-4 w-[85px] h-[105px] bg-white rounded-xl shadow-md flex items-center justify-center z-10">
          <img 
            className="w-[80px] h-[100px] rounded-xl object-cover" 
            src={item.LOCATION} 
            alt={`${item.COMPANY_NAME} logo`}
          />
        </div>
        
        <div className="pt-1 text-right">
          <p className="mb-0 text-right text-[#D2691E] font-bold text-[15px] ml-[40%] w-[60%] line-clamp-3">{item.COMPANY_NAME}</p>
          <h4 className="text-right mb-0 text-sm">{item.FAN}</h4>
        </div>
      </div>
      
      <div className="px-3 text-right absolute top-[130px] right-[15px] left-[40px]">
        <p className="mb-0 text-sm">{item.AG_NAME}</p>
        <p className="mb-0 text-sm">BANAdmin/CRU/TCM</p>
      </div>
      
      <hr className="my-0 border-gray-300" />
      
      <div className="p-3 mt-auto">
        <p className="mb-0 text-sm flex items-center">
          <span className="material-icons text-[13px]">update</span>
          Last updated: <span className="text-green-600 text-sm font-semibold ml-1">{item.CREATION_DATE}</span>
        </p>
        
        <div className="absolute right-2 bottom-2 flex space-x-2">
          <button 
            className="text-pink-500 hover:text-pink-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAddToFavorites(e, item);
            }}
          >
            <Heart size={20} />
          </button>
          <button 
            className="text-blue-500 hover:text-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Share size={20} />
          </button>
          <button 
            className="text-green-500 hover:text-green-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAddToMySites(e, item);
            }}
          >
            <PlusSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteCard;