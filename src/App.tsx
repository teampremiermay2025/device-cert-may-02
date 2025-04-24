import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NewCertificationModal } from './components/NewCertificationModal';
import { WorkflowEditor } from './components/WorkflowEditor';
import { WorkflowList } from './components/WorkflowList';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showNewCertModal, setShowNewCertModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleNewCertification = () => {
    setShowNewCertModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        onNavigate={setCurrentPage}
        onNewCertification={handleNewCertification}
      />
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && (
          <Dashboard onNewCertification={handleNewCertification} />
        )}
        {currentPage === 'workflows' && (
          <div className="flex h-full">
            <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r`}>
              {showSidebar && <WorkflowList />}
            </div>
            <div className="flex-1">
              <div className="h-16 bg-white border-b px-4 flex items-center justify-between">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {showSidebar ? '←' : '→'}
                </button>
                <h1 className="text-xl font-semibold">Workflow Builder</h1>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
              <WorkflowEditor />
            </div>
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