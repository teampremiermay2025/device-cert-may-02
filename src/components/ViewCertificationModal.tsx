import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CalendarIcon,
  TagIcon,
  CodeBracketIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  UserPlusIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationTask } from '../types';
import { TaskBoard } from './TaskBoard';
import { getStageColor } from '../lib/workflow';
import { storage } from '../lib/storage';

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
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleTaskSelect = (task: CertificationTask) => {
    setSelectedTask(task);
    setEditedTask(task);
  };

  const handleTaskUpdate = () => {
    if (!editedTask) return;

    const updatedTasks = certification.tasks.map(task =>
      task.id === editedTask.id ? editedTask : task
    );

    const updatedCertification = {
      ...certification,
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString(),
    };

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
  const estimatedTime = 480; // 8 hours in minutes (example)
  const remainingTime = Math.max(0, estimatedTime - timeSpent);

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="relative z-[49]"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-6xl bg-white rounded-lg h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex justify-between items-start">
              {selectedTask ? (
                <div>
                  <h2 className="text-xl font-bold">{selectedTask.name}</h2>
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

          {/* Content */}
          {selectedTask && editedTask ? (
            <div className="flex-1 overflow-auto">
              <div className="flex">
                {/* Main content */}
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

                  {/* Comments */}
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

                {/* Sidebar */}
                <div className="w-80 p-6">
                  <div className="space-y-6">
                    {/* Status */}
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

                    {/* Priority */}
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

                    {/* Assignee */}
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

                    {/* Due Date */}
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

                    {/* Labels */}
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

              {/* Footer */}
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
                  onClick={handleTaskUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Details Section */}
              <div className="bg-gray-50 border-b flex-shrink-0">
                <div className="max-w-7xl mx-auto p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Left Column - People */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">People</h3>
                      <div className="bg-white rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Assignee</p>
                              <p className="text-sm text-gray-500">Alex Carter</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            Assign
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Reporter</p>
                              <p className="text-sm text-gray-500">Sarah Chen</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <EyeIcon className="w-6 h-6 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Watchers</p>
                              <p className="text-sm text-gray-500">3 watchers</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            Watch
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column - Dates */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Dates</h3>
                      <div className="bg-white rounded-lg border p-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-sm text-gray-500">
                            {new Date(certification.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Updated</p>
                          <p className="text-sm text-gray-500">
                            {new Date(certification.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Target Date</p>
                          <p className="text-sm text-gray-500">
                            {new Date(certification.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Time Tracking */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Time Tracking</h3>
                      <div className="bg-white rounded-lg border p-4">
                        <div 
                          className="cursor-pointer"
                          onClick={() => setShowTimeTracking(!showTimeTracking)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Time Spent</span>
                            <span className="text-sm text-gray-500">
                              {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(timeSpent / estimatedTime) * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium">Remaining</span>
                            <span className="text-sm text-gray-500">
                              {Math.floor(remainingTime / 60)}h {remainingTime % 60}m
                            </span>
                          </div>
                        </div>

                        {showTimeTracking && (
                          <div className="mt-4 pt-4 border-t">
                            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                              Log Time
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 bg-white rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>{completedTasks} of {totalTasks} tasks completed</span>
                      <span>Last updated: {new Date(certification.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
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

              {/* Tasks Section */}
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
                      tasks={certification.tasks}
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
                                    handleTaskUpdate();
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
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};