import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { CertificationTask, TaskStatus } from '../types';
import { TaskDetailModal } from './TaskDetailModal';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  UserCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const COLUMNS = [
  { key: 'name', label: 'Task Name', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'assignee', label: 'Assignee', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true },
  { key: 'stage', label: 'Stage', sortable: true },
];

export const TasksPage = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<CertificationTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [] as TaskStatus[],
    assignedToMe: false,
    pastDue: false,
    unassigned: false,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get all tasks from all certifications
  const allTasks = useMemo(() => {
    const certifications = storage.getCertifications();
    return certifications.flatMap(cert => cert.tasks);
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];

    // Apply search
    if (searchTerm) {
      tasks = tasks.filter(task => 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status.length > 0) {
      tasks = tasks.filter(task => filters.status.includes(task.status));
    }
    if (filters.assignedToMe) {
      tasks = tasks.filter(task => task.assignee === user?.name);
    }
    if (filters.unassigned) {
      tasks = tasks.filter(task => !task.assignee);
    }
    if (filters.pastDue) {
      const now = new Date();
      tasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
      );
    }

    // Apply sorting
    if (sortConfig) {
      tasks.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof CertificationTask];
        const bValue = b[sortConfig.key as keyof CertificationTask];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return tasks;
  }, [allTasks, searchTerm, filters, sortConfig, user?.name]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleTaskUpdate = (updatedTask: CertificationTask) => {
    const certifications = storage.getCertifications();
    const updatedCertifications = certifications.map(cert => ({
      ...cert,
      tasks: cert.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    }));
    storage.saveCertifications(updatedCertifications);
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      'TODO': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'REVIEW': 'bg-yellow-100 text-yellow-800',
      'DONE': 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'HIGH': 'text-red-600',
      'MEDIUM': 'text-orange-600',
      'LOW': 'text-green-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-sm text-gray-500">Manage and track all tasks across certifications</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="space-x-2">
                  {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                    <label key={status} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status as TaskStatus)}
                        onChange={(e) => {
                          setFilters(prev => ({
                            ...prev,
                            status: e.target.checked
                              ? [...prev.status, status as TaskStatus]
                              : prev.status.filter(s => s !== status)
                          }));
                        }}
                        className="mr-1"
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.assignedToMe}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignedToMe: e.target.checked }))}
                    className="mr-2"
                  />
                  Assigned to me
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.unassigned}
                    onChange={(e) => setFilters(prev => ({ ...prev, unassigned: e.target.checked }))}
                    className="mr-2"
                  />
                  Unassigned
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.pastDue}
                    onChange={(e) => setFilters(prev => ({ ...prev, pastDue: e.target.checked }))}
                    className="mr-2"
                  />
                  Past due
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    className="flex items-center gap-1"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && <ChevronUpDownIcon className="w-4 h-4" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <tr
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={task.status === 'DONE'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleTaskUpdate({
                          ...task,
                          status: e.target.checked ? 'DONE' : 'TODO'
                        });
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{task.name}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500">{task.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      <span>{task.assignee}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {task.dueDate ? (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      {new Date(task.dueDate) < new Date() && task.status !== 'DONE' && (
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">No due date</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-500">{task.stage}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};