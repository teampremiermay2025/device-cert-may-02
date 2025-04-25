import { FC, useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { DashboardView } from './DashboardView';
import { Dashboard } from '../../types';

interface DashboardContainerProps {
  dashboardId: string;
}

export const DashboardContainer: FC<DashboardContainerProps> = ({ dashboardId }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    const dashboards = storage.getDashboards();
    const found = dashboards.find(d => d.id === dashboardId);
    if (found) {
      setDashboard(found);
    }
  }, [dashboardId]);

  const handleSave = (updatedDashboard: Dashboard) => {
    const dashboards = storage.getDashboards();
    const updatedDashboards = dashboards.map(d =>
      d.id === updatedDashboard.id ? updatedDashboard : d
    );
    storage.saveDashboards(updatedDashboards);
    setDashboard(updatedDashboard);
  };

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Dashboard not found</p>
      </div>
    );
  }

  return <DashboardView dashboard={dashboard} onSave={handleSave} />;
};