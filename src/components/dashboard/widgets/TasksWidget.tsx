import { FC } from 'react';
import { CertificationTask } from '../../../types';

interface TasksWidgetProps {
  config?: {
    viewType?: 'list' | 'board';
    showCompleted?: boolean;
    sortBy?: string;
  };
}

export const TasksWidget: FC<TasksWidgetProps> = ({ config }) => {
  // Sample tasks - in a real app, these would come from your backend
  const tasks: CertificationTask[] = [
    {
      id: '1',
      name: 'Review Documentation',
      status: 'TODO',
      isChecked: false,
      priority: 'HIGH',
      labels: ['documentation'],
      stage: 'PLANNING',
      attachments: [],
      comments: [],
    },
    {
      id: '2',
      name: 'Update Test Cases',
      status: 'IN_PROGRESS',
      isChecked: false,
      priority: 'MEDIUM',
      labels: ['testing'],
      stage: 'PLANNING',
      attachments: [],
      comments: [],
    },
    {
      id: '3',
      name: 'Final Approval',
      status: 'REVIEW',
      isChecked: false,
      priority: 'HIGH',
      labels: ['approval'],
      stage: 'PLANNING',
      attachments: [],
      comments: [],
    },
  ];

  const filteredTasks = config?.showCompleted
    ? tasks
    : tasks.filter((task) => task.status !== 'DONE');

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (config?.sortBy === 'priority') {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
        >
          <input
            type="checkbox"
            checked={task.status === 'DONE'}
            className="mr-3 rounded border-gray-300"
            readOnly
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {task.name}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                task.priority === 'HIGH'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <span className={`ml-3 flex-shrink-0 font-medium text-sm ${
            task.status === 'TODO'
              ? 'text-gray-500'
              : task.status === 'IN_PROGRESS'
              ? 'text-blue-600'
              : task.status === 'REVIEW'
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}>
            {task.status}
          </span>
        </div>
      ))}
    </div>
  );
};