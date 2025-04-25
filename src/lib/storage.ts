import { CertificationRequest, Workflow, Dashboard } from '../types';

const STORAGE_KEYS = {
  CERTIFICATIONS: 'certifications',
  WORKFLOWS: 'workflows',
  DASHBOARDS: 'dashboards',
} as const;

const initialCertifications: CertificationRequest[] = [
  {
    id: 'DARP-127205',
    projectName: 'Smoke Test: ST0919A',
    type: 'DA IR',
    status: 'PLANNING',
    lastUpdated: '2025-02-28',
    darpKey: 'DARP-127205',
    targetDate: '2025-03-28',
    softwareVersion: '1.0.0',
    workflow: 'default-workflow',
    tasks: [
      { 
        id: '1',
        name: 'Compliance Reqs: Chapter Reviews',
        status: 'DONE',
        isChecked: true,
        priority: 'HIGH',
        attachments: [],
        comments: [],
        labels: ['compliance'],
        stage: 'PLANNING',
        description: 'Review all compliance requirements chapters',
        timeSpent: 120
      },
      { 
        id: '2',
        name: 'Deliverable Reqs: Chapter Reviews',
        status: 'IN_PROGRESS',
        isChecked: false,
        priority: 'MEDIUM',
        attachments: [],
        comments: [],
        labels: ['deliverable'],
        stage: 'PLANNING',
        description: 'Review deliverable requirements chapters',
        timeSpent: 60
      },
      { 
        id: '3',
        name: 'Deliverable Reqs: PreAuth',
        status: 'TODO',
        isChecked: false,
        priority: 'HIGH',
        attachments: [],
        comments: [],
        labels: ['deliverable', 'auth'],
        stage: 'PLANNING',
        description: 'Complete pre-authorization requirements',
        timeSpent: 0
      }
    ],
    issues: [
      {
        title: 'Missing Document - Certification Specs',
        description: 'Required certification specifications document is not uploaded',
        type: 'warning'
      }
    ]
  },
  {
    id: 'DARP-127130',
    projectName: 'Smoke Test: ST0919B',
    type: 'DA MR',
    status: 'DEVICE_TESTING',
    lastUpdated: '2025-02-28',
    darpKey: 'DARP-127130',
    targetDate: '2025-03-15',
    softwareVersion: '1.1.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127116',
    projectName: 'Smoke Test: ST0404A',
    type: 'DA SMR',
    status: 'TA_COMPLETE',
    lastUpdated: '2025-02-27',
    darpKey: 'DARP-127116',
    targetDate: '2025-03-20',
    softwareVersion: '2.0.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127301',
    projectName: 'Performance Test: PT0501A',
    type: 'DA EMR',
    status: 'SUBMITTED',
    lastUpdated: '2025-02-29',
    darpKey: 'DARP-127301',
    targetDate: '2025-04-15',
    softwareVersion: '3.0.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127302',
    projectName: 'Security Test: ST0601B',
    type: 'DA IR',
    status: 'DEVICE_TESTING',
    lastUpdated: '2025-02-29',
    darpKey: 'DARP-127302',
    targetDate: '2025-04-20',
    softwareVersion: '2.1.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127303',
    projectName: 'Integration Test: IT0701C',
    type: 'DA MR',
    status: 'PLANNING',
    lastUpdated: '2025-02-29',
    darpKey: 'DARP-127303',
    targetDate: '2025-04-25',
    softwareVersion: '1.5.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127304',
    projectName: 'Load Test: LT0801D',
    type: 'DA SMR',
    status: 'SUBMISSION_REVIEW',
    lastUpdated: '2025-02-29',
    darpKey: 'DARP-127304',
    targetDate: '2025-04-30',
    softwareVersion: '2.2.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127305',
    projectName: 'Stress Test: ST0901E',
    type: 'DA EMR',
    status: 'DEVICE_ENTRY',
    lastUpdated: '2025-02-29',
    darpKey: 'DARP-127305',
    targetDate: '2025-05-05',
    softwareVersion: '1.8.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127306',
    projectName: 'Compatibility Test: CT1001F',
    type: 'DA IR',
    status: 'TAQ_REVIEW',
    lastUpdated: '2025-02-29',
    darpKey: 'DARP-127306',
    targetDate: '2025-05-10',
    softwareVersion: '2.3.0',
    workflow: 'default-workflow',
    tasks: [],
    issues: []
  }
];

const defaultDashboards: Dashboard[] = [
  {
    id: 'main-dashboard',
    title: 'Main Dashboard',
    description: 'Device Certification Dashboard',
    type: 'default',
    sharedWith: [],
    layout: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'waiver-dashboard',
    title: 'Waiver Request',
    description: 'Manage waiver requests and approvals',
    type: 'default',
    sharedWith: [],
    layout: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'device-list',
    title: 'Device List Dashboard',
    description: 'View and manage device inventory',
    type: 'default',
    sharedWith: [],
    layout: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'device-schedule',
    title: 'Device Schedule Dashboard',
    description: 'Track device certification schedules',
    type: 'default',
    sharedWith: [],
    layout: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
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

  getWorkflows(): Workflow[] {
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    return data ? JSON.parse(data) : [];
  },

  saveWorkflows(workflows: Workflow[]) {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  },

  getDashboards(): Dashboard[] {
    const data = localStorage.getItem(STORAGE_KEYS.DASHBOARDS);
    if (!data) {
      this.saveDashboards(defaultDashboards);
      return defaultDashboards;
    }
    return JSON.parse(data);
  },

  saveDashboards(dashboards: Dashboard[]) {
    localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(dashboards));
    window.dispatchEvent(new Event('dashboards-updated'));
  }
};