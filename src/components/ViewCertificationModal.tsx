import { FC, useState, useCallback, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  UserPlusIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationTask, CertificationStage, TaskStatus, TaskPriority } from '../types';
import { TaskBoard } from './TaskBoard';
import { getStageColor } from '../lib/workflow';
import { storage } from '../lib/storage';
import taskStepsData from '../data/ruleset.json';

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
  const [editedTask, setEditedTask] = useState<CertificationTask | null>(null);
  const [view, setView] = useState<'list' | 'board'>('board');
  const [newComment, setNewComment] = useState('');
  const [workflow, setWorkflow] = useState<any>(null);
  
  // New state for expandable sections
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
    setEditedTask(task);
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
      status: 'TODO' as TaskStatus,
      isChecked: false,
      assignee: certification.assignee || undefined,
      priority: 'MEDIUM' as TaskPriority,
      dueDate: certification.targetDate || undefined,
      attachments: [],
      comments: [],
      timeSpent: undefined,
      labels: [],
      stage: stage.toUpperCase() as CertificationStage,
    }));
  };

  const handleTaskUpdate = (updatedTask?: CertificationTask) => {
    const taskToUpdate = updatedTask || editedTask;
    if (!taskToUpdate) return;

    const updatedTasks = certification.tasks.map(task =>
      task.id === taskToUpdate.id ? taskToUpdate : task
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
    setSelectedTask(null);
    setEditedTask(null);
  };

  const handleAddComment = () => {
    if (!editedTask || !newComment.trim()) return;

    const newCommentObj = {
      id: crypto.randomUUID(),
      content: newComment,
      createdAt: new Date().toISOString(),
      createdBy: 'Alex Carter',
    };

    setEditedTask({
      ...editedTask,
      comments: [...editedTask.comments, newCommentObj],
    });
    setNewComment('');
  };

  const completedTasks = certification.tasks.filter(task => task.status === 'DONE').length;
  const totalTasks = certification.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const timeSpent = certification.tasks.reduce((total, task) => total + (task.timeSpent || 0), 0);
  const estimatedTime = 480;
  const remainingTime = Math.max(0, estimatedTime - timeSpent);

  const currentStageTasks = certification.tasks.filter(
    task => task.stage === certification.status
  );

  // Add state for AI test case generation UI
  const [showAITestCaseSection, setShowAITestCaseSection] = useState(false);
  const [aiStep, setAIStep] = useState<'idle' | 'processing' | 'understanding' | 'typing' | 'done'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiTestCases, setAITestCases] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for AI Test Case button
  const handleAITestCaseClick = () => {
    setShowAITestCaseSection(true);
    setAIStep('idle');
    setUploadedFile(null);
    setAITestCases([]);
  };

  // Handler for file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      startAIProcessing();
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      startAIProcessing();
    }
  };

  // Simulate AI processing steps
  const startAIProcessing = () => {
    setAIStep('processing');
    setTimeout(() => {
      setAIStep('understanding');
      setTimeout(() => {
        setAIStep('typing');
        // Simulate typing/scrolling animation, then show test cases
        setTimeout(() => {
          setAIStep('done');
          setAITestCases([
            'Test Case 1: Validate login with valid credentials',
            'Test Case 2: Validate login with invalid credentials',
            'Test Case 3: Check password reset flow',
            'Test Case 4: Ensure session timeout after inactivity',
          ]);
        }, 2500);
      }, 2000);
    }, 2000);
  };

  // Drag & drop helpers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
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
              {selectedTask ? (
                <div>
                  <h2 className="text-xl font-bold">{selectedTask.name}
                    
                  </h2>
                  <p className="text-sm text-gray-500">Task ID: {selectedTask.id}</p>
                </div>
              ) : (
                <div>
                  <Dialog.Title className="text-xl font-bold flex items-center gap-3">
                    {certification.darpKey}
                    <span className={`px-2 py-1 rounded-full text-sm ${getStageColor(certification.status)}`}>
                      {certification.status}
                    </span>
                  </Dialog.Title>
                  <p className="text-gray-600 mt-1">{certification.projectName}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {!selectedTask && (
                  <>
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
                  </>
                )}
                <button
                  onClick={selectedTask ? () => setSelectedTask(null) : onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {!selectedTask && (
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
                              {issue.type === 'warning' && (
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                              )}
                              {issue.type === 'error' && (
                                <XCircleIcon className="w-4 h-4 text-red-600" />
                              )}
                              {issue.type === 'info' && (
                                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
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
                                    setEditedTask(updatedTask);
                                    handleTaskUpdate(updatedTask);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                  <h4 className="font-medium">{task.name}
                                    {task.name === '2005.2 (PTN-20006 Monitoring Results)' && (
                                      <button
                                        onClick={handleAITestCaseClick}
                                        className="ml-2 p-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                                        title="Generate AI Test Case"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="inline-block align-middle">Generate Test Cases</span>
                                      </button>
                                    )}
                                  </h4>
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
          )}

          {selectedTask && editedTask && (
            <div className="flex-1 overflow-auto">
              <div className="flex">
                <div className="flex-1 p-6 border-r">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <textarea
                      value={editedTask.description || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="w-full border rounded-lg p-3 min-h-[100px]"
                      placeholder="Add a description..."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Comments</h3>
                    <div className="mb-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        placeholder="Add a comment..."
                        rows={3}
                      />
                      <button
                        onClick={handleAddComment}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Comment
                      </button>

                      {selectedTask.name === '2005.2 (PTN-20006 Monitoring Results)' && (
                      <button
                        onClick={handleAITestCaseClick}
                        className="ml-2 mt-4 p-1 bg-pink-500 text-white rounded hover:bg-blue-600 flex items-center"
                        title="Generate AI Test Case"
                        disabled={showAITestCaseSection}
                      >
                        <SparklesIcon className="w-5 h-5 mr-2 text-white" />
                        <span className="inline-block align-middle">Generate Test Cases</span>
                      </button>
                    )}
                    </div>
                    <div className="space-y-4">
                      {editedTask.comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-center mb-2">
                            <UserCircleIcon className="w-6 h-6 text-gray-400 mr-2" />
                            <span className="font-medium">{comment.createdBy}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-80 p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Status
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setEditedTask({ ...editedTask, status })}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              editedTask.status === status
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Priority
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => (
                          <button
                            key={priority}
                            onClick={() => setEditedTask({ ...editedTask, priority })}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              editedTask.priority === priority
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Assignee
                      </h3>
                      <input
                        type="text"
                        value={editedTask.assignee || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Assign to..."
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Due Date
                      </h3>
                      <input
                        type="date"
                        value={editedTask.dueDate || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Labels
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {editedTask.labels.map((label) => (
                          <span
                            key={label}
                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t bg-gray-50 p-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setEditedTask(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTaskUpdate()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
          {selectedTask && showAITestCaseSection && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {aiStep === 'idle' && (
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={handleBrowseClick}
                  style={{ minHeight: 120 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="text-blue-500 font-semibold text-lg">Drag & Drop requirement file here</div>
                  <div className="text-gray-500 mt-2">or <span className="underline cursor-pointer text-blue-700">Browse</span></div>
                </div>
              )}
              {uploadedFile && aiStep !== 'done' && (
                <div className="flex flex-col items-center py-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-blue-600">{uploadedFile.name}</span>
                  </div>
                  {aiStep === 'processing' && (
                    <div className="flex flex-col items-center">
                      <div className="loader mb-2"></div>
                      <span className="text-blue-700 font-medium animate-pulse">Processing...</span>
                    </div>
                  )}
                  {aiStep === 'understanding' && (
                    <div className="flex flex-col items-center">
                      <div className="loader mb-2"></div>
                      <span className="text-blue-700 font-medium animate-pulse">Understanding Requirement...</span>
                    </div>
                  )}
                  {aiStep === 'typing' && (
                    <div className="flex flex-col items-center">
                      <div className="loader mb-2"></div>
                      <span className="text-blue-700 font-medium animate-pulse">Creating Test Cases...</span>
                      <div className="mt-4 w-full max-w-md bg-white border border-gray-200 rounded-lg p-4 h-24 overflow-y-auto animate-pulse">
                        <span className="typing">Generating test cases...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {aiStep === 'done' && (
                <div className="mt-4">
                  <div className="text-green-700 font-semibold mb-2">Test Cases Generated:</div>
                  <ul className="list-disc pl-6 space-y-1">
                    {aiTestCases.map((tc, idx) => (
                      <li key={idx} className="animate-fade-in-up">{tc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

/* Add simple loader, typing, and fade-in animations */
<style jsx>{`
.loader {
  border: 4px solid #e0e7ef;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.typing {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #3b82f6;
  animation: typing 2s steps(24, end), blink-caret 0.75s step-end infinite;
}
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: #3b82f6; }
}
.animate-fade-in-up {
  animation: fadeInUp 0.7s ease;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
`}</style>