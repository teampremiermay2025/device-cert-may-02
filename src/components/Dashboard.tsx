import { FC, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CertificationCard } from './CertificationCard';
import { CertificationRequest } from '../types';
import { ViewCertificationModal } from './ViewCertificationModal.tsx';

interface DashboardProps {
  onNewCertification: () => void;
}

const certifications: CertificationRequest[] = [
  {
    id: 'DARP-127205',
    projectName: 'Smoke Test: ST0919A',
    type: 'DA IR',
    status: 'PLANNING',
    lastUpdated: '2025-02-28',
    darpKey: 'DARP-127205',
    targetDate: '2025-03-28',
    softwareVersion: '1.0.0',
    tasks: [
      { id: 1, name: 'Compliance Reqs: Chapter Reviews', status: 'completed', isChecked: true },
      { id: 2, name: 'Deliverable Reqs: Chapter Reviews', status: 'pending', isChecked: false },
      { id: 3, name: 'Deliverable Reqs: PreAuth', status: 'pending', isChecked: false },
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
    tasks: [],
    issues: []
  },
  {
    id: 'DARP-127116',
    projectName: 'Smoke Test: ST0404A',
    type: 'DA SMR',
    status: 'TA COMPLETE',
    lastUpdated: '2025-02-27',
    darpKey: 'DARP-127116',
    targetDate: '2025-03-20',
    softwareVersion: '2.0.0',
    tasks: [],
    issues: []
  }
];

export const Dashboard: FC<DashboardProps> = ({ onNewCertification }) => {
  const [selectedCertification, setSelectedCertification] = useState<CertificationRequest | null>(null);

  const handleViewCertification = (cert: CertificationRequest) => {
    setSelectedCertification(cert);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Certification Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track your device certification requests</p>
        </div>
        <button 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out shadow-sm"
          onClick={onNewCertification}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Certification
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Certification Requests</h2>
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {certifications.length} Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <CertificationCard 
              key={cert.id} 
              certification={cert}
              onClick={() => handleViewCertification(cert)}
            />
          ))}
        </div>
      </div>

      {selectedCertification && (
        <ViewCertificationModal
          isOpen={!!selectedCertification}
          onClose={() => setSelectedCertification(null)}
          certification={selectedCertification}
        />
      )}
    </div>
  );
};