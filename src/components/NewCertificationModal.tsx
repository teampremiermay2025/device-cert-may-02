import { FC, FormEvent, useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationStage, CertificationTask, TaskStatus, TaskPriority } from '../types';
import { storage } from '../lib/storage';
import { useWorkflowStore } from '../store/workflowStore';
import { createTasksForStage } from '../lib/workflow';
import deviceData from '../data/devices.json';
import taskStepsData from '../data/ruleset.json';
import usersData from '../data/users.json';
import Select from 'react-select';

interface NewCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'processing' | 'review';

// Utility to get user by id
const getUserById = (id: string) => usersData.users.find(u => u.id === id);

// Assignee bubble component
export const AssigneeBubble = ({ assigneeId }: { assigneeId?: string }) => {
  if (!assigneeId) return null;
  const user = getUserById(assigneeId);
  if (!user) return null;
  const nameParts = user.name.split(' ');
  const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[nameParts.length - 1][0] : user.name.slice(0, 2);
  return (
    <span className="flex items-center gap-1 bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5 text-xs font-semibold text-blue-800 shadow-sm">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full mr-1" />
      ) : (
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-300 text-white mr-1" style={{fontSize: '0.85rem'}}>{initials}</span>
      )}
      <span className="font-bold text-blue-900">{initials}</span>
      <span className="ml-1 text-blue-800">{user.name}</span>
    </span>
  );
};

// Options for react-select
const userOptions = usersData.users.map(user => ({
  value: user.id,
  label: user.name,
  avatar: user.avatar,
  name: user.name,
}));

