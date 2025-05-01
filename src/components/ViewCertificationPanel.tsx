import { FC, useState, useEffect } from 'react';
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
import { CertificationRequest, CertificationTask, CertificationStage, TaskStatus } from '../types';
import { TaskBoard } from './TaskBoard';
import { getStageColor } from '../lib/workflow';
import { storage } from '../lib/storage';
import taskStepsData from '../data/ruleset.json';
import { TaskDetailModal } from './TaskDetailModal';

interface ViewCertificationPanelProps {
  certification: CertificationRequest;
  onUpdate: (certification: CertificationRequest) => void;
  onUpdateNoClose: (certification: CertificationRequest) => void;
  onCancel: () => void;
}

export const ViewCertificationPanel: FC<ViewCertificationPanelProps> = ({
  certification,
  onUpdate,onUpdateNoClose,
  onCancel,
}) => {
  const [selectedTask, setSelectedTask] = useState<CertificationTask | null>(null);
  const [view, setView] = useState<'list' | 'board'>('board');
  const [workflow, setWorkflow] = useState<any>(null);

  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    deviceDetails: false,
    forecastedDates: false,
  });

  // Load the workflow associated with the certification
  useEffect(() => {
    const saved = localStorage.getItem('jiraWorkflows');
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
              .filter((node: any) => node && node.type === 'customNode')
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
        console.error('Error loading workflow:', error);
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
      name: `(${task.deliverable})`,
      description: `${task.requirement_tag}`,
      status: 'TODO' as TaskStatus,
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

  // Existing handler (keep as-is for TaskDetail modal)
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
    onUpdateNoClose(updatedCertification);
    setSelectedTask(null);
  };

  // New handler for TaskBoard (does NOT close the panel)
  const handleTaskUpdateNoClose = (updatedTask: CertificationTask) => {
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
    onUpdateNoClose(updatedCertification);
  };

  const currentStageTasks = certification.tasks.filter(
    task => task.stage === certification.status
  );

  return (
    <div className="view-certification-panel bg-white rounded-2xl shadow-xl p-10 w-full mx-auto min-h-[70vh] flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2 border-b pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            {certification.darpKey}
            <span className={`px-3 py-1 rounded-full text-base font-semibold ${getStageColor(certification.status)}`}>{certification.status}</span>
          </h2>
          <span className="text-lg text-gray-600">{certification.projectName}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="p-2 hover:bg-blue-50 rounded-lg" title="Star">
            <StarIcon className="w-6 h-6 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-blue-50 rounded-lg" title="Add User">
            <UserPlusIcon className="w-6 h-6 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-blue-50 rounded-lg" title="Comments">
            <ChatBubbleLeftIcon className="w-6 h-6 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-blue-50 rounded-lg" title="Edit">
            <PencilIcon className="w-6 h-6 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-blue-50 rounded-lg" title="Refresh">
            <ArrowPathIcon className="w-6 h-6 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-blue-50 rounded-lg" title="More">
            <EllipsisHorizontalIcon className="w-6 h-6 text-blue-400" />
          </button>
          <button
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 ml-4"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Basic Details Section (already improved) */}
      <div className="bg-gradient-to-tr from-blue-50 to-white rounded-xl border border-blue-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-blue-900 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">DARP Key</span>
            <span className="text-base font-medium text-gray-900 mt-1 break-all">{certification.darpKey}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Name</span>
            <span className="text-base font-medium text-gray-900 mt-1">{certification.projectName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shadow-sm">{certification.type}</span>
          </div>
        </div>
      </div>

      {/* Device Details Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <button
          className="w-full p-5 flex justify-between items-center hover:bg-blue-50 rounded-t-xl transition"
          onClick={() => toggleSection('deviceDetails')}
        >
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="w-6 h-6 mr-2 text-blue-400" />
            <h3 className="text-lg font-semibold">Device Details</h3>
          </div>
          {expandedSections.deviceDetails ? (
            <ChevronUpIcon className="w-6 h-6 text-blue-400" />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-blue-400" />
          )}
        </button>
        {expandedSections.deviceDetails && (
          <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Vendor</p>
                <p className="text-base text-gray-800">{certification.vendor}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Device Type</p>
                <p className="text-base text-gray-800">{certification.deviceType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Model</p>
                <p className="text-base text-gray-800">{certification.deviceModel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Marketing Name</p>
                <p className="text-base text-gray-800">{certification.deviceMarketingName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Code Name</p>
                <p className="text-base text-gray-800">{certification.deviceCodeName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">OS</p>
                <p className="text-base text-gray-800">{certification.deviceOS} {certification.deviceOSVersion}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Hardware Version</p>
                <p className="text-base text-gray-800">{certification.deviceHardwareVersion}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Type</p>
                <p className="text-base text-gray-800">{certification.devicePaymentType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Channel</p>
                <p className="text-base text-gray-800">{certification.deviceChannel}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forecasted Dates Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <button
          className="w-full p-5 flex justify-between items-center hover:bg-blue-50 rounded-t-xl transition"
          onClick={() => toggleSection('forecastedDates')}
        >
          <div className="flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-blue-400" />
            <h3 className="text-lg font-semibold">Forecasted Dates</h3>
          </div>
          {expandedSections.forecastedDates ? (
            <ChevronUpIcon className="w-6 h-6 text-blue-400" />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-blue-400" />
          )}
        </button>
        {expandedSections.forecastedDates && (
          <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Device Entry (DE) Date</p>
                <p className="text-base text-gray-800">{certification.forecastedDEDate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">FFW Date</p>
                <p className="text-base text-gray-800">{certification.forecastedFFWDate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">TA Date</p>
                <p className="text-base text-gray-800">{certification.forecastedTADate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Launch Date</p>
                <p className="text-base text-gray-800">{certification.forecastedLaunchDate || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issues Section */}
      {certification.issues && certification.issues.length > 0 && (
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 text-yellow-700 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            Issues
          </h3>
          <div className="space-y-2">
            {certification.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">{issue.title}</p>
                  <p className="text-sm text-yellow-700">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task View Switcher & List/Board */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'board' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
            >
              Board
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          {view === 'board' ? (
            <TaskBoard
              tasks={currentStageTasks}
              onTaskUpdate={handleTaskUpdateNoClose}
              onTaskClick={handleTaskSelect}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {certification.tasks.map((task) => (
                <div
                  key={task.id}
                  className="py-4 flex items-center justify-between hover:bg-blue-50 px-2 cursor-pointer transition"
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'DONE'}
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        const updatedTask = {
                          ...task,
                          status: e.target.checked ? 'DONE' as TaskStatus : 'TODO' as TaskStatus
                        };
                        handleTaskUpdate(updatedTask);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h4 className="font-semibold text-base text-gray-900">{task.name}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStageColor(task.stage)}`}>
                      {task.stage}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal (inline) */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => {
            onCancel();
          }}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};
