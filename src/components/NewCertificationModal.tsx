import { FC, FormEvent, useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationStage, CertificationTask, TaskStatus, TaskPriority } from '../types';
import { storage } from '../lib/storage';
import { useWorkflowStore } from '../store/workflowStore';
import { createTasksForStage } from '../lib/workflow';

interface NewCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'processing' | 'review';

export const NewCertificationModal: FC<NewCertificationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [processingStep, setProcessingStep] = useState('');
  const [formData, setFormData] = useState({
    darpKey: '',
    projectName: 'Smoke Test: ST0919A',
    projectType: '',
    targetDate: '',
    softwareVersion: '',
    assignee: '',
    estimatedCompletionDate: '',
    oemDocuments: [] as File[],
  });
  const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { selectedWorkflow: defaultWorkflow, setSelectedWorkflow: setStoreSelectedWorkflow } = useWorkflowStore();

  // Load saved workflows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("jiraWorkflows");
    if (saved) {
      try {
        const workflows = JSON.parse(saved);
        console.log("Saved Workflows:", workflows);
        if (!Array.isArray(workflows)) {
          throw new Error("jiraWorkflows is not an array");
        }
        setSavedWorkflows(workflows);
      } catch (error) {
        console.error("Error parsing jiraWorkflows from localStorage:", error);
        setSavedWorkflows([]);
        setErrorMessage("Error loading workflows. Using default workflow.");
      }
    }
  }, []);

  // Memoize defaultWorkflow to prevent unnecessary re-renders
  const memoizedDefaultWorkflow = useMemo(() => defaultWorkflow, [defaultWorkflow]);

  // Match project type to a workflow when projectType changes
  useEffect(() => {
    if (formData.projectType) {
      try {
        const matchedWorkflow = savedWorkflows.find(
          (w) => w.name && w.name.toLowerCase() === formData.projectType.toLowerCase()
        );
        console.log("Matched Workflow:", matchedWorkflow);

        if (matchedWorkflow) {
          if (!matchedWorkflow.id) throw new Error("Matched workflow missing 'id'");
          if (!matchedWorkflow.name) throw new Error("Matched workflow missing 'name'");
          if (!Array.isArray(matchedWorkflow.nodes)) {
            console.warn("Matched workflow 'nodes' is not an array, defaulting to []");
            matchedWorkflow.nodes = [];
          }
          if (!Array.isArray(matchedWorkflow.edges)) {
            console.warn("Matched workflow 'edges' is not an array, defaulting to []");
            matchedWorkflow.edges = [];
          }
          if (typeof matchedWorkflow.tasks !== 'object' || matchedWorkflow.tasks === null) {
            console.warn("Matched workflow 'tasks' is not an object, defaulting to {}");
            matchedWorkflow.tasks = {};
          }

          const transformedWorkflow = {
            id: matchedWorkflow.id,
            name: matchedWorkflow.name,
            description: matchedWorkflow.description || '',
            status: matchedWorkflow.status || 'active',
            version: matchedWorkflow.version || 1,
            nodes: matchedWorkflow.nodes,
            edges: matchedWorkflow.edges,
            createdAt: matchedWorkflow.createdAt || new Date().toISOString(),
            updatedAt: matchedWorkflow.updatedAt || new Date().toISOString(),
            stages: matchedWorkflow.nodes
              .filter((node: any) => node && node.type === "customNode")
              .map((node: any) => {
                const label = node.data?.label || 'FORECAST';
                const stageTasks = matchedWorkflow.tasks[label];
                return {
                  id: node.id || crypto.randomUUID(),
                  name: label.toUpperCase() as CertificationStage,
                  tasks: Array.isArray(stageTasks)
                    ? stageTasks.map((task: any) => ({
                        id: task?.id || crypto.randomUUID(),
                        title: task?.title || 'Untitled Task',
                        type: task?.type || 'task',
                        description: task?.description || undefined,
                        required: task?.required !== undefined ? task.required : false,
                      }))
                    : [],
                };
              }),
            tasks: matchedWorkflow.tasks,
          };
          console.log("Transformed Workflow:", transformedWorkflow);

          // Only update if the transformed workflow is different from the current selectedWorkflow
          if (JSON.stringify(selectedWorkflow) !== JSON.stringify(transformedWorkflow)) {
            setSelectedWorkflow(transformedWorkflow);
          }

          // Only update the store if the transformed workflow is different from the defaultWorkflow
          if (JSON.stringify(memoizedDefaultWorkflow) !== JSON.stringify(transformedWorkflow)) {
            setStoreSelectedWorkflow(transformedWorkflow);
          }

          setErrorMessage('');
        } else {
          // Only update if different
          if (JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
            setSelectedWorkflow(memoizedDefaultWorkflow);
          }
          if (JSON.stringify(memoizedDefaultWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
            setStoreSelectedWorkflow(memoizedDefaultWorkflow);
          }
          setErrorMessage(`No workflow found for project type "${formData.projectType}". Using default workflow.`);
        }
      } catch (error) {
        console.error("Error matching or transforming workflow:", error);
        if (JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
          setSelectedWorkflow(memoizedDefaultWorkflow);
        }
        if (JSON.stringify(memoizedDefaultWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
          setStoreSelectedWorkflow(memoizedDefaultWorkflow);
        }
        setErrorMessage("Error processing workflow. Using default workflow.");
      }
    } else {
      if (JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
        setSelectedWorkflow(memoizedDefaultWorkflow);
      }
      if (JSON.stringify(memoizedDefaultWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
        setStoreSelectedWorkflow(memoizedDefaultWorkflow);
      }
      setErrorMessage('');
    }
  }, [formData.projectType, savedWorkflows, memoizedDefaultWorkflow, setStoreSelectedWorkflow]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentStep('processing');
    const steps = [
      'Processing the Documentation...',
      'Extracting the Tasks...',
      'Creating Sub Tasks...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProcessingStep(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setCurrentStep('review');
      }
    }, 1000);
  };

  const mapTaskStatus = (jiraStatus: string): TaskStatus => {
    switch (jiraStatus?.toLowerCase() || '') {
      case 'not started':
        return 'TODO';
      case 'in progress':
        return 'IN_PROGRESS';
      case 'completed':
        return 'DONE';
      default:
        return 'TODO';
    }
  };

  const transformTasks = (jiraTasks: any[]): CertificationTask[] => {
    if (!Array.isArray(jiraTasks)) return [];
    return jiraTasks.map((task) => ({
      id: task?.id || crypto.randomUUID(),
      name: task?.title || 'Untitled Task',
      description: task?.description || undefined,
      status: mapTaskStatus(task?.status),
      isChecked: task?.isChecked || false,
      assignee: formData.assignee || undefined,
      priority: task?.priority || 'MEDIUM' as TaskPriority,
      dueDate: formData.targetDate || undefined,
      attachments: task?.attachments || [],
      comments: task?.comments || [],
      timeSpent: task?.timeSpent || undefined,
      labels: task?.labels || [],
      stage: 'FORECAST' as CertificationStage,
    }));
  };

  const handleConfirm = () => {
    if (!selectedWorkflow) return;

    const forecastKey = Object.keys(selectedWorkflow.tasks || {}).find(
      (key) => key.toLowerCase() === 'forecast'
    );
    const forecastStageTasks = forecastKey ? selectedWorkflow.tasks[forecastKey] : [];
    const tasks = forecastStageTasks.length > 0
      ? transformTasks(forecastStageTasks)
      : createTasksForStage(memoizedDefaultWorkflow.stages.find((stage) => stage.name === 'FORECAST')!);

    const now = new Date().toISOString();
    const newCertification: CertificationRequest = {
      id: crypto.randomUUID(),
      darpKey: formData.darpKey,
      projectName: formData.projectName,
      type: formData.projectType,
      status: 'FORECAST',
      targetDate: formData.targetDate,
      softwareVersion: formData.softwareVersion,
      lastUpdated: now,
      tasks,
      issues: [],
      workflow: selectedWorkflow.id,
      assignee: formData.assignee,
      vendor: '',
      deviceType: '',
      deviceModel: '',
      deviceMarketingName: '',
      deviceCodeName: '',
      deviceOS: '',
      deviceOSVersion: '',
      deviceHardwareVersion: '',
      devicePaymentType: '',
      deviceChannel: '',
      securityLevel: '',
      reporter: '',
      primaryPC: '',
      vendorProjectLead: '',
      createdAt: now,
      updatedAt: now,
      forecastedDEDate: '',
      forecastedFFWDate: '',
      forecastedTADate: formData.targetDate,
      forecastedLaunchDate: formData.estimatedCompletionDate,
      components: '',
      affectsVersion: formData.softwareVersion,
      resolution: '',
    };

    const certifications = storage.getCertifications();
    storage.saveCertifications([...certifications, newCertification]);
    
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      oemDocuments: [...prev.oemDocuments, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      oemDocuments: prev.oemDocuments.filter((_, i) => i !== index),
    }));
  };

  const forecastKey = selectedWorkflow?.tasks
    ? Object.keys(selectedWorkflow.tasks).find((key) => key.toLowerCase() === 'forecast')
    : undefined;
  const initialTasks = forecastKey && selectedWorkflow?.tasks[forecastKey]
    ? transformTasks(selectedWorkflow.tasks[forecastKey])
    : memoizedDefaultWorkflow?.stages.find((stage) => stage.name === 'FORECAST')?.tasks.map((task) => ({
        id: task.id,
        name: task.title,
        description: task.description,
        status: 'TODO' as TaskStatus,
        isChecked: false,
        assignee: formData.assignee || undefined,
        priority: 'MEDIUM' as TaskPriority,
        dueDate: formData.targetDate || undefined,
        attachments: [],
        comments: [],
        timeSpent: undefined,
        labels: [],
        stage: 'FORECAST' as CertificationStage,
      })) || [];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg max-h-[90vh] overflow-hidden">
          {currentStep === 'form' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <Dialog.Title className="text-xl font-bold">
                  Start a new certification request
                </Dialog.Title>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {errorMessage && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        DARP Key
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Enter DARP key"
                        value={formData.darpKey}
                        onChange={(e) => setFormData({ ...formData, darpKey: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        Project Name
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Enter project name"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        Project Type
                      </label>
                      <select 
                        className="w-full border rounded p-2"
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        required
                      >
                        <option value="">Select project type</option>
                        <option>DA IR</option>
                        <option>DA MR</option>
                        <option>DA EMR</option>
                        <option>DA SMR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        Target TA Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Software Version
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Ex. 1.0"
                        value={formData.softwareVersion}
                        onChange={(e) => setFormData({ ...formData, softwareVersion: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 bg-gray-100"
                        value="FORECAST"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Assignee
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Enter assignee name"
                        value={formData.assignee}
                        onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Estimated Completion Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.estimatedCompletionDate}
                        onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Upload OEM Documents
                    </label>
                    <div className="border-dashed border-2 border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 text-sm text-gray-600">
                              Drag & drop files here, or click to select files
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFileChange}
                              accept=".xlsx,.doc,.docx,.pdf"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported formats: XLSX, DOC, PDF | Maximum upload size 1000 MB
                        </p>
                      </div>
                    </div>

                    {formData.oemDocuments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Selected Files
                        </h4>
                        <div className="space-y-2">
                          {formData.oemDocuments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{file.name}</span>
                                <span className="ml-2 text-sm text-gray-500">
                                  ({Math.round(file.size / 1024)} KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="p-6">
              <Dialog.Title className="text-xl font-bold mb-4">
                Processing Request
              </Dialog.Title>
              <div className="mt-4">
                <p className="font-semibold mb-2">{processingStep}</p>
                <div className="w-full bg-gray-200 rounded">
                  <div className="bg-blue-600 h-4 rounded doc-progress" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <Dialog.Title className="text-xl font-bold mb-4">
                  Review Certification Request
                </Dialog.Title>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">DARP Key</p>
                        <p className="font-medium">{formData.darpKey || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Name</p>
                        <p className="font-medium">{formData.projectName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Type</p>
                        <p className="font-medium">{formData.projectType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Workflow</p>
                        <p className="font-medium">{selectedWorkflow?.name || 'Default Workflow'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target TA Date</p>
                        <p className="font-medium">{formData.targetDate || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Software Version</p>
                        <p className="font-medium">{formData.softwareVersion || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium">FORECAST</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assignee</p>
                        <p className="font-medium">{formData.assignee || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Completion</p>
                        <p className="font-medium">{formData.estimatedCompletionDate || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">OEM Documents</h3>
                    <div className="border rounded-lg divide-y">
                      {formData.oemDocuments.map((file, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm">{file.name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                        </div>
                      ))}
                      {formData.oemDocuments.length === 0 && (
                        <div className="p-3 text-sm text-gray-500">
                          No documents uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Initial Tasks</h3>
                    <div className="border rounded-lg divide-y">
                      {initialTasks.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          No initial tasks available.
                        </div>
                      ) : (
                        initialTasks.map((task: CertificationTask) => (
                          <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300"
                                  checked={task.isChecked}
                                  disabled
                                />
                              </div>
                              <span className="ml-3">{task.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{task.status}</span>
                              {task.priority === 'HIGH' && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  High Priority
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      These tasks will be created automatically when the certification request is created.
                      Additional tasks will be added as the certification progresses through different stages.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 mt-auto">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>Estimated completion time: 2-3 weeks</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep('form')}
                      className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirm & Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};