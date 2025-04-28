import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HomePage } from './components/HomePage';
import { NewCertificationModal } from './components/NewCertificationModal';


import JiraWorkflowEditor from './components/JiraWorkflowEditor';
import { DashboardContainer } from './components/dashboard/DashboardContainer';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showNewCertModal, setShowNewCertModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleNewCertification = () => {
    setShowNewCertModal(true);
  };

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '') {
        setCurrentPage('dashboard');
      } else if (hash === '#/dashboards') {
        setCurrentPage('home');
      } else if (hash.startsWith('#/dashboards/')) {
        setCurrentPage('custom-dashboard');
      } else if (hash === '#/workflows') {
        setCurrentPage('workflows');
      } else if (hash === '#/iot') {
        setCurrentPage('iot');
      } else if (hash === '#/non-iot') {
        setCurrentPage('non-iot');
      } else if (hash === '#/device-config') {
        setCurrentPage('device-config');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Extract dashboard ID from hash if on a custom dashboard
  const dashboardId = currentPage === 'custom-dashboard' 
    ? window.location.hash.replace('#/dashboards/', '')
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        onNavigate={setCurrentPage}
        onNewCertification={handleNewCertification}
      />
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <HomePage />}
        {currentPage === 'home' && (
          <Dashboard onNewCertification={handleNewCertification} />
        )}
        {currentPage === 'custom-dashboard' && dashboardId && (
          <DashboardContainer dashboardId={dashboardId} />
        )}
        {currentPage === 'workflows' && (
          <div className="flex h-full">
            <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r`}>
              {showSidebar && <JiraWorkflowEditor />}
            </div>
          </div>
        )}
        {currentPage === 'iot' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">IoT Products</h1>
            <p className="text-gray-600 mt-2">IoT products management coming soon...</p>
          </div>
        )}
        {currentPage === 'non-iot' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Non-IoT Products</h1>
            <p className="text-gray-600 mt-2">Non-IoT products management coming soon...</p>
          </div>
        )}
        {currentPage === 'device-config' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Device Configuration</h1>
            <p className="text-gray-600 mt-2">Device configuration management coming soon...</p>
          </div>
        )}
      </main>

      <NewCertificationModal
        isOpen={showNewCertModal}
        onClose={() => setShowNewCertModal(false)}
      />
    </div>
  );
}

export default App;