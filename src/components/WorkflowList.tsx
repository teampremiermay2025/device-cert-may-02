import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowEditor } from './WorkflowEditor';

export const WorkflowList = () => {
  const { workflows, setSelectedWorkflow, addWorkflow, deleteWorkflow, selectedWorkflow } = useWorkflowStore();
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  const handleCreateWorkflow = () => {
    const newWorkflow = {
      id: crypto.randomUUID(),
      name: newWorkflowName,
      description: newWorkflowDescription,
      status: 'draft',
      version: 1,
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Start' }
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 100, y: 300 },
          data: { label: 'End' }
        }
      ],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
        <NewWorkflowModal
          isOpen={isNewWorkflowModalOpen}
          onClose={() => setIsNewWorkflowModalOpen(false)}
          onSubmit={handleCreateWorkflow}
          name={newWorkflowName}
          setName={setNewWorkflowName}
          description={newWorkflowDescription}
          setDescription={setNewWorkflowDescription}
        />
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
            >
              <div className="flex justify-between items-start">
                <div
                  className="flex-1"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <h3 className="font-medium">{workflow.name}</h3>
                  <p className="text-sm text-gray-500">{workflow.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      v{workflow.version}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <NewWorkflowModal
          isOpen={isNewWorkflowModalOpen}
          onClose={() => setIsNewWorkflowModalOpen(false)}
          onSubmit={handleCreateWorkflow}
          name={newWorkflowName}
          setName={setNewWorkflowName}
          description={newWorkflowDescription}
          setDescription={setNewWorkflowDescription}
        />
      </div>

      <div className="flex-1">
        {selectedWorkflow ? (
          <WorkflowEditor />
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