import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationTask } from '../types';
import { TaskDetailModal } from './TaskDetailModal';

interface ViewCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: CertificationRequest;
  onUpdate: (certification: CertificationRequest) => void;
}

export const ViewCertificationModal: FC<ViewCertificationModalProps> = ({
  isOpen,
  onClose,
  certification,
  onUpdate,
}) => {
  const [selectedTask, setSelectedTask] = useState<CertificationTask | null>(null);

  const handleTaskUpdate = (updatedTask: CertificationTask) => {
    const updatedTasks = certification.tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    // Check if all tasks in the current stage are completed
    const currentStageTasks = updatedTasks.filter(task => task.stage === certification.status);
    const allTasksCompleted = currentStageTasks.every(task => task.status === 'DONE');

    // Move to next stage if all tasks are completed
    let nextStatus = certification.status;
    if (allTasksCompleted) {
      const stages: CertificationRequest['status'][] = [
        'FORECAST',
        'PLANNING',
        'SUBMITTED',
        'SUBMISSION_REVIEW',
        'DEVICE_ENTRY',
        'DEVICE_TESTING',
        'TAQ_REVIEW',
        'TA_COMPLETE',
        'CLOSED'
      ];
      
      const currentIndex = stages.indexOf(certification.status);
      if (currentIndex < stages.length - 1) {
        nextStatus = stages[currentIndex + 1];
      }
    }

    onUpdate({
      ...certification,
      status: nextStatus,
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'TODO': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'REVIEW': 'bg-yellow-100 text-yellow-800',
      'DONE': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleTaskClick = (e: React.MouseEvent, task: CertificationTask) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTask(task);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-[49]">
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
                        <div 
                          key={task.id} 
                          className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => handleTaskClick(e, task)}
                        >
                          <div className="flex items-center flex-1">
                            <div className="w-6 h-6 flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={task.status === 'DONE'}
                                readOnly
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <span className="ml-3 flex-1">{task.name}</span>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              {task.priority === 'HIGH' && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  High Priority
                                </span>
                              )}
                              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
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
                    <span>Last updated: {new Date(certification.lastUpdated).toLocaleString()}</span>
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

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={(updatedTask) => handleTaskUpdate(updatedTask)}
        />
      )}
    </>
  );
};