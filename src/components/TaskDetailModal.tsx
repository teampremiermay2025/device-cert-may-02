import { FC, useState, MouseEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  PaperClipIcon, 
  ChatBubbleLeftIcon, 
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CertificationTask, TaskPriority, TaskStatus } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CertificationTask;
  onUpdate: (task: CertificationTask) => void;
}

export const TaskDetailModal: FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
}) => {
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleStatusChange = (status: TaskStatus) => {
    setEditedTask({ ...editedTask, status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    setEditedTask({ ...editedTask, priority });
  };

  const handleSave = () => {
    onUpdate(editedTask);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: crypto.randomUUID(),
      content: newComment,
      createdAt: new Date().toISOString(),
      createdBy: 'Alex Carter',
    };

    setEditedTask({
      ...editedTask,
      comments: [...editedTask.comments, comment],
    });
    setNewComment('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const attachment = {
      id: crypto.randomUUID(),
      name: selectedFile.name,
      url: URL.createObjectURL(selectedFile),
      size: selectedFile.size,
      type: selectedFile.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Alex Carter',
    };

    setEditedTask({
      ...editedTask,
      attachments: [...editedTask.attachments, attachment],
    });
    setSelectedFile(null);
  };

  return (
<Dialog open={isOpen} onClose={onClose} className="relative z-50">
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <Dialog.Overlay className="fixed inset-0 bg-black/30" />
    
    <Dialog.Panel className="relative z-50 w-full max-w-4xl bg-white rounded-lg shadow-xl">
          <div className="flex flex-col h-[80vh]">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <Dialog.Title className="text-xl font-bold">
                    {editedTask.name}
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 mt-1">
                    Task ID: {editedTask.id}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
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

                  {/* Attachments */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Attachments</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="px-3 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                        >
                          Choose File
                        </label>
                        {selectedFile && (
                          <button
                            onClick={handleUpload}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {editedTask.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center p-2 bg-gray-50 rounded"
                        >
                          <PaperClipIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="flex-1">{attachment.name}</span>
                          <span className="text-sm text-gray-500">
                            {Math.round(attachment.size / 1024)} KB
                          </span>
                        </div>
                      ))}
                    </div>
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
                        {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as TaskStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
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
                        {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((priority) => (
                          <button
                            key={priority}
                            onClick={() => handlePriorityChange(priority)}
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
                      <button 
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg w-full hover:bg-gray-200"
                      >
                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                        <span>{editedTask.assignee || 'Unassigned'}</span>
                      </button>
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
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                    <span>{editedTask.comments.length} comments</span>
                  </div>
                  <div className="flex items-center">
                    <PaperClipIcon className="w-4 h-4 mr-1" />
                    <span>{editedTask.attachments.length} attachments</span>
                  </div>
                  {editedTask.timeSpent && (
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{Math.round(editedTask.timeSpent / 60)}h spent</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};