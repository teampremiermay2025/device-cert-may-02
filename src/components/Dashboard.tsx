import { FC, useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, Bars4Icon, TableCellsIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
}

interface FilterState {
  status: CertificationStage | '';
  types: string[];
  primaryPC: string;
  deviceModel: string;
  deviceType: string;
  releaseType: string;
  showActive: boolean;
  currentWeek: boolean;
  nextWeek: boolean;
  hideTest: boolean;
}

const initialFilterState: FilterState = {
  status: '',
  types: [],
  primaryPC: '',
  deviceModel: '',
  deviceType: '',
  releaseType: '',
  showActive: true,
  currentWeek: false,
  nextWeek: false,
  hideTest: false,
};

const statusOrder: CertificationStage[] = [
  'FORECAST',
  'PLANNING',
  'SUBMITTED',
  'SUBMISSION_REVIEW',
  'DEVICE_ENTRY',
  'DEVICE_TESTING',
  'TAQ_REVIEW',
  'TA_COMPLETE',
  'CLOSED'
];

const projectTypes = ['DA IR', 'DA MR', 'DA EMR', 'DA SMR'];
const deviceTypes = ['Handset', 'Tablet', 'Watch', 'Other'];

const getStatusColor = (status: CertificationStage): string => {
  const colors: Record<CertificationStage, string> = {
    'FORECAST': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    'PLANNING': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    'SUBMITTED': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    'SUBMISSION_REVIEW': 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    'DEVICE_ENTRY': 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    'DEVICE_TESTING': 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    'TAQ_REVIEW': 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    'TA_COMPLETE': 'bg-green-50 border-green-200 hover:bg-green-100',
    'CLOSED': 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };
  return colors[status];
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'DA IR': 'bg-blue-100 text-blue-800',
    'DA MR': 'bg-green-100 text-green-800',
    'DA EMR': 'bg-purple-100 text-purple-800',
    'DA SMR': 'bg-orange-100 text-orange-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const Dashboard: FC<DashboardProps> = ({ onNewCertification }) => {
  const [certifications, setCertifications] = useState<CertificationRequest[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationRequest | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [isStatusOverviewExpanded, setIsStatusOverviewExpanded] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
      setCertifications(storage.getCertifications());
    };

    window.addEventListener('storage-updated', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage-updated', handleStorageChange);
    };
  }, []);

  // Calculate status counts based on filtered certifications
  const getFilteredStatusCounts = (certs: CertificationRequest[]): StatusCount[] => {
    return statusOrder.map(stage => ({
      stage,
      total: certs.filter(cert => cert.status === stage).length,
    }));
  };

  const projectTypeCounts = projectTypes.map(type => ({
    type,
    count: certifications.filter(cert => cert.type === type).length
  }));

  const totalActive = certifications.filter(cert => cert.status !== 'CLOSED').length;

  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const selectAllTypes = () => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.length === projectTypes.length ? [] : [...projectTypes]
    }));
  };

  const filteredCertifications = certifications.filter(cert => {
    if (filters.status && cert.status !== filters.status) return false;
    if (filters.types.length > 0 && !filters.types.includes(cert.type)) return false;
    if (filters.hideTest && cert.projectName.toLowerCase().includes('test')) return false;
    if (filters.showActive && cert.status === 'CLOSED') return false;
    return true;
  });

  const statusCounts = getFilteredStatusCounts(filteredCertifications);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Certification Dashboard</h1>
          <p className="text-sm text-gray-500">Manage and track your device certification requests</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-lg border p-1">
            <button
              className={`p-2 rounded ${viewMode === 'card' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('card')}
            >
              <Bars4Icon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
          </div>
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

      {/* Project Type Filters */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <button
          onClick={selectAllTypes}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.types.length === projectTypes.length
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Types
        </button>
        {projectTypeCounts.map(({ type, count }) => (
          <button
            key={type}
            onClick={() => toggleTypeFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.types.includes(type)
                ? getTypeColor(type)
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type} ({count})
          </button>
        ))}
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
                {statusOrder.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Device Type</label>
              <select
                value={filters.deviceType}
                onChange={(e) => setFilters(f => ({ ...f, deviceType: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All Device Types</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showActive}
                onChange={(e) => setFilters(f => ({ ...f, showActive: e.target.checked }))}
                className="mr-2"
              />
              Show Active Only
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.currentWeek}
                onChange={(e) => setFilters(f => ({ ...f, currentWeek: e.target.checked }))}
                className="mr-2"
              />
              Current Week
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.nextWeek}
                onChange={(e) => setFilters(f => ({ ...f, nextWeek: e.target.checked }))}
                className="mr-2"
              />
              Next Week
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hideTest}
                onChange={(e) => setFilters(f => ({ ...f, hideTest: e.target.checked }))}
                className="mr-2"
              />
              Hide Test Devices
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters(initialFilterState)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Status Overview</h2>
              <span className="text-sm text-gray-500">
                {totalActive} Active Certifications
              </span>
            </div>
            <button
              onClick={() => setIsStatusOverviewExpanded(!isStatusOverviewExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronDownIcon
                className={`w-5 h-5 transform transition-transform ${
                  isStatusOverviewExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
          
          {isStatusOverviewExpanded && (
            <div className="grid grid-cols-3 gap-4">
              {statusCounts.map(({ stage, total }) => (
                <button
                  key={stage}
                  onClick={() => setFilters(f => ({ ...f, status: f.status === stage ? '' : stage }))}
                  className={`p-4 rounded-lg border transition-all ${
                    getStatusColor(stage)
                  } ${
                    filters.status === stage ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {stage.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </span>
                    <span className="text-2xl font-bold">{total}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Certification Requests</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {filteredCertifications.length} Shown
          </span>
        </div>

        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert) => (
              <CertificationCard 
                key={cert.id} 
                certification={cert}
                onClick={() => setSelectedCertification(cert)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Software Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertifications.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCertification(cert)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.darpKey}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.softwareVersion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.targetDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCertification && (
        <ViewCertificationModal
          isOpen={!!selectedCertification}
          onClose={() => setSelectedCertification(null)}
          certification={selectedCertification}
          onUpdate={(updated) => {
            const updatedCertifications = certifications.map(cert =>
              cert.id === updated.id ? updated : cert
            );
            storage.saveCertifications(updatedCertifications);
            setCertifications(updatedCertifications);
            setSelectedCertification(updated);
          }}
        />
      )}
    </div>
  );
};