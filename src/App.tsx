import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Projects';
import { HomePage } from './components/HomePage';
import { NewCertificationModal } from './components/NewCertificationModal';
import JiraWorkflowEditor from './components/JiraWorkflowEditor';
import { DashboardContainer } from './components/dashboard/DashboardContainer';
import { TeamManagement } from './components/TeamManagement';
import { ToastContainer } from 'react-toastify';
import { LoginPage } from './components/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import KanbanReleasesBoard from './components/KanbanReleasesBoard';
import ReleasesCalendar from './components/ReleasesCalendar';
import { TaskRules } from './components/TaskRules';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { TasksPage } from './components/TasksPage';
import { LearnPage } from './components/LearnPage';
import { initializeLocalStorage } from './localStorageInit';
import { DeviceListPage } from './components/DeviceListPage';
import { DevicesView } from './components/DevicesView';

// Initialize localStorage with seed data if not already present
initializeLocalStorage();

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
          <Route path="/home" element={<HomePage />} />
       
          <Route path="/projects" element={<Dashboard onNewCertification={handleNewCertification} />} />
          <Route path="/dashboards/:id" element={<DashboardContainerWithId />} />
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
          <Route path="/releases" element={<KanbanReleasesBoard />} />
          <Route path="/calendar" element={<ReleasesCalendar />} />
       
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/task-rules" element={<TaskRules />} />
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
          <Route path="/device-view" element={<DevicesView/>} />
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

const DashboardContainerWithId = () => {
  const { id } = useParams();
  // Fix for TS: ensure dashboardId is always a string
  return <DashboardContainer dashboardId={id ?? ''} />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<LearnPage />} />
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