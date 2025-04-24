import { create } from 'zustand';
import { WorkflowStore, Workflow, CertificationStage } from '../types';
import { storage } from '../lib/storage';

const defaultWorkflow: Workflow = {
  id: 'default-workflow',
  name: 'Default Device Certification Workflow',
  description: 'Standard workflow for device certification process',
  status: 'active',
  version: 1,
  nodes: [],
  edges: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stages: [
    {
      id: 'forecast',
      name: 'FORECAST',
      tasks: [
        { id: 'f1', title: 'Initial Requirements Review', type: 'review', required: true },
        { id: 'f2', title: 'Resource Planning', type: 'planning', required: true },
        { id: 'f3', title: 'Timeline Estimation', type: 'planning', required: true }
      ]
    },
    {
      id: 'planning',
      name: 'PLANNING',
      tasks: [
        { id: 'p1', title: 'Compliance Requirements Review', type: 'review', required: true },
        { id: 'p2', title: 'Documentation Preparation', type: 'documentation', required: true },
        { id: 'p3', title: 'Test Plan Development', type: 'planning', required: true }
      ]
    },
    {
      id: 'submitted',
      name: 'SUBMITTED',
      tasks: [
        { id: 's1', title: 'Documentation Submission', type: 'submission', required: true },
        { id: 's2', title: 'Initial Verification', type: 'verification', required: true }
      ]
    },
    {
      id: 'submission-review',
      name: 'SUBMISSION_REVIEW',
      tasks: [
        { id: 'sr1', title: 'Technical Review', type: 'review', required: true },
        { id: 'sr2', title: 'Compliance Check', type: 'verification', required: true }
      ]
    },
    {
      id: 'device-entry',
      name: 'DEVICE_ENTRY',
      tasks: [
        { id: 'de1', title: 'Device Registration', type: 'registration', required: true },
        { id: 'de2', title: 'Initial Configuration', type: 'configuration', required: true }
      ]
    },
    {
      id: 'device-testing',
      name: 'DEVICE_TESTING',
      tasks: [
        { id: 'dt1', title: 'Functional Testing', type: 'testing', required: true },
        { id: 'dt2', title: 'Performance Testing', type: 'testing', required: true },
        { id: 'dt3', title: 'Compliance Testing', type: 'testing', required: true }
      ]
    },
    {
      id: 'taq-review',
      name: 'TAQ_REVIEW',
      tasks: [
        { id: 'tr1', title: 'Final Documentation Review', type: 'review', required: true },
        { id: 'tr2', title: 'Test Results Analysis', type: 'analysis', required: true }
      ]
    },
    {
      id: 'ta-complete',
      name: 'TA_COMPLETE',
      tasks: [
        { id: 'tc1', title: 'Certification Issuance', type: 'certification', required: true },
        { id: 'tc2', title: 'Final Documentation', type: 'documentation', required: true }
      ]
    },
    {
      id: 'closed',
      name: 'CLOSED',
      tasks: [
        { id: 'c1', title: 'Project Archival', type: 'archival', required: true },
        { id: 'c2', title: 'Final Report Generation', type: 'reporting', required: true }
      ]
    }
  ]
};

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: [defaultWorkflow],
  selectedWorkflow: defaultWorkflow,
  predefinedTasks: {},
  setWorkflows: (workflows) => {
    set({ workflows });
    storage.saveWorkflows(workflows);
  },
  addWorkflow: (workflow) => 
    set((state) => {
      const newWorkflows = [...state.workflows, workflow];
      storage.saveWorkflows(newWorkflows);
      return { workflows: newWorkflows };
    }),
  updateWorkflow: (workflow) =>
    set((state) => {
      const newWorkflows = state.workflows.map((w) => 
        w.id === workflow.id ? workflow : w
      );
      storage.saveWorkflows(newWorkflows);
      return { workflows: newWorkflows };
    }),
  deleteWorkflow: (id) =>
    set((state) => {
      const newWorkflows = state.workflows.filter((w) => w.id !== id);
      storage.saveWorkflows(newWorkflows);
      return {
        workflows: newWorkflows,
        selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
      };
    }),
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  addPredefinedTask: (category, task) =>
    set((state) => ({
      predefinedTasks: {
        ...state.predefinedTasks,
        [category]: [...(state.predefinedTasks[category] || []), task],
      },
    })),
}));