import { FC, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { CertificationTask, TaskStatus } from '../types';
import { getTaskStatusColor, getTaskPriorityIcon, getTaskPriorityColor } from '../lib/workflow';

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

const TaskCard: FC<{ task: CertificationTask }> = ({ task }) => (
  <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing">
    <div className="flex items-start gap-2">
      <span className={`font-mono ${getTaskPriorityColor(task.priority)}`}>
        {getTaskPriorityIcon(task.priority)}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {task.name}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-500 truncate mt-1">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {task.labels.map(label => (
            <span
              key={label}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        {task.assignee && (
          <span>{task.assignee}</span>
        )}
        {task.dueDate && (
          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {task.comments.length > 0 && (
          <span>{task.comments.length} 💬</span>
        )}
        {task.attachments.length > 0 && (
          <span>{task.attachments.length} 📎</span>
        )}
      </div>
    </div>
  </div>
);

export const TaskBoard: FC<TaskBoardProps> = ({ tasks, onTaskUpdate, onTaskClick }) => {
  // Create a layout object for each task
  const generateLayout = () => {
    const layout = tasks.map((task, index) => {
      const columnIndex = columns.findIndex(col => col.id === task.status);
      return {
        i: task.id,
        x: columnIndex * 3, // Each column is 3 units wide
        y: index,
        w: 3,
        h: 4,
        static: false
      };
    });
    return layout;
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

  return (
    <div className="h-full">
      <div className="grid grid-cols-4 gap-4 mb-4">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 p-3 rounded-lg">
            <h3 className="font-semibold mb-2">{column.title}</h3>
            <span className="text-sm text-gray-500">
              {tasks.filter(task => task.status === column.id).length} tasks
            </span>
          </div>
        ))}
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: generateLayout() }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable={false}
        margin={[16, 16]}
      >
        {tasks.map(task => (
          <div key={task.id} onClick={() => onTaskClick(task)}>
            <TaskCard task={task} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};