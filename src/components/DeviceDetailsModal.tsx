import React, { FC } from 'react';
import { Dialog } from '@headlessui/react';
import { Device } from './DevicesView';

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

export const DeviceDetailsModal: FC<DeviceDetailsModalProps> = ({
  isOpen,
  onClose,
  device,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[50]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-2xl backdrop-blur-md bg-opacity-90 p-6 max-h-[80vh] overflow-y-auto border border-gray-200/50">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              {device.name}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* 3D Model Placeholder */}
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-600 text-sm">3D Model Placeholder</span>
          </div>

          {/* Release Hierarchy */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Release Hierarchy</h3>
            {device.releaseHierarchy.map((release, idx) => (
              <p key={idx} className="text-sm text-gray-700">
                - {release.name}: {release.status}
                {release.status.includes('In Progress') && (
                  <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                    In Track
                  </span>
                )}
              </p>
            ))}
          </div>

          {/* Device Details */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600"><span className="font-medium">Vendor:</span> {device.vendor}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {device.type}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Model:</span> {device.model}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Code Name:</span> {device.codeName}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">OS:</span> {device.os}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">OS Version:</span> {device.osVersion}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Hardware Version:</span> {device.hardwareVersion}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Payment Type:</span> {device.paymentType}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Channel:</span> {device.channel}</p>
          </div>

          {/* Audit History */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit History</h3>
            {device.auditHistory.map((entry, idx) => (
              <p key={idx} className="text-sm text-gray-600">- {entry}</p>
            ))}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};