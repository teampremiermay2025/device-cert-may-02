import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { TasksPage } from './components/TasksPage';

// Wrap the main app content in a component to use hooks
const AppContent = () => {
  const [showNewCertModal, setShowNewCertModal] = useState(false);
  const navigate = useNavigate();

  const handleNewCertification = () => {
    setShowNewCertModal(true);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        onNavigate={handleNavigate}
        onNewCertification={handleNewCertification}
      />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<Dashboard onNewCertification={handleNewCertification} />} />
          <Route path="/dashboards/:id" element={<DashboardContainer dashboardId="" />} />
          <Route path="/workflows" element={<JiraWorkflowEditor />} />
          <Route path="/command-search" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Command & Search</h1>
              <p className="text-gray-600 mt-2">AI-powered command and search coming soon...</p>
            </div>
          } />
          <Route path="/updates" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Updates Feed</h1>
              <p className="text-gray-600 mt-2">AI-powered updates feed coming soon...</p>
            </div>
          } />
          <Route path="/releases" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Releases</h1>
              <p className="text-gray-600 mt-2">Release management coming soon...</p>
            </div>
          } />
          <Route path="/my-tasks" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">My Tasks</h1>
              <p className="text-gray-600 mt-2">Personal task management coming soon...</p>
            </div>
          } />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/teams" element={
            <ProtectedRoute requiredPermission="canManageTeams">
              <TeamManagement />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Reports</h1>
              <p className="text-gray-600 mt-2">AI-powered reports coming soon...</p>
            </div>
          } />
          <Route path="/darp-ai" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">DARP AI</h1>
              <p className="text-gray-600 mt-2">AI assistant features coming soon...</p>
            </div>
          } />
        </Routes>
      </main>

      <NewCertificationModal
        isOpen={showNewCertModal}
        onClose={() => setShowNewCertModal(false)}
      />
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;