import { FC } from 'react';
import { HomeIcon, FolderIcon, RocketLaunchIcon, PlusCircleIcon, ShareIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface SidebarProps {
  onNavigate: (page: string) => void;
  onNewCertification: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onNavigate, onNewCertification }) => {
  const currentPath = window.location.hash.replace('#/', '') || 'home';

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="w-8 h-8" />
          <h1 className="text-xl font-bold">DeviceCert</h1>
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
        <div className="mb-8">
          <h2 className="px-3 text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">Menu</h2>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => onNavigate('home')}
                className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150 relative ${
                  isActive('home') ? 'bg-blue-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-400 before:rounded-r' : ''
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150 relative ${
                  isActive('dashboard') ? 'bg-blue-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-400 before:rounded-r' : ''
                }`}
              >
                <FolderIcon className="w-5 h-5" />
                <span>Main Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('workflows')}
                className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150 relative ${
                  isActive('workflows') ? 'bg-blue-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-400 before:rounded-r' : ''
                }`}
              >
                <ShareIcon className="w-5 h-5" />
                <span>Workflows</span>
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
        </div>

        {/* Favorites Section */}
        <div className="bg-blue-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between px-3 mb-3">
            <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Favorites</h2>
            <button className="text-blue-300 hover:text-blue-200">
              <StarIcon className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            <li>
              <button className="flex items-center w-full px-3 py-2 text-blue-100 hover:bg-blue-700/50 rounded-lg transition-colors duration-150 text-sm">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Device Schedule</span>
                </div>
                <StarIconSolid className="w-3.5 h-3.5 text-yellow-400 ml-2" />
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-3 py-2 text-blue-100 hover:bg-blue-700/50 rounded-lg transition-colors duration-150 text-sm">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span>Waiver Requests</span>
                </div>
                <StarIconSolid className="w-3.5 h-3.5 text-yellow-400 ml-2" />
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-3 py-2 text-blue-100 hover:bg-blue-700/50 rounded-lg transition-colors duration-150 text-sm">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Device List</span>
                </div>
                <StarIconSolid className="w-3.5 h-3.5 text-yellow-400 ml-2" />
              </button>
            </li>
          </ul>
        </div>
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