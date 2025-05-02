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
  onUpdate,
  onUpdateNoClose,
  onCancel,
}) => {
  const [selectedTask, setSelectedTask] = useState<CertificationTask | null>(null);
  const [view, setView] = useState<'list' | 'board'>('board');
  const [workflow, setWorkflow] = useState<any>(null);

  const [expandedSections, setExpandedSections] = useState({
    deviceDetails: true,
    forecastedDates: true,
  });

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

  const handleTaskUpdateNoClose = (updatedTask: CertificationTask) => {
    console.log('Updating task:', updatedTask);
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
    <div className="view-certification-panel bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 w-full mx-auto min-h-[70vh] flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-4 border-b border-gray-200">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              {certification.darpKey}
            </h2>
            <span className={`px-3 py-1 rounded-full text-base font-semibold ${getStageColor(certification.status)}`}>
              {certification.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
             {certification.type}
           </span>
          </div>
          <span className="text-lg text-gray-600">{certification.projectName}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 p-1">
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors" title="Star">
              <StarIcon className="w-5 h-5 text-blue-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors" title="Add User">
              <UserPlusIcon className="w-5 h-5 text-blue-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors" title="Comments">
              <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
              <PencilIcon className="w-5 h-5 text-blue-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors" title="Refresh">
              <ArrowPathIcon className="w-5 h-5 text-blue-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 rounded-md transition-colors" title="More">
              <EllipsisHorizontalIcon className="w-5 h-5 text-blue-500" />
            </button>

          </div>
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 cursor-pointer"
            onClick={() => toggleSection('deviceDetails')}
          >
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Device Details</h3>
            </div>
            {expandedSections.deviceDetails ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>
          {expandedSections.deviceDetails && (
            <div className="p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><UserPlusIcon className="w-5 h-5" /> Vendor</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.vendor || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><DevicePhoneMobileIcon className="w-5 h-5" /> Device Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.deviceType || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><DevicePhoneMobileIcon className="w-5 h-5" /> Model</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.deviceModel || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><PencilIcon className="w-5 h-5" /> Marketing Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.deviceMarketingName || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><DevicePhoneMobileIcon className="w-5 h-5" /> OS Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.deviceOS} {certification.deviceOSVersion}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><DevicePhoneMobileIcon className="w-5 h-5" /> Hardware Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.deviceHardwareVersion || '-'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 cursor-pointer"
            onClick={() => toggleSection('forecastedDates')}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Forecasted Dates</h3>
            </div>
            {expandedSections.forecastedDates ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>
          {expandedSections.forecastedDates && (
            <div className="p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><CalendarIcon className="w-5 h-5" /> Device Entry (DE)</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.forecastedDEDate || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><CalendarIcon className="w-5 h-5" /> FFW Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.forecastedFFWDate || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><CalendarIcon className="w-5 h-5" /> TA Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.forecastedTADate || '-'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-500"><CalendarIcon className="w-5 h-5" /> Launch Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{certification.forecastedLaunchDate || '-'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

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
                  <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                  <p className="text-sm text-gray-700">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {selectedTask && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};