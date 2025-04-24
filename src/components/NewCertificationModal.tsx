import { FC, FormEvent, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
    }, 3000);
  };

  const handleConfirm = () => {
    onClose();
  };

  const issues = [
    {
      title: 'Missing Document - Certification Specs',
      description: 'Required certification specifications document is not uploaded',
      type: 'warning'
    },
    {
      title: 'Incomplete Field - Target TA Date',
      description: 'Target TA date needs to be set for proper scheduling',
      type: 'error'
    },
    {
      title: 'Version Mismatch - Expected v1.3.0',
      description: 'Current software version differs from expected version',
      type: 'info'
    }
  ];

  const tasks = [
    { id: 1, name: 'Compliance Reqs: Chapter Reviews', status: 'pending' },
    { id: 2, name: 'Deliverable Reqs: Chapter Reviews', status: 'pending' },
    { id: 3, name: 'Deliverable Reqs: PreAuth', status: 'pending' },
    { id: 4, name: 'Deliverable Reqs: Samples-Marketing & Certification', status: 'pending' },
    { id: 5, name: 'Deliverable Reqs: PTCRB', status: 'pending' },
    { id: 6, name: 'Deliverable Reqs: Certs-Release Notes', status: 'pending' },
    { id: 7, name: 'Deliverable Reqs: FOTA-16038', status: 'pending' },
    { id: 8, name: 'Deliverable Reqs: Testing Confirmation-AQT', status: 'pending' },
    { id: 9, name: 'Deliverable Reqs: Provisioning-ACS', status: 'pending' },
    { id: 10, name: 'Deliverable Reqs: Provisioning-IMEI', status: 'pending' },
    { id: 11, name: 'Deliverable Reqs: DE-Device Firmware', status: 'pending' },
    { id: 12, name: 'TA Approvals Reqs: FFI', status: 'pending' },
    { id: 13, name: 'Deliverable Reqs: IMEI Central (Cricket)', status: 'pending' },
    { id: 14, name: 'Deliverable Reqs: IMEI Master (AT&T)', status: 'pending' },
    { id: 15, name: 'Deliverable Reqs: IMEI ASIM (COLD)', status: 'pending' }
  ];

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
                      type="text"
                      className="w-full border rounded p-2"
                      placeholder="Enter date yyyy-mm-dd"
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
                      value="New"
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
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-900">
                      {issues.length} issues require your attention
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {issues.map((issue, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {issue.type === 'warning' && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                          )}
                          {issue.type === 'error' && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                          )}
                          {issue.type === 'info' && (
                            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium">{issue.title}</p>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                        <p className="font-medium">New</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Generated Tasks</h3>
                    <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                      {tasks.map((task) => (
                        <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="w-6 h-6 flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                defaultChecked
                              />
                            </div>
                            <span className="ml-3">{task.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{task.status}</span>
                        </div>
                      ))}
                    </div>
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