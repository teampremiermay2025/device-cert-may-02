import { FC } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CertificationRequest } from '../types';

interface ViewCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: CertificationRequest;
}

export const ViewCertificationModal: FC<ViewCertificationModalProps> = ({
  isOpen,
  onClose,
  certification,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg max-h-[90vh] overflow-hidden">
          <div className="divide-y h-full flex flex-col">
            <div className="p-6 overflow-y-auto">
              <Dialog.Title className="text-xl font-bold mb-4">
                View Certification Request
              </Dialog.Title>
              
              {certification.issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-900">
                      {certification.issues.length} issues require your attention
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {certification.issues.map((issue, index) => (
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
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Project Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">DARP Key</p>
                      <p className="font-medium">{certification.darpKey}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Project Name</p>
                      <p className="font-medium">{certification.projectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Project Type</p>
                      <p className="font-medium">{certification.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target TA Date</p>
                      <p className="font-medium">{certification.targetDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Software Version</p>
                      <p className="font-medium">{certification.softwareVersion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">{certification.status}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Tasks Progress</h3>
                  <div className="border rounded-lg divide-y">
                    {certification.tasks.map((task) => (
                      <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300"
                              checked={task.isChecked}
                              readOnly
                            />
                          </div>
                          <span className="ml-3">{task.name}</span>
                        </div>
                        <span className={`text-sm ${
                          task.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 mt-auto">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>Last updated: {certification.lastUpdated}</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};