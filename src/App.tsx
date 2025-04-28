import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HomePage } from './components/HomePage';
import { NewCertificationModal } from './components/NewCertificationModal';
import JiraWorkflowEditor from './components/JiraWorkflowEditor';
import { DashboardContainer } from './components/dashboard/DashboardContainer';
import { TeamManagement } from './components/TeamManagement';
import { ToastContainer } from 'react-toastify';
import { LoginPage } from './components/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
 
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [showNewCertModal, setShowNewCertModal] = useState(false);

  const handleNewCertification = () => {
    setShowNewCertModal(true);
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar 
                  onNavigate={() => {}}
                  onNewCertification={handleNewCertification}
                />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<Dashboard onNewCertification={handleNewCertification} />} />
                    <Route path="/dashboards/:id" element={<DashboardContainer dashboardId="" />} />
                    <Route path="/workflows" element={<JiraWorkflowEditor />} />
                    <Route path="/teams" element={
                      <ProtectedRoute requiredPermission="canManageTeams">
                        <TeamManagement />
                      </ProtectedRoute>
                    } />
                    {/* Add more routes as needed */}
                  </Routes>
                </main>

                <NewCertificationModal
                  isOpen={showNewCertModal}
                  onClose={() => setShowNewCertModal(false)}
                />
                <ToastContainer />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;