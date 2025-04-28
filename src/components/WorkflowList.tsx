import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowModal } from './WorkflowModal';
import type { CertificationStage } from '../types';

const CERTIFICATION_STAGES: CertificationStage[] = [
  'FORECAST',
  'PLANNING',
  'SUBMITTED',
  'SUBMISSION_REVIEW',
  'DEVICE_ENTRY',
  'DEVICE_TESTING',
  'TAQ_REVIEW',
  'TA_COMPLETE',
  'CLOSED',
];

export const WorkflowList = () => {
  const { workflows, setSelectedWorkflow, addWorkflow, deleteWorkflow, selectedWorkflow } = useWorkflowStore();
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  const handleCreateWorkflow = () => {
    const defaultStages = CERTIFICATION_STAGES.map(stage => ({
      id: stage.toLowerCase().replace(/\s+/g, '-'),
      name: stage,
      tasks: [],
    }));

    // Initialize nodes from stages
    const defaultNodes = defaultStages.map((stage, i) => ({
      id: stage.id,
      type: 'stage',
      position: { x: 100 + i * 200, y: 100 },
      data: { label: stage.name },
    }));

    const newWorkflow = {
      id: crypto.randomUUID(),
      name: newWorkflowName,
      description: newWorkflowDescription,
      status: 'draft' as const,
      version: 1,
      nodes: defaultNodes,
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages: defaultStages,
    };

    addWorkflow(newWorkflow);
    setSelectedWorkflow(newWorkflow);
    setIsNewWorkflowModalOpen(false);
    setNewWorkflowName('');
    setNewWorkflowDescription('');
  };

  if (workflows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Workflows Found</h3>
          <p className="text-gray-600 mb-4">Create your first workflow to get started</p>
          <button
            onClick={() => setIsNewWorkflowModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Workflow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Workflows</h2>
          <button
            onClick={() => setIsNewWorkflowModalOpen(true)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="divide-y overflow-y-auto">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedWorkflow?.id === workflow.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedWorkflow(workflow);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{workflow.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWorkflow(workflow.id); }}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {isNewWorkflowModalOpen && (
          <NewWorkflowModal
            isOpen={isNewWorkflowModalOpen}
            onClose={() => setIsNewWorkflowModalOpen(false)}
            onSubmit={handleCreateWorkflow}
            name={newWorkflowName}
            setName={setNewWorkflowName}
            description={newWorkflowDescription}
            setDescription={setNewWorkflowDescription}
          />
        )}
      </div>
      <div className="flex-1">
        {selectedWorkflow ? (
          <div className="h-full">
            <WorkflowModal onClose={() => setSelectedWorkflow(null)} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Select a workflow to edit</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface NewWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const NewWorkflowModal: React.FC<NewWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  name,
  setName,
  description,
  setDescription,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Create New Workflow
          </Dialog.Title>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                placeholder="Enter workflow description"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Workflow
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};