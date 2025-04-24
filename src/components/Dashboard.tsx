import { FC, useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CertificationCard } from './CertificationCard';
import { CertificationRequest } from '../types';
import { ViewCertificationModal } from './ViewCertificationModal';
import { storage } from '../lib/storage';

interface DashboardProps {
  onNewCertification: () => void;
}

export const Dashboard: FC<DashboardProps> = ({ onNewCertification }) => {
  const [certifications, setCertifications] = useState<CertificationRequest[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationRequest | null>(null);

  // Listen for storage changes
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
          onUpdate={handleUpdateCertification}
        />
      )}
    </div>
  );
};