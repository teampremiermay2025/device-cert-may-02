import { FC, useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  ArrowPathIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationTask, CertificationStage, TaskStatus, Activity } from '../types';
import { TaskBoard } from './TaskBoard';
import { getStageColor } from '../lib/workflow';
import { storage } from '../lib/storage';
import taskStepsData from '../data/ruleset.json';
import { TaskDetailModal } from './TaskDetailModal';
import usersData from '../data/users.json';

interface ViewCertificationPanelProps {
  certification: CertificationRequest;
  onUpdate: (certification: CertificationRequest) => void;
  onUpdateNoClose: (certification: CertificationRequest) => void;
  onCancel: () => void;
}

const UserBubble: FC<{ userId: string; size?: 'sm' | 'md' }> = ({ userId, size = 'md' }) => {
  const user = usersData.users.find(u => u.id === userId);
  if (!user) return null;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  };

  return (
    <div className="flex items-center gap-2" title={user.name}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full border border-gray-200`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium`}>
          {getInitials(user.name)}
        </div>
      )}
      <span className="text-sm font-medium text-gray-700">{user.name}</span>
    </div>
  );
};

const ActivityItem: FC<{ activity: Activity }> = ({ activity }) => {
  const user = usersData.users.find(u => u.id === activity.userId);
  console.log('Activity Item:', activity);
  console.log('Activity Item: User:', user);
  if (!user) return null;

  const getActivityMessage = () => {
    switch (activity.type) {
      case 'certification_created':
        return `created certification "${activity.details.projectName}"`;
      case 'certification_updated':
        return 'updated certification details';
      case 'task_created':
        return `created task "${activity.details.taskName}"`;
      case 'task_updated':
        return `updated task "${activity.details.taskName}"`;
      case 'task_status_changed':
        return `changed status of "${activity.details.taskName}" from ${activity.details.oldStatus} to ${activity.details.newStatus}`;
      case 'task_assigned':
        const oldAssignee = activity.details.oldAssignee ? usersData.users.find(u => u.id === activity.details.oldAssignee)?.name : 'unassigned';
        const newAssignee = activity.details.newAssignee ? usersData.users.find(u => u.id === activity.details.newAssignee)?.name : 'unassigned';
        return `reassigned task "${activity.details.taskName}" from ${oldAssignee} to ${newAssignee}`;
      case 'comment_added':
        return `commented on task "${activity.details.taskName}"`;
      case 'attachment_added':
        return `added attachment "${activity.details.attachmentName}" to task "${activity.details.taskName}"`;
      case 'stage_changed':
        return `moved certification from ${activity.details.oldStage} to ${activity.details.newStage}`;
      default:
        return 'performed an action';
    }
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <UserBubble userId={activity.userId} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-medium">{user.name}</span>
          {' '}{getActivityMessage()}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(activity.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

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
    people: false,
    activity: true,
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
      createdAt: new Date().toISOString(),
      createdBy: certification.assignee || 'system'
    }));
  };

  const handleTaskUpdate = (updatedTask: CertificationTask) => {
    const originalTask = certification.tasks.find(t => t.id === updatedTask.id);
    const updatedTasks = certification.tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    let updatedCertification = {
      ...certification,
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString(),
    };

    // Track task status change
    if (originalTask && originalTask.status !== updatedTask.status) {
      storage.addActivity(certification.id, 'task_status_changed', certification.assignee, {
        taskId: updatedTask.id,
        taskName: updatedTask.name,
        oldStatus: originalTask.status,
        newStatus: updatedTask.status
      });
    }

    // Track task assignment change
    if (originalTask && originalTask.assignee !== updatedTask.assignee) {
      storage.addActivity(certification.id, 'task_assigned', certification.assignee, {
        taskId: updatedTask.id,
        taskName: updatedTask.name,
        oldAssignee: originalTask.assignee,
        newAssignee: updatedTask.assignee
      });
    }

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

        // Track stage change
        storage.addActivity(certification.id, 'stage_changed', certification.assignee, {
          oldStage: certification.status,
          newStage: nextStage
        });

        updatedCertification = {
          ...updatedCertification,
          status: nextStage,
          tasks: [
            ...updatedCertification.tasks,
            ...newTasks,
          ],
        };

        // Track new tasks creation
        newTasks.forEach(task => {
          storage.addActivity(certification.id, 'task_created', certification.assignee, {
            taskId: task.id,
            taskName: task.name
          });
        });
      }
    }

    storage.updateCertification(updatedCertification);
    onUpdateNoClose(updatedCertification);
    setSelectedTask(null);
  };

  const handleTaskUpdateNoClose = (updatedTask: CertificationTask) => {
    const originalTask = certification.tasks.find(t => t.id === updatedTask.id);
    const updatedTasks = certification.tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    let updatedCertification = {
      ...certification,
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString(),
    };

    // Track task updates
    if (originalTask) {
      if (originalTask.status !== updatedTask.status) {
        storage.addActivity(certification.id, 'task_status_changed', certification.assignee, {
          taskId: updatedTask.id,
          taskName: updatedTask.name,
          oldStatus: originalTask.status,
          newStatus: updatedTask.status
        });
      }

      if (originalTask.assignee !== updatedTask.assignee) {
        storage.addActivity(certification.id, 'task_assigned', certification.assignee, {
          taskId: updatedTask.id,
          taskName: updatedTask.name,
          oldAssignee: originalTask.assignee,
          newAssignee: updatedTask.assignee
        });
      }
    }

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

        storage.addActivity(certification.id, 'stage_changed', certification.assignee, {
          oldStage: certification.status,
          newStage: nextStage
        });

        updatedCertification = {
          ...updatedCertification,
          status: nextStage,
          tasks: [
            ...updatedCertification.tasks,
            ...newTasks,
          ],
        };

        newTasks.forEach(task => {
          storage.addActivity(certification.id, 'task_created', certification.assignee, {
            taskId: task.id,
            taskName: task.name
          });
        });
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
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add to Favorites">
            <StarIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
            <ShareIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Export">
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                <dl className="grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <UserPlusIcon className="w-5 h-5" /> Vendor:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.vendor || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DevicePhoneMobileIcon className="w-5 h-5" /> Device Type:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.deviceType || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DevicePhoneMobileIcon className="w-5 h-5" /> Model:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.deviceModel || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <PencilIcon className="w-5 h-5" /> Marketing Name:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.deviceMarketingName || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DevicePhoneMobileIcon className="w-5 h-5" /> OS Version:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.deviceOS} {certification.deviceOSVersion}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DevicePhoneMobileIcon className="w-5 h-5" /> Hardware Version:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.deviceHardwareVersion || '-'}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" /> Device Entry:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.forecastedDEDate || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" /> FFW Date:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.forecastedFFWDate || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" /> TA Date:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.forecastedTADate || '-'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" /> Launch Date:
                    </dt>
                    <dd className="text-sm text-gray-900">{certification.forecastedLaunchDate || '-'}</dd>
                  </div>
                </dl>
              </div>
            )}
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
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 cursor-pointer"
              onClick={() => toggleSection('people')}
            >
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">People</h3>
              </div>
              {expandedSections.people ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            {expandedSections.people && (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                  <h4 className="text-sm font-medium text-gray-500">Reporter</h4>
                  {certification.reporter ? (
                    <UserBubble userId={certification.reporter} />
                  ) : (
                    <span className="text-sm text-gray-500">No reporter assigned</span>
                  )}
                  </div>
                  <div>
                  <h4 className="text-sm font-medium text-gray-500">Assignee</h4>
                  {certification.assignee ? (
                    <UserBubble userId={certification.assignee} />
                  ) : (
                    <span className="text-sm text-gray-500">No assignee</span>
                  )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Watchers</h4>
                  {certification.assignee ? (
                    <UserBubble userId={certification.assignee} />
                  ) : (
                    <span className="text-sm text-gray-500">No assignee</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 cursor-pointer"
              onClick={() => toggleSection('activity')}
            >
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
              </div>
              {expandedSections.activity ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            {expandedSections.activity && (
                <div className="p-4">
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {certification.activities && certification.activities.length > 0 ? (
                  [...new Map(certification.activities.map(activity => [activity.id, activity])).values()].map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No activities to display.</p>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
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