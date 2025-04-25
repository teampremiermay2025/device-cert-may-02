import { FC, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Dashboard, DashboardLayout } from '../../types';
import { ActivityStream } from './widgets/ActivityStream';
import { TasksWidget } from './widgets/TasksWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { AddWidgetModal } from './AddWidgetModal';
import { PlusIcon } from '@heroicons/react/24/outline';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardViewProps {
  dashboard: Dashboard;
  onSave: (dashboard: Dashboard) => void;
}

export const DashboardView: FC<DashboardViewProps> = ({ dashboard, onSave }) => {
  const [layouts, setLayouts] = useState(dashboard.layout);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const handleLayoutChange = (newLayout: any) => {
    const updatedLayouts = layouts.map((item) => {
      const layoutItem = newLayout.find((l: any) => l.i === item.id);
      if (layoutItem) {
        return {
          ...item,
          x: layoutItem.x,
          y: layoutItem.y,
          width: layoutItem.w,
          height: layoutItem.h,
        };
      }
      return item;
    });

    setLayouts(updatedLayouts);
    onSave({
      ...dashboard,
      layout: updatedLayouts,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddWidget = (widget: Omit<DashboardLayout, 'id' | 'x' | 'y'>) => {
    const newWidget: DashboardLayout = {
      ...widget,
      id: crypto.randomUUID(),
      x: 0,
      y: Infinity, // Add to bottom
    };

    const updatedLayouts = [...layouts, newWidget];
    setLayouts(updatedLayouts);
    onSave({
      ...dashboard,
      layout: updatedLayouts,
      updatedAt: new Date().toISOString(),
    });
    setShowAddWidget(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updatedLayouts = layouts.filter((item) => item.id !== widgetId);
    setLayouts(updatedLayouts);
    onSave({
      ...dashboard,
      layout: updatedLayouts,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{dashboard.title}</h1>
          {dashboard.description && (
            <p className="text-sm text-gray-500 mt-1">{dashboard.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddWidget(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Widget
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts.map(l => ({
          i: l.id,
          x: l.x,
          y: l.y,
          w: l.width,
          h: l.height,
          minW: 3,
          minH: 2,
        })) }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={(layout) => handleLayoutChange(layout)}
        isDraggable
        isResizable
      >
        {layouts.map((widget) => (
          <div key={widget.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              <button
                onClick={() => handleRemoveWidget(widget.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {widget.type === 'activity' && <ActivityStream />}
            {widget.type === 'tasks' && <TasksWidget config={widget.config} />}
            {widget.type === 'chart' && <ChartWidget config={widget.config} />}
          </div>
        ))}
      </ResponsiveGridLayout>

      <AddWidgetModal
        isOpen={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        onAdd={handleAddWidget}
      />
    </div>
  );
};