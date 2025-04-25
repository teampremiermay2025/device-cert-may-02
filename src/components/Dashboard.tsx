import { FC, useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, ChartBarIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CertificationCard } from './CertificationCard';
import { CertificationRequest, CertificationStage } from '../types';
import { ViewCertificationModal } from './ViewCertificationModal';
import { storage } from '../lib/storage';

interface DashboardProps {
  onNewCertification: () => void;
}

interface StatusCount {
  stage: CertificationStage;
  total: number;
  byType: {
    'DA IR': number;
    'DA MR': number;
    'DA EMR': number;
    'DA SMR': number;
  };
}

interface FilterState {
  status: CertificationStage | '';
  type: string;
  projectType: string;
}

const getStatusColor = (stage: CertificationStage): string => {
  const colors: Record<CertificationStage, string> = {
    'FORECAST': 'bg-purple-50 border-purple-200 hover:border-purple-300',
    'PLANNING': 'bg-blue-50 border-blue-200 hover:border-blue-300',
    'SUBMITTED': 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
    'SUBMISSION_REVIEW': 'bg-orange-50 border-orange-200 hover:border-orange-300',
    'DEVICE_ENTRY': 'bg-cyan-50 border-cyan-200 hover:border-cyan-300',
    'DEVICE_TESTING': 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
    'TAQ_REVIEW': 'bg-pink-50 border-pink-200 hover:border-pink-300',
    'TA_COMPLETE': 'bg-green-50 border-green-200 hover:border-green-300',
    'CLOSED': 'bg-gray-50 border-gray-200 hover:border-gray-300'
  };
  return colors[stage];
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'DA IR': return 'bg-blue-100 text-blue-700';
    case 'DA MR': return 'bg-green-100 text-green-700';
    case 'DA EMR': return 'bg-purple-100 text-purple-700';
    case 'DA SMR': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const Dashboard: FC<DashboardProps> = ({ onNewCertification }) => {
  const [certifications, setCertifications] = useState<CertificationRequest[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationRequest | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    type: '',
    projectType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusOverview, setShowStatusOverview] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
      setCertifications(storage.getCertifications());
    };

    window.addEventListener('storage-updated', handleStorageChange);
    handleStorageChange(); // Initial load

    return () => {
      window.removeEventListener('storage-updated', handleStorageChange);
    };
  }, []);

  const handleViewCertification = (cert: CertificationRequest) => {
    setSelectedCertification(cert);
  };

  const handleUpdateCertification = (updatedCert: CertificationRequest) => {
    const updatedCertifications = certifications.map(cert =>
      cert.id === updatedCert.id ? updatedCert : cert
    );
    storage.saveCertifications(updatedCertifications);
    setCertifications(updatedCertifications);
    setSelectedCertification(updatedCert);
  };

  const statusCounts: StatusCount[] = [
    { stage: 'FORECAST', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'PLANNING', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'SUBMITTED', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'SUBMISSION_REVIEW', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'DEVICE_ENTRY', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'DEVICE_TESTING', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'TAQ_REVIEW', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'TA_COMPLETE', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
    { stage: 'CLOSED', total: 0, byType: { 'DA IR': 0, 'DA MR': 0, 'DA EMR': 0, 'DA SMR': 0 } },
  ].map(status => {
    const certsInStatus = certifications.filter(cert => cert.status === status.stage);
    return {
      ...status,
      total: certsInStatus.length,
      byType: {
        'DA IR': certsInStatus.filter(cert => cert.type === 'DA IR').length,
        'DA MR': certsInStatus.filter(cert => cert.type === 'DA MR').length,
        'DA EMR': certsInStatus.filter(cert => cert.type === 'DA EMR').length,
        'DA SMR': certsInStatus.filter(cert => cert.type === 'DA SMR').length,
      }
    };
  });

  const filteredCertifications = certifications.filter(cert => {
    if (filters.status && cert.status !== filters.status) return false;
    if (filters.type && cert.type !== filters.type) return false;
    return true;
  });

  const types = Array.from(new Set(certifications.map(cert => cert.type)));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Certification Dashboard</h1>
          <p className="text-sm text-gray-500">Manage and track your device certification requests</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
            Filters
          </button>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out shadow-sm"
            onClick={onNewCertification}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Certification
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-8">
        <button
          onClick={() => setShowStatusOverview(!showStatusOverview)}
          className="w-full p-6 flex items-center justify-between border-b"
        >
          <div className="flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold">Status Overview</h2>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">
              Total Active: {certifications.length}
            </span>
            {showStatusOverview ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        
        {showStatusOverview && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusCounts.map(({ stage, total, byType }) => (
                <button
                  key={stage}
                  onClick={() => setFilters(f => ({ ...f, status: f.status === stage ? '' : stage }))}
                  className={`p-4 rounded-lg border transition-colors ${
                    filters.status === stage
                      ? 'ring-2 ring-blue-500 ring-opacity-50'
                      : ''
                  } ${getStatusColor(stage)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {stage.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </span>
                    <span className="text-2xl font-bold">{total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(byType).map(([type, count]) => (
                      count > 0 && (
                        <div
                          key={type}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${getTypeColor(type)}`}
                        >
                          <span className="text-xs font-medium">{type}</span>
                          <span className="text-xs font-bold">{count}</span>
                        </div>
                      )
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Filter Certifications</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as CertificationStage | '' }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All Statuses</option>
                {statusCounts.map(({ stage }) => (
                  <option key={stage} value={stage}>
                    {stage.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', type: '', projectType: '' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Certification Requests</h2>
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {filteredCertifications.length} Shown
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map((cert) => (
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
          onUpdate={handleUpdateCertification}
        />
      )}
    </div>
  );
};