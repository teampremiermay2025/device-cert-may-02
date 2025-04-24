import { create } from 'zustand';
import { WorkflowStore } from '../types';

const initialPredefinedTasks = {
  'Deliverable Requirements': [
    'PreAuth Requirements',
    'Sample Requirements',
    'PTCRB Requirements',
    'Firmware Requirements',
    'Attestation Requirements',
  ],
  'Compliance Requirements': [
    'Chapter 1 Review',
    'Chapter 2 Review',
    'Chapter 3 Review',
    'Chapter 4 Review',
    'Chapter 5 Review',
  ],
};

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: [],
  selectedWorkflow: null,
  predefinedTasks: initialPredefinedTasks,
  setWorkflows: (workflows) => set({ workflows }),
  addWorkflow: (workflow) => 
    set((state) => ({ workflows: [...state.workflows, workflow] })),
  updateWorkflow: (workflow) =>
    set((state) => ({
      workflows: state.workflows.map((w) => 
        w.id === workflow.id ? workflow : w
      ),
    })),
  deleteWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
    })),
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  addPredefinedTask: (category, task) =>
    set((state) => ({
      predefinedTasks: {
        ...state.predefinedTasks,
        [category]: [...(state.predefinedTasks[category] || []), task],
      },
    })),
}));