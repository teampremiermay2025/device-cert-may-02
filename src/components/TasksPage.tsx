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
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'MY_TASKS' | 'DUE_NOW' | 'DUE_SOON' | 'UPCOMING'>('ALL');

  // Get all tasks from all certifications
  const allTasks = useMemo(() => {
    const certifications = storage.getCertifications();
    return certifications.flatMap(cert => cert.tasks);
  }, []);

  // Helper for quick filtering by due date and assignee
  const quickFilterTasks = (tasks: CertificationTask[]) => {
    if (quickFilter === 'ALL') return tasks;
    if (quickFilter === 'MY_TASKS') {
      return tasks.filter(task => task.assignee === user?.name);
    }
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const soonThreshold = new Date(now);
    soonThreshold.setDate(now.getDate() + 3);
    soonThreshold.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      if (quickFilter === 'DUE_NOW') {
        // Due today or overdue and not done
        return due <= endOfToday && task.status !== 'DONE';
      } else if (quickFilter === 'DUE_SOON') {
        // Due in next 3 days (excluding today)
        return due > endOfToday && due <= soonThreshold && task.status !== 'DONE';
      } else if (quickFilter === 'UPCOMING') {
        // Due after 3 days
        return due > soonThreshold && task.status !== 'DONE';
      }
      return true;
    });
  };

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

    // Apply quick filter
    tasks = quickFilterTasks(tasks);

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
  }, [allTasks, searchTerm, filters, sortConfig, user?.name, quickFilter]);

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
    <div className="p-8 bg-gradient-to-tr from-blue-50 to-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow mb-1">Tasks</h1>
        <p className="text-base text-blue-600">Manage and track all tasks across certifications</p>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-full border text-xs font-medium shadow-sm transition-all duration-150 ${quickFilter === 'ALL' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setQuickFilter('ALL')}
        >All</button>
        <button
          className={`px-3 py-1 rounded-full border text-xs font-medium shadow-sm transition-all duration-150 ${quickFilter === 'MY_TASKS' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setQuickFilter('MY_TASKS')}
        >My Tasks</button>
        <button
          className={`px-3 py-1 rounded-full border text-xs font-medium shadow-sm transition-all duration-150 ${quickFilter === 'DUE_NOW' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setQuickFilter('DUE_NOW')}
        >Due Now</button>
        <button
          className={`px-3 py-1 rounded-full border text-xs font-medium shadow-sm transition-all duration-150 ${quickFilter === 'DUE_SOON' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setQuickFilter('DUE_SOON')}
        >Due Soon</button>
        <button
          className={`px-3 py-1 rounded-full border text-xs font-medium shadow-sm transition-all duration-150 ${quickFilter === 'UPCOMING' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setQuickFilter('UPCOMING')}
        >Upcoming</button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border rounded-lg p-4 mb-4 shadow-md">
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
      <div className="bg-white border rounded-2xl overflow-hidden shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {COLUMNS.map(column => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-900"
                >
                  <span className="flex items-center gap-1">
                    {column.label}
                    <ChevronUpDownIcon className="w-4 h-4 inline-block align-middle" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center text-blue-300 py-8 text-lg italic">No tasks found.</td>
              </tr>
            )}
            {filteredTasks.map(task => (
              <tr
                key={task.id}
                className="hover:bg-blue-50 transition cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <td className="px-6 py-3 font-semibold text-blue-900 truncate max-w-xs">{task.name}</td>
                <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(task.status)}`}>{task.status}</span></td>
                <td className="px-6 py-3"><span className={`font-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                <td className="px-6 py-3 text-sm text-gray-700">{task.assignee || <span className="italic text-gray-400">Unassigned</span>}</td>
                <td className="px-6 py-3 text-xs text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-3 text-xs text-blue-600 font-semibold">{task.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};