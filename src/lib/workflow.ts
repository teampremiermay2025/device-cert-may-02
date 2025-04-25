import { CertificationStage, CertificationTask, TaskStatus, WorkflowStage } from '../types';

export const getNextStage = (currentStage: CertificationStage): CertificationStage | null => {
  const stages: CertificationStage[] = [
    'FORECAST',
    'PLANNING',
    'SUBMITTED',
    'SUBMISSION_REVIEW',
    'DEVICE_ENTRY',
    'DEVICE_TESTING',
    'TAQ_REVIEW',
    'TA_COMPLETE',
    'CLOSED'
  ];

  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex < stages.length - 1) {
    return stages[currentIndex + 1];
  }
  return null;
};

export const createTasksForStage = (stage: WorkflowStage): CertificationTask[] => {
  return stage.tasks.map(task => ({
    id: crypto.randomUUID(),
    name: task.title,
    description: task.description,
    status: 'TODO' as TaskStatus,
    isChecked: false,
    priority: 'MEDIUM',
    attachments: [],
    comments: [],
    labels: [task.type],
    stage: stage.name
  }));
};

export const getStageColor = (stage: CertificationStage): string => {
  const colors: Record<CertificationStage, string> = {
    'FORECAST': 'bg-purple-100 text-purple-800',
    'PLANNING': 'bg-blue-100 text-blue-800',
    'SUBMITTED': 'bg-yellow-100 text-yellow-800',
    'SUBMISSION_REVIEW': 'bg-orange-100 text-orange-800',
    'DEVICE_ENTRY': 'bg-cyan-100 text-cyan-800',
    'DEVICE_TESTING': 'bg-indigo-100 text-indigo-800',
    'TAQ_REVIEW': 'bg-pink-100 text-pink-800',
    'TA_COMPLETE': 'bg-green-100 text-green-800',
    'CLOSED': 'bg-gray-100 text-gray-800'
  };
  return colors[stage];
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    'TODO': 'bg-gray-100 text-gray-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'REVIEW': 'bg-yellow-100 text-yellow-800',
    'DONE': 'bg-green-100 text-green-800'
  };
  return colors[status];
};

export const getTaskPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return '↑';
    case 'LOW':
      return '↓';
    default:
      return '=';
  }
};

export const getTaskPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    'HIGH': 'text-red-600',
    'MEDIUM': 'text-orange-600',
    'LOW': 'text-green-600'
  };
  return colors[priority] || 'text-gray-600';
};