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