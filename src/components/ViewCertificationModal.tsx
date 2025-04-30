import { FC, useState, useCallback, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationTask, CertificationStage } from '../types';
import { TaskBoard } from './TaskBoard';
import { getStageColor } from '../lib/workflow';
import { storage } from '../lib/storage';
import taskStepsData from '../data/ruleset.json';
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
  const [view, setView] = useState<'list' | 'board'>('board');
  const [workflow, setWorkflow] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    deviceDetails: false,
    forecastedDates: false,
  });

  // Load the workflow associated with the certification
  useEffect(() => {
    const saved = localStorage.getItem("jiraWorkflows");
    if (saved) {
      try {
        const workflows = JSON.parse(saved);
        const matchedWorkflow = workflows.find((w: any) => w.id === certification.workflow);
        if (matchedWorkflow) {
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
              .map((node: any) => ({
                id: node.id || crypto.randomUUID(),
                name: node.data?.label.toUpperCase() || 'FORECAST',
                tasks: [],
              })),
            tasks: matchedWorkflow.tasks,
          };
          setWorkflow(transformedWorkflow);
        }
      } catch (error) {
        console.error("Error loading workflow:", error);
      }
    }
  }, [certification.workflow]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTaskSelect = (task: CertificationTask) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  // Function to filter tasks from ruleset.json based on projectType, deviceChannel, and stage
  const filterTasksFromRuleset = (stage: string, projectType: string, deviceChannel: string): CertificationTask[] => {
    const filteredTasks = taskStepsData.filter((task) => {
      const matchesIssueType = task.issue_types.includes(projectType);
      const matchesDeviceChannel = task.device_channels.includes(deviceChannel);
      const matchesStage = task.stage.toUpperCase() === stage.toUpperCase();
      return matchesIssueType && matchesDeviceChannel && matchesStage;
    });

    return filteredTasks.map((task) => ({
      id: crypto.randomUUID(),
      name: `${task.chapter} (${task.requirement_tag})`,
      description: `Deliverable: ${task.deliverable}`,
      status: 'TODO',
      isChecked: false,
      assignee: certification.assignee || undefined,
      priority: 'MEDIUM',
      dueDate: certification.targetDate || undefined,
      attachments: [],
      comments: [],
      timeSpent: undefined,
      labels: [],
      stage: stage.toUpperCase() as CertificationStage,
    }));
  };

  const handleTaskUpdate = (updatedTask: CertificationTask) => {
    const updatedTasks = certification.tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    let updatedCertification = {
      ...certification,
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString(),
    };

    const currentStageTasks = updatedCertification.tasks.filter(
      task => task.stage === certification.status
    );
    const allTasksDone = currentStageTasks.every(task => task.status === 'DONE');

    if (allTasksDone && workflow) {
      const stageOrder = workflow.stages.map((stage: any) => stage.name);
      const currentStageIndex = stageOrder.indexOf(certification.status);
      const nextStageIndex = currentStageIndex + 1;

      if (nextStageIndex < stageOrder.length) {
        const nextStage = stageOrder[nextStageIndex] as CertificationStage;
        const newTasks = filterTasksFromRuleset(nextStage, certification.type, certification.deviceChannel);

        updatedCertification = {
          ...updatedCertification,
          status: nextStage,
          tasks: [
            ...updatedCertification.tasks,
            ...newTasks,
          ],
        };
      }
    }

    storage.updateCertification(updatedCertification);
    onUpdate(updatedCertification);
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  const currentStageTasks = certification.tasks.filter(
    task => task.stage === certification.status
  );

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
            <div className="p-4 border-b flex-shrink-0">
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
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <StarIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <UserPlusIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <PencilIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowPathIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="bg-gray-50 border-b flex-shrink-0">
                <div className="max-w-7xl mx-auto p-4">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">DARP Key</p>
                          <p className="mt-1">{certification.darpKey}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Project Name</p>
                          <p className="mt-1">{certification.projectName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p className="mt-1">{certification.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border">
                      <button
                        className="w-full p-4 flex justify-between items-center"
                        onClick={() => toggleSection('deviceDetails')}
                      >
                        <div className="flex items-center">
                          <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-gray-500" />
                          <h3 className="text-lg font-semibold">Device Details</h3>
                        </div>
                        {expandedSections.deviceDetails ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.deviceDetails && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Vendor</p>
                              <p className="mt-1">{certification.vendor}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Device Type</p>
                              <p className="mt-1">{certification.deviceType}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Model</p>
                              <p className="mt-1">{certification.deviceModel}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Marketing Name</p>
                              <p className="mt-1">{certification.deviceMarketingName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Code Name</p>
                              <p className="mt-1">{certification.deviceCodeName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">OS</p>
                              <p className="mt-1">{certification.deviceOS} {certification.deviceOSVersion}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Hardware Version</p>
                              <p className="mt-1">{certification.deviceHardwareVersion}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Payment Type</p>
                              <p className="mt-1">{certification.devicePaymentType}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Channel</p>
                              <p className="mt-1">{certification.deviceChannel}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-lg border">
                      <button
                        className="w-full p-4 flex justify-between items-center"
                        onClick={() => toggleSection('forecastedDates')}
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                          <h3 className="text-lg font-semibold">Forecasted Dates</h3>
                        </div>
                        {expandedSections.forecastedDates ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.forecastedDates && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Device Entry (DE) Date</p>
                              <p className="mt-1">{certification.forecastedDEDate || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">FFW Date</p>
                              <p className="mt-1">{certification.forecastedFFWDate || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">TA Date</p>
                              <p className="mt-1">{certification.forecastedTADate || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Launch Date</p>
                              <p className="mt-1">{certification.forecastedLaunchDate || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {certification.issues.length > 0 && (
                <div className="border-b flex-shrink-0">
                  <div className="max-w-7xl mx-auto p-4">
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
                              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
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
                </div>
              )}

              <div className="flex-1 min-h-0 flex flex-col">
                <div className="p-4 border-b bg-white flex-shrink-0">
                  <div className="flex justify-between items-center">
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
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {view === 'board' ? (
                    <TaskBoard
                      tasks={currentStageTasks}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskClick={handleTaskSelect}
                    />
                  ) : (
                    <div className="max-w-7xl mx-auto p-4">
                      <div className="bg-white rounded-lg border">
                        {certification.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleTaskSelect(task)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'DONE'}
                                  className="rounded border-gray-300"
                                  onChange={(e) => {
                                    const updatedTask = {
                                      ...task,
                                      status: e.target.checked ? 'DONE' : 'TODO'
                                    };
                                    handleTaskUpdate(updatedTask);
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
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskDetailOpen}
          onClose={() => {
            setIsTaskDetailOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
};