import { FC } from 'react';
import { 
  HomeIcon, 
  MagnifyingGlassIcon,
  BellIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  CommandLineIcon,
  ListBulletIcon,
  ShareIcon,
  BoltIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  onNavigate: (page: string) => void;
  onNewCertification: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onNavigate, onNewCertification }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="w-8 h-8" />
          <h1 className="text-xl font-bold">DeviceCert</h1>
        </div>
      </div>

      {/* User Profile */}
      <div className="flex-shrink-0 p-4 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.avatar || "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"}
            alt="User Avatar" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-blue-200">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
        <nav className="p-4">
          <div className="space-y-8">
            {/* Main Menu */}
            <div>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => onNavigate('/command-search')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150 ${
                      isActive('/command-search') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <CommandLineIcon className="w-5 h-5" />
                    <span>Cmd & Search</span>
                    <span className="ml-auto text-xs bg-blue-700 px-2 py-1 rounded">AI</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/home')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/home') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/updates')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/updates') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <BellIcon className="w-5 h-5" />
                    <span>Updates</span>
                    <span className="ml-auto text-xs bg-blue-700 px-2 py-1 rounded">AI</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/releases')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/releases') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <RocketLaunchIcon className="w-5 h-5" />
                    <span>Releases</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/tasks')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/tasks') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <ClipboardDocumentListIcon className="w-5 h-5" />
                    <span>My Tasks</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Workspace Section */}
            <div>
              <h2 className="px-3 text-sm font-semibold text-blue-200 uppercase tracking-wider mb-3">
                Workspace
              </h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => onNavigate('/projects')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/projects') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <FolderIcon className="w-5 h-5" />
                    <span>Projects</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/calendar')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/calendar') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span>Calendar</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/workflows')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/workflows') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Workflow Editor</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/sites-manage')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/sites-manage') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Access Control</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/teams')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/teams') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Teams</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/reports')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/reports') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Reports</span>
                    <span className="ml-auto text-xs bg-blue-700 px-2 py-1 rounded">AI</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/darp-ai')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg ${
                      isActive('/darp-ai') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span>DARP AI</span>
                    <span className="ml-auto text-xs bg-blue-700 px-2 py-1 rounded">AI</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/task-rules')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150 ${
                      isActive('/task-rules') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                    <span>Task Rules</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('/device-view')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition-colors duration-150 ${
                      isActive('/device-view') ? 'bg-blue-800' : ''
                    }`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                    <span>Device View</span>
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
                  <button 
                    onClick={() => onNavigate('/')}
                    className="flex items-center w-full px-3 py-2 text-blue-100 hover:bg-blue-700/50 rounded-lg transition-colors duration-150 text-sm"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span>Main Dashboard</span>
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
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 mt-auto p-4 border-t border-blue-800">
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-3 py-2 text-blue-100 hover:bg-blue-800 rounded-lg"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <div className="text-sm text-blue-200 mt-4">
          <p>Device Certification Portal</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  );
};