// Custom Option for react-select
const UserOption = (props: any) => {
  const { data, innerProps, isFocused } = props;
  const nameParts = data.name.split(' ');
  const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[nameParts.length - 1][0] : data.name.slice(0, 2);
  return (
    <div {...innerProps} className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${isFocused ? 'bg-blue-50' : ''}`}>
      {data.avatar ? (
        <img src={data.avatar} alt={data.name} className="w-5 h-5 rounded-full" />
      ) : (
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-300 text-white" style={{fontSize: '0.85rem'}}>{initials}</span>
      )}
      <span className="font-bold text-blue-900">{initials}</span>
      <span className="text-blue-800">{data.name}</span>
    </div>
  );
};

// Custom SingleValue for react-select
const UserSingleValue = (props: any) => {
  const { data } = props;
  const nameParts = data.name.split(' ');
  const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[nameParts.length - 1][0] : data.name.slice(0, 2);
  return (
    <div className="flex items-center gap-2">
      {data.avatar ? (
        <img src={data.avatar} alt={data.name} className="w-5 h-5 rounded-full" />
      ) : (
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-300 text-white" style={{fontSize: '0.85rem'}}>{initials}</span>
      )}
      <span className="font-bold text-blue-900">{initials}</span>
      <span className="text-blue-800">{data.name}</span>
    </div>
  );
};

export const NewCertificationModal: FC<NewCertificationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [processingStep, setProcessingStep] = useState('');
  const [formData, setFormData] = useState({
    darpKey: '',
    projectName: 'Smoke Test: ST0919A',
    projectType: '',
    targetDate: '',
    softwareVersion: '',
    assignee: '',
    estimatedCompletionDate: '',
    oemDocuments: [] as File[],
    forecastedDEDate: '',
    forecastedFFWDate: '',
    forecastedTADate: '',
    forecastedLaunchDate: '',
    deviceModel: '',
    startDate: new Date().toISOString().slice(0, 10), // Default to today
  });

  // Group devices by type
  const groupedDevices = useMemo(() => {
    const groups = {
      'IoT': deviceData.filter(device => device.Type === 'IoT'),
      'Non-IoT': deviceData.filter(device => device.Type === 'Non-IoT')
    };
    return groups;
  }, []);

  // Handle date synchronization
  const handleDateChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      forecastedDEDate: field === 'forecastedDEDate' ? value : prev.forecastedDEDate || value,
      forecastedFFWDate: field === 'forecastedFFWDate' ? value : prev.forecastedFFWDate || value,
      forecastedTADate: field === 'forecastedTADate' ? value : prev.forecastedTADate || value,
      forecastedLaunchDate: field === 'forecastedLaunchDate' ? value : prev.forecastedLaunchDate || value,
    }));
  };

  // Handle device selection
  const handleDeviceSelection = (deviceIssueKey: string) => {
    const selectedDevice = deviceData.find(device => device['Device Issue Key'] === deviceIssueKey);
    if (selectedDevice) {
      setFormData(prev => ({
        ...prev,
        deviceModel: deviceIssueKey,
        vendor: selectedDevice['Device Vendor'],
        deviceType: selectedDevice['Device Type'],
        deviceMarketingName: selectedDevice['Device Marketing Name'],
        deviceCodeName: selectedDevice['Device Code Name'],
        deviceOS: selectedDevice['Device OS'],
        deviceOSVersion: selectedDevice['Device OS Version'],
        deviceHardwareVersion: selectedDevice['Device Hardware Version'],
        devicePaymentType: selectedDevice['Device Payment Type'],
        deviceChannel: selectedDevice['Device Channel'],
      }));
    }
  };

  const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { selectedWorkflow: defaultWorkflow, setSelectedWorkflow: setStoreSelectedWorkflow } = useWorkflowStore();

  // Load saved workflows from localStorage
  useEffect(() => {
    console.log('Loading jiraWorkflows from localStorage');
    const saved = localStorage.getItem("jiraWorkflows");
    console.log('Raw jiraWorkflows:', saved);
    if (saved) {
      try {
        const workflows = JSON.parse(saved);
        if (!Array.isArray(workflows)) {
          throw new Error("jiraWorkflows is not an array");
        }
        console.log('Parsed workflows:', workflows);
        setSavedWorkflows(workflows);
      } catch (error) {
        console.error("Error parsing jiraWorkflows from localStorage:", error);
        setSavedWorkflows([]);
        setErrorMessage("Error loading workflows. Using default workflow.");
      }
    }
  }, [isOpen]); // Reload when modal opens

  // Memoize defaultWorkflow to prevent unnecessary re-renders
  const memoizedDefaultWorkflow = useMemo(() => defaultWorkflow, [defaultWorkflow]);

  // Match project type to a workflow when projectType changes
  useEffect(() => {
    console.log('Matching workflow for projectType:', formData.projectType);
    console.log('Current savedWorkflows:', savedWorkflows);
    if (formData.projectType) {
      try {
        const matchedWorkflow = savedWorkflows.find(
          (w) => w.name && w.name.toLowerCase() === formData.projectType.toLowerCase()
        );
        console.log('Matched workflow:', matchedWorkflow);

        if (matchedWorkflow) {
          if (!matchedWorkflow.id) throw new Error("Matched workflow missing 'id'");
          if (!matchedWorkflow.name) throw new Error("Matched workflow missing 'name'");
          if (!Array.isArray(matchedWorkflow.nodes)) {
            console.warn("Matched workflow 'nodes' is not an array, defaulting to []");
            matchedWorkflow.nodes = [];
          }
          if (!Array.isArray(matchedWorkflow.edges)) {
            console.warn("Matched workflow 'edges' is not an array, defaulting to []");
            matchedWorkflow.edges = [];
          }
          if (typeof matchedWorkflow.tasks !== 'object' || matchedWorkflow.tasks === null) {
            console.warn("Matched workflow 'tasks' is not an object, defaulting to {}");
            matchedWorkflow.tasks = {};
          }

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
                tasks: [], // We'll populate tasks from ruleset.json
              })),
            tasks: matchedWorkflow.tasks,
          };

          if (JSON.stringify(selectedWorkflow) !== JSON.stringify(transformedWorkflow)) {
            setSelectedWorkflow(transformedWorkflow);
          }

          setErrorMessage('');
        } else {
          console.warn(`No workflow found for project type "${formData.projectType}". Using default workflow.`);
          if (JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
            setSelectedWorkflow(memoizedDefaultWorkflow);
          }
          setErrorMessage(`No workflow found for project type "${formData.projectType}". Using default workflow.`);
        }
      } catch (error) {
        console.error("Error matching or transforming workflow:", error);
        if (JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
          setSelectedWorkflow(memoizedDefaultWorkflow);
        }
        setErrorMessage("Error processing workflow. Using default workflow.");
      }
    } else {
      if (JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
        setSelectedWorkflow(memoizedDefaultWorkflow);
      }
      setErrorMessage('');
    }
  }, [formData.projectType, savedWorkflows, memoizedDefaultWorkflow]);

  // Synchronize selectedWorkflow with the store
  useEffect(() => {
    if (selectedWorkflow && JSON.stringify(selectedWorkflow) !== JSON.stringify(memoizedDefaultWorkflow)) {
      console.log('Synchronizing selectedWorkflow with store:', selectedWorkflow);
      setStoreSelectedWorkflow(selectedWorkflow);
    }
  }, [selectedWorkflow, memoizedDefaultWorkflow, setStoreSelectedWorkflow]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentStep('processing');
    const steps = [
      'Processing the Documentation...',
      'Extracting the Tasks...',
      'Creating Sub Tasks...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProcessingStep(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setCurrentStep('review');
      }
    }, 1000);
  };

  const mapTaskStatus = (jiraStatus: string): TaskStatus => {
    switch (jiraStatus?.toLowerCase() || '') {
      case 'not started':
        return 'TODO';
      case 'in progress':
        return 'IN_PROGRESS';
      case 'completed':
        return 'DONE';
      default:
        return 'TODO';
    }
  };

  // Helper: Get available OEM_MEMBERs, filter out-of-office
  function getAvailableOemMembers(taskDueDate?: string) {
    const oemMembers = usersData.users.filter(u => u.role === 'OEM_MEMBER');
    if (!taskDueDate) return oemMembers;
    const dueDateStr = new Date(taskDueDate).toISOString().slice(0, 10);
    return oemMembers.filter(u => {
      if (!u.outOfOfficeDays) return true;
      return !u.outOfOfficeDays.includes(dueDateStr);
    });
  }

  // Helper: Distribute tasks across OEM_MEMBERs
  function assignTasksToOemMembers(tasks: any[], dueDate?: string) {
    const availableMembers = getAvailableOemMembers(dueDate);
    if (availableMembers.length === 0) return tasks;
    let idx = 0;
    return tasks.map(task => {
      // For each task, assign to next available OEM_MEMBER, round-robin
      const assignee = availableMembers[idx % availableMembers.length];
      idx++;
      return { ...task, assignee: assignee.id };
    });
  }

  // Function to filter tasks from ruleset.json based on projectType, deviceChannel, and stage
  const filterTasksFromRuleset = (stage: string, projectType: string, deviceChannel: string): CertificationTask[] => {
    console.log('filterTasksFromRuleset filters:', {
      stage,
      projectType,
      deviceChannel,
      lowerStage: stage.toUpperCase(),
      lowerProjectType: projectType.toLowerCase(),
      lowerDeviceChannel: deviceChannel.toLowerCase()
    });
    const filteredTasks = taskStepsData.filter((task) => {
      const matchesIssueType = task.issue_types.some(
        (type: string) => type.toLowerCase() === projectType.toLowerCase()
      );
      const matchesDeviceChannel = task.device_channels.some(
        (channel: string) => channel.toLowerCase() === deviceChannel.toLowerCase()
      );
      const matchesStage = task.stage.toUpperCase() === stage.toUpperCase();
      return matchesIssueType && matchesDeviceChannel && matchesStage;
    });
    console.log('Before Tasks after filteredTasks:', filteredTasks); 
    // Create tasks without assignee first
    let tasks = filteredTasks.map((task) => ({
      id: crypto.randomUUID(),
      name: `${task.deliverable}`,
      description: `${task.requirement_tag}`,
      status: 'TODO' as TaskStatus,
      isChecked: false,
      // assignee will be distributed below
      priority: 'MEDIUM' as TaskPriority,
      dueDate: formData.targetDate || undefined,
      attachments: [],
      comments: [],
      timeSpent: undefined,
      labels: [],
      stage: stage.toUpperCase() as CertificationStage,
    }));
  
    // Distribute assignees
    tasks = assignTasksToOemMembers(tasks, formData.targetDate);
   
    return tasks;
  };

  const handleConfirm = () => {
    if (!selectedWorkflow) return;

    const selectedDevice = deviceData.find(device => device['Device Issue Key'] === formData.deviceModel);
    const deviceChannel = selectedDevice?.['Device Channel'] || '';
    const projectType = formData.projectType;

    // Get initial tasks for the "FORECAST" stage from ruleset.json
    const initialStage = 'FORECAST';
    const tasks = filterTasksFromRuleset(initialStage, projectType, deviceChannel);
    console.log('Tasks created in handleConfirm:', tasks); // Debug: Log tasks at creation

    const now = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newCertification: CertificationRequest = {
      id: crypto.randomUUID(),
      darpKey: formData.darpKey,
      projectName: formData.projectName,
      type: formData.projectType,
      status: initialStage.toUpperCase() as CertificationStage,
      targetDate: formData.targetDate,
      softwareVersion: formData.softwareVersion,
      lastUpdated: now,
      tasks,
      issues: [],
      activities: [
      {
        id: crypto.randomUUID(),
        type: 'certification_created',
        timestamp: now,
        userId: formData.assignee || 'system',
        details: {
        message: 'Certification request created',
        projectName: formData.projectName,
        projectType: formData.projectType,
        deviceModel: selectedDevice?.['Device Model'] || '',
        }
      }
      ],
      workflow: selectedWorkflow.id,
      assignee: formData.assignee,
      reporter: user.id || '',
      vendor: selectedDevice?.['Device Vendor'] || '',
      deviceType: selectedDevice?.['Device Type'] || '',
      deviceModel: selectedDevice?.['Device Model'] || '',
      deviceMarketingName: selectedDevice?.['Device Marketing Name'] || '',
      deviceCodeName: selectedDevice?.['Device Code Name'] || '',
      deviceOS: selectedDevice?.['Device OS'] || '',
      deviceOSVersion: selectedDevice?.['Device OS Version'] || '',
      deviceHardwareVersion: selectedDevice?.['Device Hardware Version'] || '',
      devicePaymentType: selectedDevice?.['Device Payment Type'] || '',
      deviceChannel: deviceChannel,
      securityLevel: '',
      primaryPC: '',
      vendorProjectLead: '',
      createdAt: now,
      updatedAt: now,
      forecastedDEDate: formData.forecastedDEDate,
      forecastedFFWDate: formData.forecastedFFWDate,
      forecastedTADate: formData.forecastedTADate,
      forecastedLaunchDate: formData.forecastedLaunchDate,
      components: '',
      affectsVersion: formData.softwareVersion,
      resolution: '',
      startDate: formData.startDate,
    };

    const certifications = storage.getCertifications();
    storage.saveCertifications([...certifications, newCertification]);

    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      oemDocuments: [...prev.oemDocuments, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      oemDocuments: prev.oemDocuments.filter((_, i) => i !== index),
    }));
  };

  // Get initial tasks for display in the review step
  const selectedDevice = deviceData.find(device => device['Device Issue Key'] === formData.deviceModel);
  const deviceChannel = selectedDevice?.['Device Channel'] || '';
  const initialTasks = filterTasksFromRuleset('FORECAST', formData.projectType, deviceChannel);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
          {currentStep === 'form' && (
            <div className="flex flex-col h-[70vh]">
              <div className="p-6 border-b">
                <Dialog.Title className="text-xl font-bold">
                  Start a new certification request
                </Dialog.Title>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {errorMessage && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        DARP Key
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Enter DARP key"
                        value={formData.darpKey}
                        onChange={(e) => setFormData({ ...formData, darpKey: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        Project Name
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Enter project name"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500">
                        Project Type
                      </label>
                      <select
                        className="w-full border rounded p-2"
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        required
                      >
                        <option value="">Select project type</option>
                        <option>DA IR</option>
                        <option>DA MR</option>
                        <option>DA EMR</option>
                        <option>DA SMR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Device Model
                      </label>
                      <select
                        className="w-full border rounded p-2"
                        value={formData.deviceModel}
                        onChange={(e) => handleDeviceSelection(e.target.value)}
                      >
                        <option value="">Select device model</option>
                        <optgroup label="IoT Devices">
                          {groupedDevices['IoT'].map(device => (
                            <option key={device['Device Issue Key']} value={device['Device Issue Key']}>
                              {device['Device Model']} - {device['Device Marketing Name']}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Non-IoT Devices">
                          {groupedDevices['Non-IoT'].map(device => (
                            <option key={device['Device Issue Key']} value={device['Device Issue Key']}>
                              {device['Device Model']} - {device['Device Marketing Name']}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Forecasted DE Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.forecastedDEDate}
                        onChange={(e) => handleDateChange('forecastedDEDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Forecasted FFW Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.forecastedFFWDate}
                        onChange={(e) => handleDateChange('forecastedFFWDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Forecasted TA Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.forecastedTADate}
                        onChange={(e) => handleDateChange('forecastedTADate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Forecasted Launch Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.forecastedLaunchDate}
                        onChange={(e) => handleDateChange('forecastedLaunchDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Software Version
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        placeholder="Ex. 1.0"
                        value={formData.softwareVersion}
                        onChange={(e) => setFormData({ ...formData, softwareVersion: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 bg-gray-100"
                        value="FORECAST"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="block text-sm font-medium text-gray-700">Assignee:</label>
                      <div className="w-64">
                        <Select
                          options={userOptions}
                          value={userOptions.find(opt => opt.value === formData.assignee) || null}
                          onChange={option => setFormData(prev => ({ ...prev, assignee: option ? option.value : '' }))}
                          isClearable
                          placeholder="Search or select user..."
                          components={{ Option: UserOption, SingleValue: UserSingleValue }}
                          styles={{
                            control: (base) => ({ ...base, minHeight: '2.5rem', borderRadius: '0.5rem', borderColor: '#bfdbfe' }),
                            option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#e0e7ff' : undefined }),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Upload OEM Documents
                    </label>
                    <div className="border-dashed border-2 border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 text-sm text-gray-600">
                              Drag & drop files here, or click to select files
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFileChange}
                              accept=".xlsx,.doc,.docx,.pdf"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported formats: XLSX, DOC, PDF | Maximum upload size 1000 MB
                        </p>
                      </div>
                    </div>

                    {formData.oemDocuments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Selected Files
                        </h4>
                        <div className="space-y-2">
                          {formData.oemDocuments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{file.name}</span>
                                <span className="ml-2 text-sm text-gray-500">
                                  ({Math.round(file.size / 1024)} KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-white border-t px-6 py-4 z-10 flex justify-end items-center shadow-md">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="p-6">
              <Dialog.Title className="text-xl font-bold mb-4">
                Processing Request
              </Dialog.Title>
              <div className="mt-4">
                <p className="font-semibold mb-2">{processingStep}</p>
                <div className="w-full bg-gray-200 rounded">
                  <div className="bg-blue-600 h-4 rounded doc-progress" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="flex flex-col h-[70vh]">
              {/* Sticky dialog title/header */}
              <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
                <div className="p-6">
                  <Dialog.Title className="text-xl font-bold mb-4">
                    Review Certification Request
                  </Dialog.Title>
                </div>
              </div>

              {/* Scrollable middle section */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">DARP Key</p>
                        <p className="font-medium">{formData.darpKey || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Name</p>
                        <p className="font-medium">{formData.projectName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Type</p>
                        <p className="font-medium">{formData.projectType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Workflow</p>
                        <p className="font-medium">{selectedWorkflow?.name || 'Default Workflow'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Device Model</p>
                        <p className="font-medium">
                          {deviceData.find(d => d['Device Issue Key'] === formData.deviceModel)?.['Device Model'] || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Software Version</p>
                        <p className="font-medium">{formData.softwareVersion || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium">FORECAST</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assignee</p>
                        <p className="font-medium">{formData.assignee || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">{formData.startDate}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Forecasted Dates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">DE Date</p>
                        <p className="font-medium">{formData.forecastedDEDate || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">FFW Date</p>
                        <p className="font-medium">{formData.forecastedFFWDate || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">TA Date</p>
                        <p className="font-medium">{formData.forecastedTADate || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Launch Date</p>
                        <p className="font-medium">{formData.forecastedLaunchDate || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">OEM Documents</h3>
                    <div className="border rounded-lg divide-y">
                      {formData.oemDocuments.map((file, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm">{file.name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                        </div>
                      ))}
                      {formData.oemDocuments.length === 0 && (
                        <div className="p-3 text-sm text-gray-500">
                          No documents uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Initial Tasks</h3>
                    <div className="border rounded-lg divide-y">
                      {initialTasks.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          No initial tasks available.
                        </div>
                      ) : (
                        initialTasks.map((task: CertificationTask) => (
                          <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300"
                                  checked={task.isChecked}
                                  disabled
                                />
                              </div>
                              <span className="ml-3">{task.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{task.status}</span>
                              {task.priority === 'HIGH' && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  High Priority
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      These tasks will be created automatically when the certification request is created.
                      Additional tasks will be added as the certification progresses through different stages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sticky footer for review step */}
              <div className="sticky bottom-0 z-20 bg-gray-50 border-t p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>Estimated completion time: 2-3 weeks</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep('form')}
                      className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirm & Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};