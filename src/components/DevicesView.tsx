import React, { FC, useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, TvIcon, ClockIcon, LightBulbIcon, LockClosedIcon, HeartIcon, CloudIcon, SpeakerWaveIcon, Bars4Icon, TableCellsIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { DeviceDetailsModal } from './DeviceDetailsModal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { GridApi, ColumnApi } from 'ag-grid-community';

interface Device {
  id: string;
  name: string;
  vendor: string;
  type: string;
  model: string;
  codeName: string;
  os: string;
  osVersion: string;
  hardwareVersion: string;
  paymentType: string;
  channel: string;
  releaseHierarchy: { name: string; status: string }[];
  auditHistory: string[];
  image: string;
}

const devicesData: { nonIot: Device[]; iot: Device[] } = {
  nonIot: [
    // Apple Devices
    { id: 'DARP-1', name: 'DARP 1', vendor: 'Apple', type: 'Smartphone', model: 'iPhone 16', codeName: 'Code-iPhone-16', os: 'iOS', osVersion: '18.0', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Retail', image: "./public/assets/iPhone16Pro.png", releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/15/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/15/2025: Initial release completed successfully'] },
    { id: 'DARP-123', name: 'DARP 123', vendor: 'Apple', type: 'Laptop', model: 'MacBook Pro 2025', codeName: 'Code-MacBook-Pro-2025', os: 'macOS', osVersion: '15.0', hardwareVersion: '2.0', paymentType: 'Pre-Paid', channel: 'Online', image: './public/assets/mac.png',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/20/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/20/2025: Initial release completed successfully'] },
    { id: 'DARP-124', name: 'DARP 124', vendor: 'Apple', type: 'Smartwatch', model: 'Apple Watch Series 10', codeName: 'Code-Apple-Watch-10', os: 'watchOS', osVersion: '11.0', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Retail',image: './apple-log.svg', releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/22/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/22/2025: Initial release completed successfully'] },
    { id: 'DARP-125', name: 'DARP 125', vendor: 'Apple', type: 'Tablet', model: 'iPad Pro 2025', codeName: 'Code-iPad-Pro-2025', os: 'iPadOS', osVersion: '18.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Online', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/25/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/25/2025: Initial release completed successfully'] },
    // Samsung Devices
    { id: 'DARP-30', name: 'DARP 30', vendor: 'Samsung', type: 'Smartphone', model: 'Galaxy S25', codeName: 'Code-Galaxy-S25', os: 'Android', osVersion: '15.0', hardwareVersion: '1.1', paymentType: 'Post-Paid', channel: 'Retail', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/25/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/25/2025: Initial release completed successfully'] },
    { id: 'DARP-32', name: 'DARP 32', vendor: 'Samsung', type: 'Tablet', model: 'Galaxy Tab S9', codeName: 'Code-Galaxy-Tab-S9', os: 'Android', osVersion: '15.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Online', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/25/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/25/2025: Initial release completed successfully'] },
    { id: 'DARP-33', name: 'DARP 33', vendor: 'Samsung', type: 'Smartwatch', model: 'Galaxy Watch 7', codeName: 'Code-Galaxy-Watch-7', os: 'Wear OS', osVersion: '5.0', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Retail', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/26/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/26/2025: Initial release completed successfully'] },
    { id: 'DARP-34', name: 'DARP 34', vendor: 'Samsung', type: 'Smart TV', model: 'QLED 2025', codeName: 'Code-QLED-2025', os: 'Tizen', osVersion: '7.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Online', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/27/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/27/2025: Initial release completed successfully'] },
    // Google Devices
    { id: 'DARP-40', name: 'DARP 40', vendor: 'Google', type: 'Smartphone', model: 'Pixel 9', codeName: 'Code-Pixel-9', os: 'Android', osVersion: '15.0', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Retail', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/28/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/28/2025: Initial release completed successfully'] },
    { id: 'DARP-41', name: 'DARP 41', vendor: 'Google', type: 'Tablet', model: 'Pixel Tablet 2', codeName: 'Code-Pixel-Tablet-2', os: 'Android', osVersion: '15.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Online',image: './apple-log.svg', releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/29/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/29/2025: Initial release completed successfully'] },
    { id: 'DARP-42', name: 'DARP 42', vendor: 'Google', type: 'Smartwatch', model: 'Pixel Watch 3', codeName: 'Code-Pixel-Watch-3', os: 'Wear OS', osVersion: '5.0', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Retail',image: './apple-log.svg', releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/30/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/30/2025: Initial release completed successfully'] },
    { id: 'DARP-43', name: 'DARP 43', vendor: 'Google', type: 'Smart Speaker', model: 'Nest Audio 2', codeName: 'Code-Nest-Audio-2', os: 'Google Assistant', osVersion: '2.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Online',image: './apple-log.svg', releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/30/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/30/2025: Initial release completed successfully'] },
  ],
  iot: [
    // IoT-HomeTech Devices
    { id: 'IOT-100', name: 'IOT 100', vendor: 'IoT-HomeTech', type: 'Smart Thermostat', model: 'IoT-Thermostat-5000', codeName: 'Code-IoT-Thermostat-5000', os: 'Zepfix', osVersion: '3.1', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Stock', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/10/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/10/2025: Initial release completed successfully'] },
    { id: 'IOT-101', name: 'IOT 101', vendor: 'IoT-HomeTech', type: 'Smart Water Sensor', model: 'IoT-WaterSense-3000', codeName: 'Code-IoT-WaterSense-3000', os: 'Zepfix', osVersion: '3.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Retail', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/12/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/12/2025: Initial release completed successfully'] },
    { id: 'IOT-102', name: 'IOT 102', vendor: 'IoT-HomeTech', type: 'Smart Lock', model: 'IoT-Lock-7000', codeName: 'Code-IoT-Lock-7000', os: 'Zepfix', osVersion: '3.2', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Online', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/14/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/14/2025: Initial release completed successfully'] },
    { id: 'IOT-103', name: 'IOT 103', vendor: 'IoT-HomeTech', type: 'Smart Light Bulb', model: 'IoT-Light-4000', codeName: 'Code-IoT-Light-4000', os: 'Zepfix', osVersion: '3.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Retail', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/16/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/16/2025: Initial release completed successfully'] },
    // SmartCityCorp Devices
    { id: 'IOT-200', name: 'IOT 200', vendor: 'SmartCityCorp', type: 'Smart Traffic Light', model: 'CityLight-4000', codeName: 'Code-CityLight-4000', os: 'CityOS', osVersion: '2.5', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Municipal',image: './apple-log.svg', releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/15/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/15/2025: Initial release completed successfully'] },
    { id: 'IOT-201', name: 'IOT 201', vendor: 'SmartCityCorp', type: 'Smart Parking Sensor', model: 'ParkSense-2000', codeName: 'Code-ParkSense-2000', os: 'CityOS', osVersion: '2.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Municipal',image: './apple-log.svg', releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/18/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/18/2025: Initial release completed successfully'] },
    { id: 'IOT-202', name: 'IOT 202', vendor: 'SmartCityCorp', type: 'Air Quality Monitor', model: 'CityAir-3000', codeName: 'Code-CityAir-3000', os: 'CityOS', osVersion: '2.1', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Municipal', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/20/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/20/2025: Initial release completed successfully'] },
    { id: 'IOT-203', name: 'IOT 203', vendor: 'SmartCityCorp', type: 'Smart Water Meter', model: 'WaterFlow-5000', codeName: 'Code-WaterFlow-5000', os: 'CityOS', osVersion: '2.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Municipal', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/22/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/22/2025: Initial release completed successfully'] },
    // HealthTechIoT Devices
    { id: 'IOT-300', name: 'IOT 300', vendor: 'HealthTechIoT', type: 'Smart Heart Monitor', model: 'HeartBeat-6000', codeName: 'Code-HeartBeat-6000', os: 'HealthOS', osVersion: '1.5', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Healthcare', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/20/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/20/2025: Initial release completed successfully'] },
    { id: 'IOT-301', name: 'IOT 301', vendor: 'HealthTechIoT', type: 'Smart Insulin Pump', model: 'InsulinFlow-1000', codeName: 'Code-InsulinFlow-1000', os: 'HealthOS', osVersion: '1.0', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Healthcare', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/22/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/22/2025: Initial release completed successfully'] },
    { id: 'IOT-302', name: 'IOT 302', vendor: 'HealthTechIoT', type: 'Smart Thermometer', model: 'TempTrack-2000', codeName: 'Code-TempTrack-2000', os: 'HealthOS', osVersion: '1.1', hardwareVersion: '1.0', paymentType: 'Post-Paid', channel: 'Healthcare', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/24/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/24/2025: Initial release completed successfully'] },
    { id: 'IOT-303', name: 'IOT 303', vendor: 'HealthTechIoT', type: 'Smart Fitness Tracker', model: 'FitPulse-8000', codeName: 'Code-FitPulse-8000', os: 'HealthOS', osVersion: '1.5', hardwareVersion: '1.0', paymentType: 'Pre-Paid', channel: 'Healthcare', image: './apple-log.svg',releaseHierarchy: [{ name: 'DA-IR: Initial Release', status: 'Successful on 4/26/2025' }, { name: 'Current Maintenance Release', status: 'In Progress' }], auditHistory: ['4/26/2025: Initial release completed successfully'] },
  ],
};

// Map device types to icons
const deviceIcons: Record<string, JSX.Element> = {
  Smartphone: <DevicePhoneMobileIcon className="w-10 h-10 text-blue-500" />,
  Laptop: <ComputerDesktopIcon className="w-10 h-10 text-blue-500" />,
  Smartwatch: <ClockIcon className="w-10 h-10 text-blue-500" />,
  Tablet: <DevicePhoneMobileIcon className="w-10 h-10 text-blue-500" />,
  'Smart TV': <TvIcon className="w-10 h-10 text-blue-500" />,
  'Smart Speaker': <SpeakerWaveIcon className="w-10 h-10 text-blue-500" />,
  'Smart Thermostat': <CloudIcon className="w-10 h-10 text-blue-500" />,
  'Smart Water Sensor': <CloudIcon className="w-10 h-10 text-blue-500" />,
  'Smart Lock': <LockClosedIcon className="w-10 h-10 text-blue-500" />,
  'Smart Light Bulb': <LightBulbIcon className="w-10 h-10 text-blue-500" />,
  'Smart Traffic Light': <CloudIcon className="w-10 h-10 text-blue-500" />,
  'Smart Parking Sensor': <CloudIcon className="w-10 h-10 text-blue-500" />,
  'Air Quality Monitor': <CloudIcon className="w-10 h-10 text-blue-500" />,
  'Smart Water Meter': <CloudIcon className="w-10 h-10 text-blue-500" />,
  'Smart Heart Monitor': <HeartIcon className="w-10 h-10 text-blue-500" />,
  'Smart Insulin Pump': <HeartIcon className="w-10 h-10 text-blue-500" />,
  'Smart Thermometer': <HeartIcon className="w-10 h-10 text-blue-500" />,
  'Smart Fitness Tracker': <HeartIcon className="w-10 h-10 text-blue-500" />,
};

// Map OEMs to their specific images
const oemImages: Record<string, string> = {
  Apple: '/assets/apple-oem-logo.svg',
  Samsung: '/assets/samsung-oem-logo.svg',
  Google: '/assets/google-oem-logo.svg',
  'IoT-HomeTech': '/assets/iot-hometech-oem-logo.svg',
  SmartCityCorp: '/assets/smartcitycorp-oem-logo.svg',
  HealthTechIoT: '/assets/healthtechiot-oem-logo.svg',
};

// Ag-Grid cell renderer for device name (clickable to open modal)
const DeviceNameCellRenderer = (props: any) => {
  return (
    <div
      className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
      onClick={() => props.context.setSelectedDevice(props.data)}
    >
      {props.value}
    </div>
  );
};

export const DevicesView: FC = () => {
  const [viewType, setViewType] = useState<'nonIot' | 'iot'>('nonIot');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<{ nonIot: Device[]; iot: Device[] }>(devicesData);
  const [filterOEM, setFilterOEM] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOems, setExpandedOems] = useState<Record<string, boolean>>({});

  // Toggle expand/collapse for an OEM section
  const toggleOemSection = (oem: string) => {
    setExpandedOems(prev => ({
      ...prev,
      [oem]: !prev[oem],
    }));
  };

  // Get unique OEMs for the filter based on viewType
  const oems = useMemo(() => {
    const vendors = viewType === 'nonIot'
      ? devices.nonIot.map(device => device.vendor)
      : devices.iot.map(device => device.vendor);
    return ['All', ...new Set(vendors)];
  }, [viewType, devices]);

  // Filter devices based on search term and OEM filter
  const filteredDevices = useMemo(() => {
    let filtered = devices[viewType];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply OEM filter
    if (filterOEM !== 'All') {
      filtered = filtered.filter(device => device.vendor === filterOEM);
    }

    return filtered;
  }, [devices, viewType, searchTerm, filterOEM]);

  // Group devices by OEM for the current view type
  const groupedDevices = useMemo(() => {
    return filteredDevices.reduce((acc, device) => {
      if (!acc[device.vendor]) acc[device.vendor] = [];
      acc[device.vendor].push(device);
      return acc;
    }, {} as Record<string, Device[]>);
  }, [filteredDevices]);

  // Handle drag-and-drop within the same OEM
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Ensure the drag is within the same OEM group
    if (source.droppableId !== destination.droppableId) return;

    const oem = source.droppableId;
    const newDevices = [...devices[viewType]];
    const oemDevices = newDevices.filter(device => device.vendor === oem);
    const otherDevices = newDevices.filter(device => device.vendor !== oem);

    const [movedDevice] = oemDevices.splice(source.index, 1);
    oemDevices.splice(destination.index, 0, movedDevice);

    setDevices({
      ...devices,
      [viewType]: [...otherDevices, ...oemDevices].sort((a, b) => a.vendor.localeCompare(b.vendor)),
    });
  };

  // Ag-Grid setup
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
    '--ag-font-family': 'Arial, sans-serif',
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
    '--ag-header-height': '52px',
    '--ag-list-item-height': '40px',
    '--ag-floating-filters-height': '40px',
  }), []);

  const columnDefs = useMemo(() => [
    {
      field: 'name',
      headerName: 'Device Name',
      filter: 'agTextColumnFilter',
      cellRenderer: DeviceNameCellRenderer,
      cellClass: 'font-medium text-gray-900',
      minWidth: 150,
      editable: false, // Name opens modal, so not editable directly
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      filter: 'agSetColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 150,
      editable: true, // Allow editing
    },
    {
      field: 'type',
      headerName: 'Type',
      filter: 'agSetColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 120,
      editable: true, // Allow editing
    },
    {
      field: 'model',
      headerName: 'Model',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 150,
      editable: true, // Allow editing
    },
    {
      field: 'codeName',
      headerName: 'Code Name',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 150,
      editable: true, // Allow editing
    },
    {
      field: 'os',
      headerName: 'OS',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 120,
      editable: true, // Allow editing
    },
    {
      field: 'osVersion',
      headerName: 'OS Version',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 120,
      editable: true, // Allow editing
    },
    {
      field: 'hardwareVersion',
      headerName: 'Hardware Version',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 150,
      editable: true, // Allow editing
    },
  ], []);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
    setTimeout(() => {
      if (params.columnApi && typeof params.columnApi.getAllColumns === 'function') {
        const allColumnIds = params.columnApi.getAllColumns().map((col: any) => col.getColId());
        params.columnApi.autoSizeColumns(allColumnIds, false);
      }
    }, 100);
  }, []);

  const onRowDoubleClicked = useCallback((event: any) => {
    // Start editing on double-click
    if (gridApi) {
      gridApi.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: 'vendor', // Start editing the first editable column
      });
    }
  }, [gridApi]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Dashboard</h1>
          <p className="text-sm text-gray-500">Browse and manage devices by category</p>
        </div>
      </div>

      {/* Toggle between Non-IoT and IoT */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white rounded-full shadow-md p-1 border border-gray-200 backdrop-blur-md">
          <button
            onClick={() => {
              setViewType('nonIot');
              setFilterOEM('All'); // Reset filter when switching view type
              setSearchTerm(''); // Reset search term
            }}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              viewType === 'nonIot'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Non-IoT
          </button>
          <button
            onClick={() => {
              setViewType('iot');
              setFilterOEM('All'); // Reset filter when switching view type
              setSearchTerm(''); // Reset search term
            }}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              viewType === 'iot'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            IoT
          </button>
        </div>
      </div>

      {/* Search and OEM Filter */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
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
        <div className="flex items-center space-x-2 bg-white rounded-lg border p-1">
          <button
            className={`p-2 rounded ${viewMode === 'tiles' ? 'bg-gray-100' : ''}`}
            onClick={() => setViewMode('tiles')}
          >
            <Bars4Icon className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <TableCellsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* OEM Filter */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <span className="font-medium text-gray-700 mr-2">Vendor:</span>
        {oems.map(oem => (
          <button
            key={oem}
            onClick={() => setFilterOEM(oem)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
              filterOEM === oem
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {oem}
          </button>
        ))}
      </div>

      {/* Devices Display */}
      {viewMode === 'tiles' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-6">
            {Object.keys(groupedDevices).map(oem => (
              <div key={oem}>
                {/* OEM Header with Box Layout and Collapse/Expand */}
                <div
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOemSection(oem)}
                >
                  <div className="flex items-center">
                    {/* OEM Image */}
                    <img
                      src={oemImages[oem] || '/assets/default-oem-logo.svg'} // Fallback image if OEM not found
                      alt={`${oem} logo`}
                      className="w-16 h-16 rounded-full object-contain mr-4"
                    />
                    {/* OEM Name */}
                    <h2 className="text-xl font-semibold text-gray-900">{oem}</h2>
                  </div>
                  {/* Collapse/Expand Icon */}
                  {expandedOems[oem] ? (
                    <ChevronUpIcon className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                {/* Devices Grid (Collapsible) */}
                {expandedOems[oem] && (
                  <Droppable droppableId={oem} direction="horizontal">
                    {(provided) => (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {groupedDevices[oem].map((device, index) => (
                          <Draggable key={device.id} draggableId={device.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="w-64 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => setSelectedDevice(device)}
                              >
                                <div className="p-4 flex flex-col items-center">
                                  {/* Device Image */}
                                  <img
                                    src={device.image}
                                    alt={`${device.name} logo`}
                                    className="w-16 h-16 object-contain mb-4"
                                  />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{device.name}</h3>
                                  <p className="text-sm text-gray-600"><span className="font-medium">Vendor:</span> {device.vendor}</p>
                                  <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {device.type}</p>
                                  <p className="text-sm text-gray-600"><span className="font-medium">Model:</span> {device.model}</p>
                                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div
            className="ag-theme-alpine w-full"
            style={{
              height: 'auto',
              minHeight: 200,
              ...gridTheme,
            }}
          >
            <AgGridReact
              rowData={filteredDevices}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              onRowDoubleClicked={onRowDoubleClicked}
              rowSelection="multiple"
              enableRangeSelection={true}
              copyHeadersToClipboard={true}
              rowGroupPanelShow="always"
              groupDisplayType="multipleColumns"
              animateRows={true}
              suppressRowClickSelection={true}
              suppressCellFocus={true}
              context={{ setSelectedDevice }}
              domLayout="autoHeight"
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
              editType="fullRow" // Enable full row editing
              onCellValueChanged={(event) => {
                // Update the devices state with edited values
                const updatedDevices = [...devices[viewType]];
                const index = updatedDevices.findIndex(device => device.id === event.data.id);
                if (index !== -1) {
                  updatedDevices[index] = event.data;
                  setDevices({
                    ...devices,
                    [viewType]: updatedDevices,
                  });
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Device Details Modal */}
      {selectedDevice && (
        <DeviceDetailsModal
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          device={selectedDevice}
        />
      )}
    </div>
  );
};