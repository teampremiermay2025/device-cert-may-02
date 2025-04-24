import { FC, FormEvent, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationStage, CertificationTask, TaskStatus } from '../types';
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

    // Get tasks for the initial stage (FORECAST)
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
    };

    const certifications = storage.getCertifications();
    storage.saveCertifications([...certifications, newCertification]);
    
    onClose();
  };

  // Get initial tasks that will be created
  const initialTasks = selectedWorkflow?.stages.find(stage => stage.name === 'FORECAST')?.tasks || [];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg">
          {currentStep === 'form' && (
            <div className="p-6">
              <Dialog.Title className="text-xl font-bold mb-4">
                Start a new certification request
              </Dialog.Title>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
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
                <div className="mb-4">
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
                <div className="flex mb-4">
                  <div className="w-1/2 mr-2">
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
                  <div className="w-1/2 ml-2">
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
                </div>
                <div className="flex mb-4">
                  <div className="w-1/2 mr-2">
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
                  <div className="w-1/2 ml-2">
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
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Upload OEM Documents
                  </label>
                  <div className="border-dashed border-2 border-gray-300 p-4 text-center">
                    <p>Drag & Drop or choose files to upload</p>
                    <input type="file" id="oemDocs" multiple className="hidden" />
                    <button
                      type="button"
                      onClick={() => document.getElementById('oemDocs')?.click()}
                      className="text-blue-600"
                    >
                      Choose Files
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Supported formats: XLSX, DOC, PDF | Maximum upload size 1000 MB
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Continue
                  </button>
                </div>
              </form>
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
            <div className="divide-y">
              <div className="p-6">
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

              <div className="p-6 bg-gray-50">
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