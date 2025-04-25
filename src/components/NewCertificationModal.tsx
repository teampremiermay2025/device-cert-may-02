import { FC, FormEvent, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationStage, CertificationTask } from '../types';
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

  const { selectedWorkflow } = useWorkflowStore();

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

  const handleConfirm = () => {
    if (!selectedWorkflow) return;

    const forecastStage = selectedWorkflow.stages.find(stage => stage.name === 'FORECAST');
    if (!forecastStage) return;

    const tasks = createTasksForStage(forecastStage);

    const newCertification: CertificationRequest = {
      id: crypto.randomUUID(),
      darpKey: formData.darpKey,
      projectName: formData.projectName,
      type: formData.projectType,
      status: 'FORECAST',
      targetDate: formData.targetDate,
      softwareVersion: formData.softwareVersion,
      lastUpdated: new Date().toISOString(),
      tasks,
      issues: [],
      workflow: selectedWorkflow.id,
      assignee: formData.assignee,
      estimatedCompletionDate: formData.estimatedCompletionDate,
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

  const initialTasks = selectedWorkflow?.stages.find(stage => stage.name === 'FORECAST')?.tasks || [];

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
                      {initialTasks.map((task) => (
                        <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="w-6 h-6 flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={false}
                                disabled
                              />
                            </div>
                            <span className="ml-3">{task.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{task.type}</span>
                            {task.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
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