import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DashboardLayout } from '../../types';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widget: Omit<DashboardLayout, 'id' | 'x' | 'y'>) => void;
}

export const AddWidgetModal: FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [widgetType, setWidgetType] = useState<DashboardLayout['type']>('activity');
  const [title, setTitle] = useState('');
  const [config, setConfig] = useState<DashboardLayout['config']>({});

  const handleSubmit = () => {
    onAdd({
      title,
      type: widgetType,
      width: 6,
      height: 4,
      config,
    });
    setTitle('');
    setWidgetType('activity');
    setConfig({});
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add Widget
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter widget title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Type
              </label>
              <select
                value={widgetType}
                onChange={(e) => {
                  setWidgetType(e.target.value as DashboardLayout['type']);
                  if (e.target.value === 'chart') {
                    setConfig({ chartType: 'line' });
                  }
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="activity">Activity Stream</option>
                <option value="tasks">Tasks</option>
                <option value="chart">Chart</option>
              </select>
            </div>

            {widgetType === 'chart' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chart Type
                </label>
                <select
                  value={config.chartType}
                  onChange={(e) => setConfig({ ...config, chartType: e.target.value as 'line' | 'bar' | 'pie' })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
            )}

            {widgetType === 'tasks' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.showCompleted}
                      onChange={(e) => setConfig({ ...config, showCompleted: e.target.checked })}
                      className="mr-2"
                    />
                    Show completed tasks
                  </label>
                  <select
                    value={config.sortBy}
                    onChange={(e) => setConfig({ ...config, sortBy: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Sort by...</option>
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due Date</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add Widget
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};