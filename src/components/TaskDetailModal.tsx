import { FC, useState, useRef, useEffect, MouseEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  PaperClipIcon, 
  ChatBubbleLeftIcon, 
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { CertificationTask, TaskPriority, TaskStatus } from '../types';
import { storage } from '../lib/storage';
import testCasesData from '../data/testcases.json';
import usersData from '../data/users.json';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CertificationTask;
  onUpdate: (task: CertificationTask) => void;
}

interface TestCase {
  test_case_id: string;
  test_case_description: string;
  acceptance_criteria: string[];
  assigned_to: string;
  status: string;
}

const getTestCaseStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'TODO': 'bg-gray-100 text-gray-800',
    'IN PROGRESS': 'bg-blue-100 text-blue-800',
    'DONE': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const TaskDetailModal: FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
}) => {
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const [showAITestCaseSection, setShowAITestCaseSection] = useState(false);
  const initialAIStep = localStorage.getItem(`aiStep-${task.id}`) as 'idle' | 'extracting' | 'thinking' | 'understanding' | 'generating' | 'done' | null;
  const [aiStep, setAIStep] = useState<'idle' | 'extracting' | 'thinking' | 'understanding' | 'generating' | 'done'>(initialAIStep || 'idle');
  const [aiTestCases, setAITestCases] = useState<TestCase[]>([]);
  const [expandedTestCases, setExpandedTestCases] = useState<{ [key: string]: boolean }>({});
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);
  const [editedTestCase, setEditedTestCase] = useState<Partial<TestCase>>({});

  useEffect(() => {
    if (isOpen) {
      const savedTestCases = storage.getTestCasesForTask(task.id);
      setAITestCases(savedTestCases);
      setShowAITestCaseSection(savedTestCases.length > 0);
    }
  }, [isOpen, task.id]);

  const handleStatusChange = (status: TaskStatus) => {
    setEditedTask({ ...editedTask, status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    setEditedTask({ ...editedTask, priority });
  };

  const handleSave = () => {
    const updatedTask = {
      ...editedTask,
      description: editedDescription,
    };
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: crypto.randomUUID(),
      content: newComment,
      createdAt: new Date().toISOString(),
      createdBy: 'Alex Carter',
    };

    const updatedTask = {
      ...editedTask,
      comments: [...editedTask.comments, comment],
    };

    setEditedTask(updatedTask);
    setNewComment('');

    storage.addActivity(task.id, 'comment_added', 'Alex Carter', {
      taskId: task.id,
      taskName: task.name,
      comment: newComment
    });
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

    const updatedTask = {
      ...editedTask,
      attachments: [...editedTask.attachments, attachment],
    };

    setEditedTask(updatedTask);
    setSelectedFile(null);

    storage.addActivity(task.id, 'attachment_added', 'Alex Carter', {
      taskId: task.id,
      taskName: task.name,
      attachmentName: selectedFile.name
    });
  };

  const handleAITestCaseClick = () => {
    setShowAITestCaseSection(true);
    setAIStep('extracting');
    startAIProcessing();
  };

  const toggleTestCase = (testCaseId: string) => {
    setExpandedTestCases((prev) => ({
      ...prev,
      [testCaseId]: !prev[testCaseId],
    }));
  };

  const handleRemoveTestCase = (testCaseId: string) => {
    const updatedTestCases = aiTestCases.filter(tc => tc.test_case_id !== testCaseId);
    setAITestCases(updatedTestCases);
    storage.saveTestCasesForTask(task.id, updatedTestCases);
  };

  const startAIProcessing = () => {
    setAIStep('extracting');
    setTimeout(() => {
      setAIStep('thinking');
      setTimeout(() => {
        setAIStep('understanding');
        setTimeout(() => {
          setAIStep('generating');
          setTimeout(() => {
            setAIStep('done');
            const description = editedTask?.description || '';
            let requirementTag = description;

            if (!requirementTag) {
              setAITestCases(['No matching test cases found for this requirement tag.'] as any);
              return;
            }

            const matchingChapters = testCasesData.filter(
              (chapter) => chapter.requirement_tag === requirementTag
            );

            if (matchingChapters.length > 0) {
              const allTestCases = matchingChapters.flatMap(chapter => chapter.test_cases);
              const enrichedTestCases = allTestCases.map(tc => ({
                ...tc,
                assigned_to: tc.assigned_to || '',
                status: tc.status || 'TODO',
              }));
              setAITestCases(enrichedTestCases);
              storage.saveTestCasesForTask(task.id, enrichedTestCases);
            } else {
              setAITestCases(['No test cases found for requirement tag: ' + requirementTag] as any);
            }
          }, 2500);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="relative z-[50]"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl shadow-2xl h-[90vh] flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  {editedTask.name}
                </Dialog.Title>
                <span className="text-sm text-gray-500">in {editedTask.stage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editedTask.name.toLowerCase().includes('testing') && (
                <button
                  onClick={handleAITestCaseClick}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                  disabled={showAITestCaseSection}
                >
                  <SparklesIcon className="w-4 h-4" />
                  Generate Test Cases
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              <div className="flex-1 p-6 border-r overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Description</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full border rounded-lg p-3 min-h-[100px] text-sm"
                        placeholder="Add a description..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedDescription(task.description || '');
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {editedDescription || 'No description provided'}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Attachments</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm font-medium"
                      >
                        Choose File
                      </label>
                      {selectedFile && (
                        <button
                          onClick={handleUpload}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-700">{attachment.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.round(attachment.size / 1024)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Comments</h3>
                  <div className="mb-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full border rounded-lg p-3 text-sm"
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <button
                      onClick={handleAddComment}
                      className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="space-y-4">
                    {editedTask.comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                            {comment.createdBy.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <span className="font-medium text-sm">{comment.createdBy}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {showAITestCaseSection && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Test Cases</h3>
                    {aiStep !== 'done' ? (
                      <div className="flex flex-col items-center py-8 bg-gray-50 rounded-lg">
                        <div className="w-full max-w-md">
                          <div className="relative pt-1">
                            <div className="h-2 mb-4 text-xs flex rounded bg-blue-200">
                              <div
                                style={{
                                  width: aiStep === 'extracting' ? '25%' :
                                        aiStep === 'thinking' ? '50%' :
                                        aiStep === 'understanding' ? '75%' : '100%'
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 rounded transition-all duration-500"
                              />
                            </div>
                            <div className="text-center text-blue-700 font-medium animate-pulse">
                              {aiStep === 'extracting' && 'Extracting requirement document...'}
                              {aiStep === 'thinking' && 'Analyzing requirements...'}
                              {aiStep === 'understanding' && 'Understanding test scenarios...'}
                              {aiStep === 'generating' && 'Generating test cases...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {aiTestCases.map((tc, idx) => (
                          typeof tc === 'string' ? (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm">
                              {tc}
                            </div>
                          ) : (
                            <div
                              key={tc.test_case_id}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div
                                className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                onClick={() => toggleTestCase(tc.test_case_id)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{tc.test_case_id}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTestCaseStatusColor(tc.status)}`}>
                                    {tc.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveTestCase(tc.test_case_id);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 rounded"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                  {expandedTestCases[tc.test_case_id] ? (
                                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                              </div>
                              {expandedTestCases[tc.test_case_id] && (
                                <div className="p-4 bg-gray-50 border-t">
                                  <p className="text-sm text-gray-700 mb-3">{tc.test_case_description}</p>
                                  <h4 className="text-xs font-medium text-gray-700 mb-2">Acceptance Criteria:</h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {tc.acceptance_criteria.map((criterion, idx) => (
                                      <li key={idx} className="text-sm text-gray-600">{criterion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-80 p-6 bg-gray-50">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as TaskStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            editedTask.status === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                    <div className="flex flex-wrap gap-2">
                      {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            editedTask.priority === priority
                              ? priority === 'HIGH'
                                ? 'bg-red-600 text-white'
                                : priority === 'MEDIUM'
                                ? 'bg-orange-600 text-white'
                                : 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Assignee</h3>
                    <div className="relative">
                      <input
                        type="text"
                        value={editedTask.assignee || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                        placeholder="Assign to..."
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                    <input
                      type="date"
                      value={editedTask.dueDate || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Labels</h3>
                    <div className="flex flex-wrap gap-2">
                      {editedTask.labels.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {editedTask.timeSpent !== undefined && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Time Tracking</h3>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time spent</span>
                          <span className="font-medium">{Math.round(editedTask.timeSpent / 60)}h</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="flex space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                <span>{editedTask.comments.length} comments</span>
              </div>
              <div className="flex items-center">
                <PaperClipIcon className="w-4 h-4 mr-1" />
                <span>{editedTask.attachments.length} attachments</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};