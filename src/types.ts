import { Edge as ReactFlowEdge, Node as ReactFlowNode } from 'reactflow';

export interface Node extends ReactFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    status?: 'pending' | 'active' | 'completed' | 'error';
    progress?: number;
  };
}

export interface Edge extends ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
  stages: WorkflowStage[];
}

export interface WorkflowStage {
  id: string;
  name: CertificationStage;
  tasks: WorkflowTask[];
}

export type CertificationStage = 
  | 'FORECAST'
  | 'PLANNING'
  | 'SUBMITTED'
  | 'SUBMISSION_REVIEW'
  | 'DEVICE_ENTRY'
  | 'DEVICE_TESTING'
  | 'TAQ_REVIEW'
  | 'TA_COMPLETE'
  | 'CLOSED';

export interface WorkflowTask {
  id: string;
  title: string;
  type: string;
  description?: string;
  required: boolean;
}

export interface CertificationRequest {
  id: string;
  darpKey: string;
  projectName: string;
  type: string;
  status: CertificationStage;
  lastUpdated: string;
  targetDate: string;
  softwareVersion: string;
  tasks: CertificationTask[];
  issues: CertificationIssue[];
  workflow: string;
  // Extended fields
  vendor: string;
  deviceType: string;
  deviceModel: string;
  deviceMarketingName: string;
  deviceCodeName: string;
  deviceOS: string;
  deviceOSVersion: string;
  deviceHardwareVersion: string;
  devicePaymentType: string;
  deviceChannel: string;
  securityLevel: string;
  assignee: string;
  reporter: string;
  primaryPC: string;
  vendorProjectLead: string;
  createdAt: string;
  updatedAt: string;
  forecastedDEDate: string;
  forecastedFFWDate: string;
  forecastedTADate: string;
  forecastedLaunchDate: string;
  components: string;
  affectsVersion: string;
  resolution: string;
}

export interface CertificationTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  isChecked: boolean;
  assignee?: string;
  priority: TaskPriority;
  dueDate?: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  timeSpent?: number;
  labels: string[];
  stage: CertificationStage;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PENDING_REVIEW' | 'READY_FOR_REVIEW' | 'PENDING_APPROVAL';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface CertificationIssue {
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info';
}

export interface WorkflowStore {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  predefinedTasks: Record<string, string[]>;
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (workflow: Workflow) => void;
  deleteWorkflow: (id: string) => void;
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  addPredefinedTask: (category: string, task: string) => void;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  type: 'empty' | 'default' | 'custom';
  sharedWith: string[];
  layout: DashboardLayout[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DashboardLayout {
  id: string;
  type: 'activity' | 'chart' | 'tasks' | 'custom';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config?: {
    chartType?: 'line' | 'bar' | 'pie';
    dataSource?: string;
    filters?: Record<string, any>;
    viewType?: 'list' | 'board' | 'timeline';
    showCompleted?: boolean;
    sortBy?: string;
    groupBy?: string;
  };
}