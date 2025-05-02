import { CertificationRequest, Workflow, Dashboard, Activity, ActivityType, ActivityDetails } from '../types';

const STORAGE_KEYS = {
  CERTIFICATIONS: 'certifications',
  WORKFLOWS: 'workflows',
  DASHBOARDS: 'dashboards',
  DEVICES: 'devices',
  TASK_TEST_CASES: 'taskTestCases',
} as const;

// Define the Device interface based on devices.json
interface Device {
  id: string;
  "Device Issue Key": string;
  Summary: string;
  Status: string;
  Comments: string;
  Assignee?: string;
  priority: string;
  "Created Date": string;
  "Device Vendor": string;
  "Device Type": string;
  "Device Model": string;
  "Device Marketing Name": string;
  "Device Code Name": string;
  "Device OS": string;
  "Device OS Version": string;
  "Device Hardware Version": string;
  "Device Payment Type": string;
  "Device Channel": string;
  Type: string;
  [key: string]: any;
}

// Define the TestCase interface
interface TestCase {
  test_case_id: string;
  test_case_description: string;
  acceptance_criteria: string[];
  assigned_to: string;
  status: string;
}

// Define the structure for taskTestCases in localStorage
interface TaskTestCases {
  [taskId: string]: TestCase[];
}

const createActivity = (
  type: ActivityType,
  userId: string,
  details: ActivityDetails
): Activity => ({
  id: crypto.randomUUID(),
  type,
  userId,
  timestamp: new Date().toISOString(),
  details,
});

