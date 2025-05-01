import { useState, useMemo, useRef, useEffect } from 'react';
import { storage } from '../lib/storage';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';

// Define the Device type based on devices.json (using exact keys)
interface Device {
  id: string;
  "Device Issue Key": string; // Key
  Summary: string; // Summary
  Status: string; // Status
  Comments: string; // Comments
  Assignee?: string; // Assignee (optional)
  priority: string; // Priority (lowercase in devices.json)
  "Created Date": string; // Created
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
  [key: string]: any; // Allow additional attributes from CSV
}

// Define table columns based on the screenshot (using exact keys from devices.json)
const COLUMNS = [
  { key: 'Device Issue Key', label: 'Key', sortable: true },
  { key: 'Summary', label: 'Summary', sortable: true },
  { key: 'Status', label: 'Status', sortable: true },
  { key: 'Comments', label: 'Comments', sortable: false },
  { key: 'Assignee', label: 'Assignee', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'Created Date', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

// Utility function to parse "YYYY-MM-DD" as a local date
const parseLocalDate = (dateString: string): Date | null => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      console.warn(`Invalid date string: ${dateString}`);
      return null;
    }
    // Months in JavaScript are 0-based, so subtract 1 from the month
    return new Date(year, month - 1, day);
  } catch (error) {
    console.warn(`Error parsing date string "${dateString}":`, error);
    return null;
  }
};

// Utility function to parse CSV rows (handles quoted fields with commas)
const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  // Add the last field
  result.push(currentField.trim());
  return result;
};

export const DeviceListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allDevices, setAllDevices] = useState<Device[]>(storage.getDevices());

  // Listen for 'devices-updated' event to refresh the device list
  useEffect(() => {
    const handleDevicesUpdated = () => {
      try {
        const devices = storage.getDevices();
        setAllDevices(devices);
      } catch (error) {
        console.error('Error fetching devices on update:', error);
      }
    };

    window.addEventListener('devices-updated', handleDevicesUpdated);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('devices-updated', handleDevicesUpdated);
    };
  }, []);

  // Filter and sort devices
  const filteredDevices = useMemo(() => {
    let devices = [...allDevices];

    // Apply search
    if (searchTerm) {
      devices = devices.filter(device =>
        (device["Device Issue Key"] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.Summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.Assignee || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig) {
      devices.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';

        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return devices;
  }, [allDevices, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle bulk import
  const handleBulkImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);
        if (rows.length === 0) return;

        // Parse CSV headers
        const headers = parseCSVRow(rows[0]);
        const requiredHeaders = ['Device Issue Key', 'Summary', 'Status', 'Comments', 'priority', 'Created Date'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          alert(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        // Parse CSV rows into device objects
        const newDevices: Device[] = rows.slice(1).map(row => {
          const values = parseCSVRow(row);
          const device: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            device[header] = values[index] || '';
          });

          // Use the exact keys from devices.json
          return {
            id: crypto.randomUUID(), // Generate a unique ID
            "Device Issue Key": device["Device Issue Key"],
            Summary: device.Summary,
            Status: device.Status,
            Comments: device.Comments,
            Assignee: device.Assignee || '',
            priority: device.priority,
            "Created Date": device["Created Date"],
            // Include additional attributes from CSV
            "Device Vendor": device["Device Vendor"] || '',
            "Device Type": device["Device Type"] || '',
            "Device Model": device["Device Model"] || '',
            "Device Marketing Name": device["Device Marketing Name"] || '',
            "Device Code Name": device["Device Code Name"] || '',
            "Device OS": device["Device OS"] || '',
            "Device OS Version": device["Device OS Version"] || '',
            "Device Hardware Version": device["Device Hardware Version"] || '',
            "Device Payment Type": device["Device Payment Type"] || '',
            "Device Channel": device["Device Channel"] || '',
            Type: device.Type || '',
            ...device, // Preserve any additional fields
          };
        });

        // Update localStorage
        const existingDevices = storage.getDevices();
        const updatedDevices = [...existingDevices, ...newDevices];
        storage.saveDevices(updatedDevices);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error during bulk import:', error);
        alert('An error occurred during the bulk import. Please check the CSV file and try again.');
      }
    };
    reader.onerror = () => {
      console.error('Error reading CSV file');
      alert('Failed to read the CSV file. Please ensure it is valid and try again.');
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PLANNING': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'DONE': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'High': 'text-red-600',
      'Medium': 'text-orange-600',
      'Low': 'text-green-600',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="p-8 bg-gradient-to-tr from-blue-50 to-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow mb-1">Device List</h1>
        <p className="text-base text-blue-600">View and manage device inventory</p>
      </div>

      {/* Search and Action Buttons */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            onClick={() => alert('Create New Device functionality to be implemented')}
          >
            + Create New
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
            onClick={handleBulkImport}
          >
            Bulk Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {COLUMNS.map(column => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider ${column.sortable ? 'cursor-pointer select-none hover:text-blue-900' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && <ChevronUpDownIcon className="w-4 h-4 inline-block align-middle" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredDevices.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center text-blue-300 py-8 text-lg italic">No devices found.</td>
              </tr>
            )}
            {filteredDevices.map(device => (
              <tr
                key={device.id}
                className="hover:bg-blue-50 transition cursor-pointer"
                onClick={() => alert('View Details functionality to be implemented')}
              >
                <td className="px-6 py-3 font-semibold text-blue-900">{device["Device Issue Key"] || '-'}</td>
                <td className="px-6 py-3 text-sm text-gray-700 truncate max-w-xs">{device.Summary || '-'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(device.Status)}`}>
                    {device.Status || '-'}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-blue-600">{device.Comments || '-'}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{device.Assignee || '-'}</td>
                <td className="px-6 py-3">
                  <span className={`font-semibold ${getPriorityColor(device.priority)}`}>
                    {device.priority || '-'}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs text-gray-600">
                  {device["Created Date"]
                    ? parseLocalDate(device["Created Date"])?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '-'
                    : '-'}
                </td>
                <td className="px-6 py-3 text-sm text-blue-600">View Details</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};