import { FC } from 'react';
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CertificationRequest } from '../types';

interface CertificationCardProps {
  certification: CertificationRequest;
  onClick: () => void;
}

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'FORECAST': 'bg-purple-100 text-purple-800',
    'PLANNING': 'bg-blue-100 text-blue-800',
    'SUBMITTED': 'bg-yellow-100 text-yellow-800',
    'SUBMISSION_REVIEW': 'bg-orange-100 text-orange-800',
    'DEVICE_ENTRY': 'bg-cyan-100 text-cyan-800',
    'DEVICE_TESTING': 'bg-indigo-100 text-indigo-800',
    'TAQ_REVIEW': 'bg-pink-100 text-pink-800',
    'TA_COMPLETE': 'bg-green-100 text-green-800',
    'CLOSED': 'bg-gray-100 text-gray-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const CertificationCard: FC<CertificationCardProps> = ({ certification, onClick }) => {
  const statusColorClass = getStatusColor(certification.status);
  const completedTasks = certification.tasks.filter(task => task.status === 'DONE').length;
  const totalTasks = certification.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-150 ease-in-out cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {certification.darpKey}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
              {certification.status}
            </span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {certification.type}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">{certification.projectName}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">Updated {new Date(certification.lastUpdated).toLocaleDateString()}</span>
          </div>
          {totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};