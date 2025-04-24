export interface Node {
  id: string;
  type: 'start' | 'task' | 'decision' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    status?: 'pending' | 'active' | 'completed' | 'error';
    progress?: number;
  };
}

export interface Edge {
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

export interface CertificationRequest {
  id: string;
  projectName: string;
  type: string;
  status: string;
  lastUpdated: string;
  darpKey: string;
  targetDate: string;
  softwareVersion: string;
  tasks: CertificationTask[];
  issues: CertificationIssue[];
}

export interface CertificationTask {
  id: number;
  name: string;
  status: 'pending' | 'completed';
  isChecked: boolean;
}

export interface CertificationIssue {
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info';
}