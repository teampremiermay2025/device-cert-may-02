import React from 'react';
import { FanData } from '../hooks/Fan';

interface PreviewCardProps {
  item: FanData;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ item }) => {
  if (!item) return null;

  return (
    <div className="h-[320px] rounded-2xl shadow-md p-6 relative overflow-auto bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="flex justify-between">
        <h2 className="text-[#D2691E] text-xl font-bold font-archivo mb-4">{item.COMPANY_NAME}</h2>
        <img 
          className="w-[150px] h-[150px] object-cover rounded-xl absolute right-6 top-6"
          src={item.LOCATION} 
          alt={`${item.COMPANY_NAME} logo`} 
        />
      </div>

      <div className="grid grid-cols-1 gap-2 mt-4 pr-[180px]">
        <div className="text-base">
          <span className="font-bold">FAN:</span> {item.FAN}
        </div>
        <div className="text-base">
          <span className="font-bold">Fan Name:</span> {item.FAN_NAME}
        </div>
        <div className="text-base">
          <span className="font-bold">Status:</span> {item.FAN_STATUS}
        </div>
        <div className="text-base">
          <span className="font-bold">Creation:</span> {item.CREATION_DATE}
        </div>
        <div className="text-base">
          <span className="font-bold">Account Group ID:</span> {item.ACCOUNT_GROUP_ID}
        </div>
        <div className="text-base">
          <span className="font-bold">AccountGroup/Site:</span> {item.AG_NAME}
        </div>
        <div className="text-base">
          <span className="font-bold">Company ID:</span> {item.COMAPANY_ID}
        </div>
        <div className="text-base">
          <span className="font-bold">Region Name:</span> {item.REGION_NAME}
        </div>
        <div className="text-base">
          <span className="font-bold">Contract:</span> {item.CONTRACT}
        </div>
        <div className="text-base">
          <span className="font-bold">Contract Type:</span> {item.CONTRACT_TYPE}
        </div>
        <div className="text-base">
          <span className="font-bold">Roles:</span> BANAdmin/CRU/TCM
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;