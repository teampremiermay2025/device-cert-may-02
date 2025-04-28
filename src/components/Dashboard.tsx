import { FC, useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, Bars4Icon, TableCellsIcon } from '@heroicons/react/24/outline';
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
  type: '',
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

export const Dashboard: FC<DashboardProps> = ({ onNewCertification }) => {
  const [certifications, setCertifications] = useState<CertificationRequest[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationRequest | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);

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

  const statusCounts = statusOrder.map(stage => ({
    stage,
    total: certifications.filter(cert => cert.status === stage).length,
    byType: {
      'DA IR': certifications.filter(cert => cert.status === stage && cert.type === 'DA IR').length,
      'DA MR': certifications.filter(cert => cert.status === stage && cert.type === 'DA MR').length,
      'DA EMR': certifications.filter(cert => cert.status === stage && cert.type === 'DA EMR').length,
      'DA SMR': certifications.filter(cert => cert.status === stage && cert.type === 'DA SMR').length,
    }
  }));

  const filteredCertifications = certifications.filter(cert => {
    if (filters.status && cert.status !== filters.status) return false;
    if (filters.type && cert.type !== filters.type) return false;
    if (filters.hideTest && cert.projectName.toLowerCase().includes('test')) return false;
    if (filters.showActive && cert.status === 'CLOSED') return false;
    return true;
  });

  const gridColumns = [
    { key: 'darpKey', label: 'Key' },
    { key: 'projectName', label: 'Summary' },
    { key: 'type', label: 'Project Type' },
    { key: 'status', label: 'Status' },
    { key: 'softwareVersion', label: 'Software Version' },
    { key: 'targetDate', label: 'Target Date' },
  ];

  const handleCellEdit = (certId: string, field: string, value: string) => {
    const updatedCertifications = certifications.map(cert => {
      if (cert.id === certId) {
        return { ...cert, [field]: value };
      }
      return cert;
    });
    storage.saveCertifications(updatedCertifications);
    setCertifications(updatedCertifications);
    setEditingCell(null);
  };

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
              <label className="block text-sm text-gray-700 mb-1">Project Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
          <h2 className="text-lg font-semibold mb-4">Status Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            {statusCounts.map(({ stage, total, byType }) => (
              <button
                key={stage}
                onClick={() => setFilters(f => ({ ...f, status: f.status === stage ? '' : stage }))}
                className={`p-4 rounded-lg border transition-colors ${
                  filters.status === stage ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {stage.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </span>
                  <span className="text-2xl font-bold">{total}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(byType).map(([type, count]) => (
                    count > 0 && (
                      <div key={type} className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded">
                        <span className="text-sm">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  ))}
                </div>
              </button>
            ))}
          </div>
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
                  {gridColumns.map(column => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertifications.map((cert, rowIndex) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCertification(cert)}
                  >
                    {gridColumns.map(column => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({ row: rowIndex, col: column.key });
                        }}
                      >
                        {editingCell?.row === rowIndex && editingCell?.col === column.key ? (
                          <input
                            type="text"
                            value={cert[column.key as keyof CertificationRequest] as string}
                            onChange={(e) => handleCellEdit(cert.id, column.key, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="w-full border rounded px-2 py-1"
                            autoFocus
                          />
                        ) : (
                          cert[column.key as keyof CertificationRequest]
                        )}
                      </td>
                    ))}
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