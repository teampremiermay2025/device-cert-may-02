import { CertificationRequest, Workflow } from '../types';

const STORAGE_KEYS = {
  CERTIFICATIONS: 'certifications',
  WORKFLOWS: 'workflows',
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
        stage: 'PLANNING'
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
        stage: 'PLANNING'
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
        stage: 'PLANNING'
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
    projectName: 'Smoke Test: ST0919A',
    type: 'DA IR',
    status: 'PLANNING',
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
    // Dispatch a custom event to notify listeners
    window.dispatchEvent(new Event('storage-updated'));
  },

  getWorkflows(): Workflow[] {
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    return data ? JSON.parse(data) : [];
  },

  saveWorkflows(workflows: Workflow[]) {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  }
};