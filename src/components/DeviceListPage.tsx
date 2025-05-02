import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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

// Custom cell renderer for the "Device Issue Key" column
const DeviceIssueKeyCellRenderer = (props: any) => {
  return (
    <div 
      className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
      onClick={(e) => {
        e.stopPropagation();
        alert('View Details functionality to be implemented');
      }}
    >
      {props.value || '-'}
    </div>
  );
};

// Custom cell renderer for the "Status" column
const StatusCellRenderer = (props: any) => {
  const statusClass = getStatusColor(props.value);
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>
      {props.value || '-'}
    </span>
  );
};

// Custom cell renderer for the "Priority" column
const PriorityCellRenderer = (props: any) => {
  const priorityClass = getPriorityColor(props.value);
  return (
    <span className={`font-semibold ${priorityClass}`}>
      {props.value || '-'}
    </span>
  );
};

// Custom cell renderer for the "Created Date" column
const DateCellRenderer = (props: any) => {
  return props.value ? (
    <span className="text-gray-700">
      {parseLocalDate(props.value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '-'}
    </span>
  ) : '-';
};

// Custom cell renderer for the "Actions" column
const ActionsCellRenderer = (props: any) => {
  return (
    <button
      className="text-blue-600 hover:text-blue-800 text-sm"
      onClick={(e) => {
        e.stopPropagation();
        alert('View Details functionality to be implemented');
      }}
    >
      View Details
    </button>
  );
};

// Color functions (moved outside the component to avoid redefinition)
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

export const DeviceListPage = () => {
  const [allDevices, setAllDevices] = useState<Device[]>(storage.getDevices());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridApi = useRef<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Define AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      field: 'Device Issue Key',
      headerName: 'Key',
      filter: 'agTextColumnFilter',
      cellRenderer: DeviceIssueKeyCellRenderer,
      cellClass: 'font-medium text-gray-900',
      minWidth: 150,
    },
    {
      field: 'Summary',
      headerName: 'Summary',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 200,
    },
    {
      field: 'Status',
      headerName: 'Status',
      filter: 'agSetColumnFilter',
      cellRenderer: StatusCellRenderer,
      cellClass: 'flex items-center',
      minWidth: 140,
    },
    {
      field: 'Comments',
      headerName: 'Comments',
      filter: 'agTextColumnFilter',
      cellClass: 'text-blue-600',
      minWidth: 200,
    },
    {
      field: 'Assignee',
      headerName: 'Assignee',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 150,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      filter: 'agSetColumnFilter',
      cellRenderer: PriorityCellRenderer,
      cellClass: 'flex items-center',
      minWidth: 120,
    },
    {
      field: 'Created Date',
      headerName: 'Created',
      filter: 'agDateColumnFilter',
      cellRenderer: DateCellRenderer,
      sort: 'desc',
      minWidth: 130,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      filter: false,
      sortable: false,
      cellRenderer: ActionsCellRenderer,
      minWidth: 120,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    cellClass: 'py-2',
  }), []);

  const gridTheme = useMemo(() => ({
    '--ag-font-family': 'Inter, system-ui, sans-serif',
    '--ag-font-size': '14px',
    '--ag-cell-horizontal-padding': '1rem',
    '--ag-header-column-separator-display': 'none',
    '--ag-header-foreground-color': '#1f2937',
    '--ag-header-background-color': '#f9fafb',
    '--ag-row-hover-color': 'rgb(243 244 246)',
    '--ag-selected-row-background-color': 'rgb(239 246 255)',
    '--ag-odd-row-background-color': '#ffffff',
    '--ag-row-border-color': 'rgb(243 244 246)',
    '--ag-border-color': 'rgb(229 231 235)',
    '--ag-secondary-border-color': 'rgb(229 231 235)',
    '--ag-header-column-resize-handle-color': 'rgb(229 231 235)',
    '--ag-range-selection-border-color': 'rgb(59 130 246)',
    '--ag-checkbox-checked-color': 'rgb(59 130 246)',
    '--ag-checkbox-unchecked-color': '#9ca3af',
    '--ag-row-height': '48px',
    '--ag-header-height': '48px',
    '--ag-list-item-height': '40px',
  }), []);

  const onGridReady = useCallback((params: any) => {
    gridApi.current = params.api;
    params.api.sizeColumnsToFit();
  }, []);

  // Handle global search
  const onFilterTextBoxChanged = useCallback(() => {
    if (gridApi.current) {
      gridApi.current.setQuickFilter(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    onFilterTextBoxChanged();
  }, [searchTerm, onFilterTextBoxChanged]);

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

        const headers = parseCSVRow(rows[0]);
        const requiredHeaders = ['Device Issue Key', 'Summary', 'Status', 'Comments', 'priority', 'Created Date'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          alert(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        const newDevices: Device[] = rows.slice(1).map(row => {
          const values = parseCSVRow(row);
          const device: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            device[header] = values[index] || '';
          });

          return {
            id: crypto.randomUUID(),
            "Device Issue Key": device["Device Issue Key"],
            Summary: device.Summary,
            Status: device.Status,
            Comments: device.Comments,
            Assignee: device.Assignee || '',
            priority: device.priority,
            "Created Date": device["Created Date"],
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
            ...device,
          };
        });

        const existingDevices = storage.getDevices();
        const updatedDevices = [...existingDevices, ...newDevices];
        storage.saveDevices(updatedDevices);

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

      {/* AG Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div 
          className="ag-theme-alpine w-full"
          style={{ 
            height: 'calc(100vh - 300px)',
            ...gridTheme
          }}
        >
          <AgGridReact
            rowData={allDevices}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            rowSelection="multiple"
            enableRangeSelection={true}
            copyHeadersToClipboard={true}
            rowGroupPanelShow="always"
            groupDisplayType="multipleColumns"
            animateRows={true}
            suppressRowClickSelection={true}
            suppressCellFocus={true}
            sideBar={{
              toolPanels: [
                {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
                },
                {
                  id: 'filters',
                  labelDefault: 'Filters',
                  labelKey: 'filters',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
                },
              ],
              defaultToolPanel: 'columns',
            }}
          />
        </div>
      </div>
    </div>
  );
};