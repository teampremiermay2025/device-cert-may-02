import { FC, useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Dashboard } from '../types';
import { storage } from '../lib/storage';
import { Dialog } from '@headlessui/react';

interface NewDashboardFormData {
  title: string;
  description: string;
  type: 'empty' | 'default' | 'custom';
  sharedWith: string[];
}

export const HomePage: FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [showNewDashboardModal, setShowNewDashboardModal] = useState(false);
  const [formData, setFormData] = useState<NewDashboardFormData>({
    title: '',
    description: '',
    type: 'empty',
    sharedWith: [],
  });
  const [newSharedUser, setNewSharedUser] = useState('');

  useEffect(() => {
    const handleDashboardsUpdate = () => {
      setDashboards(storage.getDashboards());
    };

    window.addEventListener('dashboards-updated', handleDashboardsUpdate);
    handleDashboardsUpdate();

    return () => {
      window.removeEventListener('dashboards-updated', handleDashboardsUpdate);
    };
  }, []);

  const handleCreateDashboard = () => {
    const newDashboard: Dashboard = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      sharedWith: formData.sharedWith,
      layout: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Alex Carter', // In a real app, this would come from auth
    };

    storage.saveDashboards([...dashboards, newDashboard]);
    setShowNewDashboardModal(false);
    setFormData({
      title: '',
      description: '',
      type: 'empty',
      sharedWith: [],
    });
  };

  const handleAddSharedUser = () => {
    if (newSharedUser && !formData.sharedWith.includes(newSharedUser)) {
      setFormData({
        ...formData,
        sharedWith: [...formData.sharedWith, newSharedUser],
      });
      setNewSharedUser('');
    }
  };

  const handleRemoveSharedUser = (user: string) => {
    setFormData({
      ...formData,
      sharedWith: formData.sharedWith.filter(u => u !== user),
    });
  };

  const handleNavigate = (dashboardId: string) => {
    if (dashboardId === 'main-dashboard') {
      window.location.hash = '#/dashboard';
    } else {
      window.location.hash = `#/dashboards/${dashboardId}`;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboards</h1>
          <p className="mt-1 text-sm text-gray-500">Select a dashboard to view or create a new one</p>
        </div>
        <button 
          onClick={() => setShowNewDashboardModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out shadow-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          <div
            key={dashboard.id}
            onClick={() => handleNavigate(dashboard.id)}
            className="block bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-150 ease-in-out cursor-pointer"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{dashboard.title}</h3>
              {dashboard.description && (
                <p className="text-sm text-gray-500 mb-4">{dashboard.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Last updated: {new Date(dashboard.updatedAt).toLocaleDateString()}
                </span>
                <span className="text-blue-600 font-medium">View →</span>
              </div>
              {(dashboard.sharedWith || []).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Shared with:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(dashboard.sharedWith || []).map((user) => (
                      <span key={user} className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                        {user}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Dashboard Modal */}
      <Dialog
        open={showNewDashboardModal}
        onClose={() => setShowNewDashboardModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Create New Dashboard
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dashboard Name
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter dashboard name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter dashboard description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dashboard Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'empty' | 'default' | 'custom' })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="empty">Empty Dashboard</option>
                  <option value="default">Default System Dashboard</option>
                  <option value="custom">Custom Dashboard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share with
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSharedUser}
                    onChange={(e) => setNewSharedUser(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Enter email or username"
                  />
                  <button
                    onClick={handleAddSharedUser}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                {formData.sharedWith.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.sharedWith.map((user) => (
                      <span
                        key={user}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {user}
                        <button
                          onClick={() => handleRemoveSharedUser(user)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewDashboardModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDashboard}
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Dashboard
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};