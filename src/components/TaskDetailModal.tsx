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
} from '@heroicons/react/24/outline';
import { CertificationTask, TaskPriority, TaskStatus } from '../types';
import { storage } from '../lib/storage';
import testCasesData from '../data/testcases.json';

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

export const TaskDetailModal: FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
}) => {
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for AI test case generation UI
  const [showAITestCaseSection, setShowAITestCaseSection] = useState(false);
  const [aiStep, setAIStep] = useState<'idle' | 'processing' | 'understanding' | 'typing' | 'done'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiTestCases, setAITestCases] = useState<TestCase[]>([]);
  const [expandedTestCases, setExpandedTestCases] = useState<{ [key: string]: boolean }>({});
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);
  const [editedTestCase, setEditedTestCase] = useState<Partial<TestCase>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load test cases from localStorage and set showAITestCaseSection when the modal opens
  useEffect(() => {
    if (isOpen) {
      const savedTestCases = storage.getTestCasesForTask(task.id);
      console.log('Loaded test cases for task', task.id, ':', savedTestCases);
      setAITestCases(savedTestCases);
      // Show the test case section if there are saved test cases
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
    onUpdate(editedTask);
    onClose(); // Explicitly close the modal after saving
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

  // Handler for AI Test Case button
  const handleAITestCaseClick = () => {
    setShowAITestCaseSection(true);
    setAIStep('idle');
    setUploadedFile(null);
    setExpandedTestCases({});
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

  const handleTestFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      startAIProcessing();
    }
  };

  // Toggle expand/collapse for a test case
  const toggleTestCase = (testCaseId: string) => {
    setExpandedTestCases((prev) => ({
      ...prev,
      [testCaseId]: !prev[testCaseId],
    }));
  };

  // Remove a test case and update localStorage
  const handleRemoveTestCase = (testCaseId: string) => {
    const updatedTestCases = aiTestCases.filter(tc => tc.test_case_id !== testCaseId);
    setAITestCases(updatedTestCases);
    storage.saveTestCasesForTask(task.id, updatedTestCases);
  };

  // Start editing a test case
  const handleEditTestCase = (tc: TestCase) => {
    setEditingTestCaseId(tc.test_case_id);
    setEditedTestCase({
      test_case_description: tc.test_case_description,
      acceptance_criteria: [...tc.acceptance_criteria],
      assigned_to: tc.assigned_to,
    });
  };

  // Save edited test case and update localStorage
  const handleSaveTestCase = (testCaseId: string) => {
    const updatedTestCases = aiTestCases.map(tc =>
      tc.test_case_id === testCaseId
        ? {
            ...tc,
            test_case_description: editedTestCase.test_case_description || tc.test_case_description,
            acceptance_criteria: editedTestCase.acceptance_criteria || tc.acceptance_criteria,
            assigned_to: editedTestCase.assigned_to || tc.assigned_to,
          }
        : tc
    );
    setAITestCases(updatedTestCases);
    storage.saveTestCasesForTask(task.id, updatedTestCases);
    setEditingTestCaseId(null);
    setEditedTestCase({});
  };

  // Handle changes to acceptance criteria during editing
  const handleAcceptanceCriteriaChange = (index: number, value: string) => {
    const updatedCriteria = [...(editedTestCase.acceptance_criteria || [])];
    updatedCriteria[index] = value;
    setEditedTestCase({ ...editedTestCase, acceptance_criteria: updatedCriteria });
  };

  // Simulate AI processing steps
  const startAIProcessing = () => {
    setAIStep('processing');
    setTimeout(() => {
      setAIStep('understanding');
      setTimeout(() => {
        setAIStep('typing');
        setTimeout(() => {
          setAIStep('done');
          const description = editedTask?.description || '';
          let requirementTag = description;

          console.log('Extracted requirement tag:', requirementTag);

          if (!requirementTag) {
            setAITestCases(['No matching test cases found for this requirement tag.'] as any);
            return;
          }

          console.log('Matching requirement tag:', requirementTag);
          const matchingChapters = testCasesData.filter(
            (chapter) => chapter.requirement_tag === requirementTag
          );
          console.log('Matching chapters:', matchingChapters);

          if (matchingChapters.length > 0) {
            const allTestCases = matchingChapters.flatMap(chapter => chapter.test_cases);
            const enrichedTestCases = allTestCases.map(tc => ({
              ...tc,
              assigned_to: tc.assigned_to || '',
              status: tc.status || 'Not Started',
            }));
            setAITestCases(enrichedTestCases);
            storage.saveTestCasesForTask(task.id, enrichedTestCases);
          } else {
            setAITestCases(['No test cases found for requirement tag: ' + requirementTag] as any);
          }
        }, 2500);
      }, 2000);
    }, 2000);
  };

  // Drag & drop helpers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Prevent modal from closing when clicking inside
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="relative z-[50]"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          className="w-full max-w-6xl bg-white rounded-lg h-[90vh] flex flex-col"
          onClick={handleDialogClick}
        >
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Dialog.Title className="text-xl font-bold">
                  {editedTask.name}
                </Dialog.Title>
                <button
                  onClick={handleAITestCaseClick}
                  className="p-1 bg-pink-500 text-white rounded hover:bg-blue-600 flex items-center"
                  title="Generate AI Test Case"
                  disabled={showAITestCaseSection}
                >
                  <SparklesIcon className="w-5 h-5 mr-2 text-white" />
                  <span className="inline-block align-middle">Generate Test Cases</span>
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

          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              <div className="flex-1 p-6 border-r overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    className="w-full border rounded-lg p-3 min-h-[100px]"
                    placeholder="Add a description..."
                  />
                </div>

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

                {/* AI Test Case Generation Section */}
                {showAITestCaseSection && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                          onChange={handleTestFileChange}
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
                        <div className="bg-white rounded-lg border max-h-64 overflow-y-auto">
                          {aiTestCases.length === 0 && (
                            <div className="p-4 text-gray-700">
                              No test cases available. Upload a requirement file to generate test cases.
                            </div>
                          )}
                          {aiTestCases.map((tc, idx) => (
                            typeof tc === 'string' ? (
                              <div
                                key={idx}
                                className="p-4 border-b last:border-b-0 hover:bg-gray-50 animate-fade-in-up"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700">{tc}</span>
                                </div>
                              </div>
                            ) : (
                              <div
                                key={tc.test_case_id}
                                className="border-b last:border-b-0 hover:bg-gray-50 animate-fade-in-up"
                              >
                                <div
                                  className="p-4 flex items-center justify-between cursor-pointer"
                                  onClick={() => toggleTestCase(tc.test_case_id)}
                                >
                                  <div className="flex-1 flex items-center space-x-2">
                                    <span className="text-gray-700 font-medium">{tc.test_case_id}</span>
                                    <span className="text-gray-500 text-sm">({tc.status})</span>
                                    <span className="text-gray-500 text-sm">Assigned to: {tc.assigned_to || 'Unassigned'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTestCase(tc.test_case_id);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                    {expandedTestCases[tc.test_case_id] ? (
                                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                  </div>
                                </div>
                                {expandedTestCases[tc.test_case_id] && (
                                  <div className="px-4 pb-4 text-gray-600">
                                    {editingTestCaseId === tc.test_case_id ? (
                                      <div>
                                        <div className="mb-2">
                                          <span className="font-semibold">Description: </span>
                                          <input
                                            type="text"
                                            value={editedTestCase.test_case_description || ''}
                                            onChange={(e) =>
                                              setEditedTestCase({
                                                ...editedTestCase,
                                                test_case_description: e.target.value,
                                              })
                                            }
                                            className="w-full border rounded-lg p-2"
                                          />
                                        </div>
                                        <div className="mb-2">
                                          <span className="font-semibold">Assigned To: </span>
                                          <input
                                            type="text"
                                            value={editedTestCase.assigned_to || ''}
                                            onChange={(e) =>
                                              setEditedTestCase({
                                                ...editedTestCase,
                                                assigned_to: e.target.value,
                                              })
                                            }
                                            className="w-full border rounded-lg p-2"
                                          />
                                        </div>
                                        <div>
                                          <span className="font-semibold">Acceptance Criteria:</span>
                                          <ul className="list-disc pl-5 mt-1">
                                            {(editedTestCase.acceptance_criteria || tc.acceptance_criteria).map((criterion, critIdx) => (
                                              <li key={critIdx} className="text-sm">
                                                <input
                                                  type="text"
                                                  value={criterion}
                                                  onChange={(e) =>
                                                    handleAcceptanceCriteriaChange(critIdx, e.target.value)
                                                  }
                                                  className="w-full border rounded-lg p-1"
                                                />
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="mb-2">
                                          <span className="font-semibold">Description: </span>
                                          <span>{tc.test_case_description}</span>
                                        </div>
                                        <div>
                                          <span className="font-semibold">Acceptance Criteria:</span>
                                          <ul className="list-disc pl-5 mt-1">
                                            {tc.acceptance_criteria.map((criterion, critIdx) => (
                                              <li key={critIdx} className="text-sm">{criterion}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                    <div className="mt-2 flex justify-end">
                                      {editingTestCaseId === tc.test_case_id ? (
                                        <button
                                          onClick={() => handleSaveTestCase(tc.test_case_id)}
                                          className="text-green-500 hover:text-green-700"
                                        >
                                          <CheckIcon className="w-5 h-5" />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleEditTestCase(tc)}
                                          className="text-gray-500 hover:text-gray-700"
                                        >
                                          <PencilIcon className="w-5 h-5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-80 p-6 overflow-y-auto">
                <div className="space-y-6">
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
          </div>

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