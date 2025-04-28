import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HomePage } from './components/HomePage';
import { NewCertificationModal } from './components/NewCertificationModal';
import JiraWorkflowEditor from './components/JiraWorkflowEditor';
import { DashboardContainer } from './components/dashboard/DashboardContainer';
import { TeamManagement } from './components/TeamManagement';
import { ToastContainer } from 'react-toastify';
 

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showNewCertModal, setShowNewCertModal] = useState(false);
  

  const handleNewCertification = () => {
    setShowNewCertModal(true);
  };

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '') {
        setCurrentPage('home');
      } else if (hash === '#/projects') {
        setCurrentPage('dashboard');
      } else if (hash.startsWith('#/dashboards/')) {
        setCurrentPage('custom-dashboard');
      } else if (hash === '#/workflows') {
        setCurrentPage('workflows');
      } else if (hash === '#/command-search') {
        setCurrentPage('command-search');
      } else if (hash === '#/updates') {
        setCurrentPage('updates');
      } else if (hash === '#/releases') {
        setCurrentPage('releases');
      } else if (hash === '#/my-tasks') {
        setCurrentPage('my-tasks');
      } else if (hash === '#/tasks') {
        setCurrentPage('tasks');
      } else if (hash === '#/teams') {
        setCurrentPage('teams');
      } else if (hash === '#/reports') {
        setCurrentPage('reports');
      } else if (hash === '#/darp-ai') {
        setCurrentPage('darp-ai');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'home':
        window.location.hash = '';
        break;
      case 'projects':
        window.location.hash = '#/projects';
        break;
      default:
        window.location.hash = `#/${page}`;
    }
  };

  // Extract dashboard ID from hash if on a custom dashboard
  const dashboardId = currentPage === 'custom-dashboard' 
    ? window.location.hash.replace('#/dashboards/', '')
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        onNavigate={handleNavigate}
        onNewCertification={handleNewCertification}
      />
      <main className="flex-1 overflow-auto">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'dashboard' && (
          <Dashboard onNewCertification={handleNewCertification} />
        )}
        {currentPage === 'custom-dashboard' && dashboardId && (
          <DashboardContainer dashboardId={dashboardId} />
        )}
        {currentPage === 'workflows' && (
            <JiraWorkflowEditor />
        )}
        {currentPage === 'command-search' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Command & Search</h1>
            <p className="text-gray-600 mt-2">AI-powered command and search coming soon...</p>
          </div>
        )}
        {currentPage === 'updates' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Updates Feed</h1>
            <p className="text-gray-600 mt-2">AI-powered updates feed coming soon...</p>
          </div>
        )}
        {currentPage === 'releases' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Releases</h1>
            <p className="text-gray-600 mt-2">Release management coming soon...</p>
          </div>
        )}
        {currentPage === 'my-tasks' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-gray-600 mt-2">Personal task management coming soon...</p>
          </div>
        )}
        {currentPage === 'tasks' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-gray-600 mt-2">Task management coming soon...</p>
          </div>
        )}
        {currentPage === 'teams' && <TeamManagement />}
        {currentPage === 'reports' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-gray-600 mt-2">AI-powered reports coming soon...</p>
          </div>
        )}
        {currentPage === 'darp-ai' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">DARP AI</h1>
            <p className="text-gray-600 mt-2">AI assistant features coming soon...</p>
          </div>
        )}
      </main>

      <NewCertificationModal
        isOpen={showNewCertModal}
        onClose={() => setShowNewCertModal(false)}
      />
       <ToastContainer />
    </div>
  );
}

export default App;