const initialCertifications: CertificationRequest[] = [
  {
    id: 'DARP-127205',
    darpKey: 'DARP-127205',
    projectName: 'DA IR Smoke Test ST0Y15A Stock/Push - 2025-02-28',
    type: 'DA IR',
    status: 'PLANNING',
    lastUpdated: '2025-02-28',
    targetDate: '2025-03-28',
    softwareVersion: '1.0.0',
    workflow: 'default-workflow',
    vendor: 'Smoke Test',
    deviceType: 'Handset',
    deviceModel: 'ST0Y15A',
    deviceMarketingName: 'MKTG ST0Y15A',
    deviceCodeName: 'Code ST0Y15A',
    deviceOS: 'Android',
    deviceOSVersion: '20',
    deviceHardwareVersion: '1.0',
    devicePaymentType: 'Post-Paid',
    deviceChannel: 'Stock',
    securityLevel: 'DA OEM - Smoke Test',
    assignee: 'TestUser1 - ST OEM',
    reporter: 'TestUser1 - ST OEM',
    primaryPC: 'ATT PC',
    vendorProjectLead: 'TestUser1 - ST OEM',
    createdAt: '2025-02-28T11:08:00Z',
    updatedAt: '2025-04-04T10:52:00Z',
    forecastedDEDate: '2025-02-28',
    forecastedFFWDate: '2025-02-28',
    forecastedTADate: '2025-02-28',
    forecastedLaunchDate: '2025-02-28',
    components: 'TEST',
    affectsVersion: '24.3 (R/Nov/24)',
    resolution: 'Unresolved',
    tasks: [
      {
        id: '1',
        name: 'Compliance Reqs: Chapter Reviews',
        status: 'TODO',
        isChecked: false,
        priority: 'HIGH',
        assignee: 'TestUser1 - ST OEM',
        attachments: [],
        comments: [],
        labels: ['compliance'],
        stage: 'PLANNING',
        createdAt: '2025-02-28T11:08:00Z',
        createdBy: 'TestUser1 - ST OEM'
      },
      {
        id: '2',
        name: 'Deliverable Reqs: Chapter Reviews',
        status: 'DONE',
        isChecked: true,
        priority: 'MEDIUM',
        assignee: 'Michel Chriqui',
        attachments: [],
        comments: [],
        labels: ['deliverable'],
        stage: 'PLANNING',
        createdAt: '2025-02-28T11:08:00Z',
        createdBy: 'TestUser1 - ST OEM'
      }
    ],
    issues: [],
    activities: [
      {
        id: crypto.randomUUID(),
        type: 'certification_created',
        userId: 'TestUser1 - ST OEM',
        timestamp: '2025-02-28T11:08:00Z',
        details: {
          projectName: 'DA IR Smoke Test ST0Y15A Stock/Push - 2025-02-28'
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'task_created',
        userId: 'TestUser1 - ST OEM',
        timestamp: '2025-02-28T11:08:00Z',
        details: {
          taskId: '1',
          taskName: 'Compliance Reqs: Chapter Reviews'
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'task_created',
        userId: 'TestUser1 - ST OEM',
        timestamp: '2025-02-28T11:08:00Z',
        details: {
          taskId: '2',
          taskName: 'Deliverable Reqs: Chapter Reviews'
        }
      }
    ]
  },
];

export const storage = {
  getCertifications(): CertificationRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS);
    if (!data) {
      this.saveCertifications(initialCertifications);
      return initialCertifications;
    }
    return JSON.parse(data);
  },

  saveCertifications(certifications: CertificationRequest[]) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(certifications));
    window.dispatchEvent(new Event('storage-updated'));
  },

  updateCertification(updatedCertification: CertificationRequest) {
    const certifications = this.getCertifications();
    const updatedCertifications = certifications.map(cert =>
      cert.id === updatedCertification.id ? updatedCertification : cert
    );
    this.saveCertifications(updatedCertifications);
  },

  addActivity(certificationId: string, type: ActivityType, userId: string, details: ActivityDetails) {
    const certifications = this.getCertifications();
    const certificationIndex = certifications.findIndex(cert => cert.id === certificationId);
    
    if (certificationIndex !== -1) {
      const certification = certifications[certificationIndex];
      const activity = createActivity(type, userId, details);
      
      certification.activities = certification.activities || [];
      certification.activities.unshift(activity); // Add to beginning of array
      
      certifications[certificationIndex] = certification;
      this.saveCertifications(certifications);
      
      return activity;
    }
    return null;
  },

  getWorkflows(): Workflow[] {
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    return data ? JSON.parse(data) : [];
  },

  saveWorkflows(workflows: Workflow[]) {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  },

  getDashboards(): Dashboard[] {
    const data = localStorage.getItem(STORAGE_KEYS.DASHBOARDS);
    return data ? JSON.parse(data) : [];
  },

  saveDashboards(dashboards: Dashboard[]) {
    localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(dashboards));
    window.dispatchEvent(new Event('dashboards-updated'));
  },

  getDevices(): Device[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
    return data ? JSON.parse(data) : [];
  },

  saveDevices(devices: Device[]) {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    window.dispatchEvent(new Event('devices-updated'));
  },

  updateDevice(updatedDevice: Device) {
    const devices = this.getDevices();
    const updatedDevices = devices.map(device =>
      device.id === updatedDevice.id ? updatedDevice : device
    );
    this.saveDevices(updatedDevices);
  },

  getTaskTestCases(): TaskTestCases {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_TEST_CASES);
    return data ? JSON.parse(data) : {};
  },

  saveTaskTestCases(taskTestCases: TaskTestCases) {
    localStorage.setItem(STORAGE_KEYS.TASK_TEST_CASES, JSON.stringify(taskTestCases));
    window.dispatchEvent(new Event('task-test-cases-updated'));
  },

  getTestCasesForTask(taskId: string): TestCase[] {
    const taskTestCases = this.getTaskTestCases();
    return taskTestCases[taskId] || [];
  },

  saveTestCasesForTask(taskId: string, testCases: TestCase[]) {
    const taskTestCases = this.getTaskTestCases();
    taskTestCases[taskId] = testCases;
    this.saveTaskTestCases(taskTestCases);
  },
};