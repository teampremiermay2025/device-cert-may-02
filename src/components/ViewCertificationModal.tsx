import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationTask } from '../types';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskBoard } from './TaskBoard';
import { getStageColor } from '../lib/workflow';

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
  const [view, setView] = useState<'list' | 'board'>('board');

  const handleTaskUpdate = (updatedTask: CertificationTask) => {
    const updatedTasks = certification.tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    onUpdate({
      ...certification,
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={onClose} 
        className="relative z-[49]"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-6xl bg-white rounded-lg h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <Dialog.Title className="text-xl font-bold flex items-center gap-3">
                    {certification.darpKey}
                    <span className={`px-2 py-1 rounded-full text-sm ${getStageColor(certification.status)}`}>
                      {certification.status}
                    </span>
                  </Dialog.Title>
                  <p className="text-gray-600 mt-1">{certification.projectName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setView('list')}
                      className={`px-3 py-1 rounded ${
                        view === 'list' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setView('board')}
                      className={`px-3 py-1 rounded ${
                        view === 'board' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Board
                    </button>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {certification.issues.length > 0 && (
                <div className="p-4 border-b">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                </div>
              )}

              <div className="h-full overflow-auto">
                {view === 'board' ? (
                  <TaskBoard
                    tasks={certification.tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskClick={setSelectedTask}
                  />
                ) : (
                  <div className="p-4">
                    <div className="bg-white rounded-lg border">
                      {certification.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={task.status === 'DONE'}
                                className="rounded border-gray-300"
                                onChange={(e) => {
                                  handleTaskUpdate({
                                    ...task,
                                    status: e.target.checked ? 'DONE' : 'TODO'
                                  });
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div>
                                <h4 className="font-medium">{task.name}</h4>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(task.stage)}`}>
                                {task.stage}
                              </span>
                              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t flex-shrink-0">
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
          </Dialog.Panel>
        </div>
      </Dialog>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
};