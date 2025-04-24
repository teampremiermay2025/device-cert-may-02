import { FC } from 'react';
import { HomeIcon, FolderIcon, RocketLaunchIcon, PlusCircleIcon, ShareIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  onNavigate: (page: string) => void;
  onNewCertification: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onNavigate, onNewCertification }) => {
  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <img src="https://www.att.com/favicon.ico" alt="AT&T Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold">AT&T Business</h1>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg" 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-white">Alex Carter</p>
            <p className="text-sm text-blue-200">Certification Lead</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('workflows')}
              className="flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Workflows</span>
            </button>
          </li>
          <li>
            <button 
              className="flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150"
            >
              <FolderIcon className="w-5 h-5" />
              <span>Projects</span>
            </button>
          </li>
          <li>
            <button 
              className="flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              <span>Releases</span>
            </button>
          </li>
          <li>
            <button 
              onClick={onNewCertification}
              className="flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>Add Certification</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-800">
        <div className="text-sm text-blue-200">
          <p>Device Certification Portal</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  );
};