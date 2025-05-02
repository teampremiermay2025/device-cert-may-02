import { FC, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { CertificationTask, TaskStatus } from '../types';
import { getTaskPriorityIcon, getTaskPriorityColor } from '../lib/workflow';
import { MagnifyingGlassIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import users from '../data/users.json';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface TaskBoardProps {
  tasks: CertificationTask[];
  onTaskUpdate: (task: CertificationTask) => void;
  onTaskClick: (task: CertificationTask) => void;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'DONE', title: 'Done' }
];

const getUserById = (id: string) => users.users.find(u => u.id === id);

const UserBubble: FC<{ userId: string }> = ({ userId }) => {
  const user = getUserById(userId);
  if (!user) return null;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-6 h-6 rounded-full border border-gray-200"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
          {getInitials(user.name)}
        </div>
      )}
      <span className="text-xs font-medium text-gray-600">{user.name}</span>
    </div>
  );
};

const TaskCard: FC<{ task: CertificationTask; onDetailsClick?: () => void }> = ({ task, onDetailsClick }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-blue-200/60 transition-all duration-200">
    <div className="flex items-start gap-3">
      <span className={`font-mono text-lg ${getTaskPriorityColor(task.priority)}`}>
        {getTaskPriorityIcon(task.priority)}
      </span>
      <div className="flex-1 min-w-0">
        {onDetailsClick && (
          <h4 
            onClick={e => {
              e.stopPropagation();
              onDetailsClick();
            }}
            className="font-medium text-gray-900 mb-1.5 hover:text-blue-600 cursor-pointer transition-colors no-drag line-clamp-2"
          >
            {task.name}
          </h4>
        )}
        {task.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{task.description}</p>
        )}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.labels.map(label => (
              <span
                key={label}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {task.assignee && <UserBubble userId={task.assignee} />}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-gray-500">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1">
                💬 {task.comments.length}
              </span>
            )}
            {task.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                📎 {task.attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TaskBoard: FC<TaskBoardProps> = ({ tasks, onTaskUpdate, onTaskClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const generateLayout = () => {
    return tasks.map((task, index) => {
      const columnIndex = columns.findIndex(col => col.id === task.status);
      return {
        i: task.id,
        x: columnIndex * 3,
        y: index,
        w: 3,
        h: 4,
        static: false
      };
    });
  };

  const handleLayoutChange = (newLayout: any) => {
    newLayout.forEach((item: any) => {
      const task = tasks.find(t => t.id === item.i);
      if (task) {
        const columnIndex = Math.floor(item.x / 3);
        const newStatus = columns[columnIndex]?.id;
        if (newStatus && task.status !== newStatus) {
          const updatedTask = {
            ...task,
            status: newStatus
          };
          onTaskUpdate(updatedTask);
        }
      }
    });
  };

  const currentUser = users.users[0]; // Using first user as example
  const userInitials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
       
        </div>
        <div className="flex items-center gap-4">
         
          <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-1">{column.title}</h3>
            <span className="text-xs text-gray-500">
              {tasks.filter(task => task.status === column.id).length} tasks
            </span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50/50 rounded-xl border border-gray-200/60">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: generateLayout() }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }}
          rowHeight={30}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable={false}
          margin={[16, 16]}
          draggableCancel=".no-drag"
        >
          {tasks.map(task => (
            <div key={task.id}>
              <TaskCard task={task} onDetailsClick={() => onTaskClick(task)} />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};