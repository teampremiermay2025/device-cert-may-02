import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { PlusIcon, FunnelIcon, Bars4Icon, TableCellsIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { CertificationRequest, CertificationStage } from '../types';
import { ViewCertificationPanel } from './ViewCertificationPanel';
import { CertificationCard } from './CertificationCard';
import { storage } from '../lib/storage';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import usersData from '../data/users.json';
import { GridApi, ColumnApi } from 'ag-grid-community';

interface DashboardProps {
  onNewCertification: () => void;
}

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

const statusOptions = [
  'FORECAST',
  'PLANNING',
  'SUBMITTED',
  'SUBMISSION_REVIEW',
  'DEVICE_ENTRY',
  'DEVICE_TESTING',
  'TAQ_REVIEW',
  'TA_COMPLETE',
  'CLOSED',
];

const getStatusColor = (status: CertificationStage): string => {
  
  const colors: Record<CertificationStage, string> = {
    'FORECAST': 'bg-purple-100 text-purple-800',
    'PLANNING': 'bg-blue-100 text-blue-800',
    'SUBMITTED': 'bg-yellow-100 text-yellow-800',
    'SUBMISSION_REVIEW': 'bg-orange-100 text-orange-800',
    'DEVICE_ENTRY': 'bg-cyan-100 text-cyan-800',
    'DEVICE_TESTING': 'bg-indigo-100 text-indigo-800',
    'TAQ_REVIEW': 'bg-pink-100 text-pink-800',
    'TA_COMPLETE': 'bg-green-100 text-green-800',
    'CLOSED': 'bg-gray-100 text-gray-800'
  };
  return colors[status.replace(/\s+/g, '_').toUpperCase() as CertificationStage];
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

const DarpKeyCellRenderer = (props: any) => {
  return (
    <div 
      className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
      onClick={(e) => {
        e.stopPropagation();
        props.context.setSelectedCertification(props.data);
      }}
    >
      {props.value}
    </div>
  );
};

const AssigneeCellRenderer = (props: any) => {
  const user = usersData.users.find(u => u.id === props.value);
  if (!user) return '-';

  const nameParts = user.name.split(' ');
  const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[nameParts.length - 1][0] : user.name.slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
      ) : (
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-300 text-white text-xs">
          {initials}
        </span>
      )}
      <span>{user.name}</span>
    </div>
  );
};

const AssigneeEditor = (props: any) => {
  const [selectedUser, setSelectedUser] = useState(props.value);

  const onUserSelect = (userId: string) => {
    setSelectedUser(userId);
    props.stopEditing();
    props.setValue(userId);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-2 z-50">
      {usersData.users.map(user => (
        <div
          key={user.id}
          className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded"
          onClick={() => onUserSelect(user.id)}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
          ) : (
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-300 text-white text-xs">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          )}
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
};

const getRandomColor = (str: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const UserBubble: FC<{ user: any }> = ({ user }) => {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const bgColorClass = getRandomColor(user.name);

  return (
    <div 
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
      title={user.name}
      style={{ marginLeft: '-0.5rem' }}
    > 
      <span className={`w-6 h-6 flex items-center justify-center rounded-full ${bgColorClass} text-white text-xs font-medium`}>
        {getInitials(user.name)}
      </span>
    </div>
  );
};

export const Dashboard: FC<DashboardProps> = ({ onNewCertification }) => {
  const [certifications, setCertifications] = useState<CertificationRequest[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationRequest | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isStatusOverviewExpanded, setIsStatusOverviewExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');

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

  const StatusCellRenderer = (props: any) => {
    const statusClass = getStatusColor(props.value as CertificationStage);
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
        {props.value}
      </span>
    );
  };

  const DateCellRenderer = (props: any) => {
    return props.value ? (
      <span className="text-gray-700">
        {new Date(props.value).toLocaleDateString()}
      </span>
    ) : '-';
  };

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
    '--ag-header-height': '52px',
    '--ag-list-item-height': '40px',
    '--ag-floating-filters-height': '40px',
  }), []);

  const columnDefs = useMemo(() => [
    {
      field: 'darpKey',
      headerName: 'DARP Key',
      filter: 'agTextColumnFilter',
      editable: true,
      cellRenderer: DarpKeyCellRenderer,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellClass: 'font-medium text-gray-900',
      minWidth: 150,
    },
    {
      field: 'projectName',
      headerName: 'Project Name',
      filter: 'agTextColumnFilter',
      editable: true,
      cellClass: 'text-gray-700',
      minWidth: 200,
    },
    {
      field: 'type',
      headerName: 'Type',
      filter: 'agSetColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: StatusCellRenderer,
      filter: 'agSetColumnFilter',
      minWidth: 140,
      cellClass: 'flex items-center',
    },
    {
      field: 'deviceModel',
      headerName: 'Device Model',
      filter: 'agTextColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 150,
      hide: true,
    },
    {
      field: 'deviceType',
      headerName: 'Device Type',
      filter: 'agSetColumnFilter',
      cellClass: 'text-gray-700',
      minWidth: 130,
      hide: true,
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      filter: 'agSetColumnFilter',
      editable: true,
      cellRenderer: AssigneeCellRenderer,
      cellEditor: AssigneeEditor,
      cellClass: 'text-gray-700',
      minWidth: 200,
      filterParams: {
        values: usersData.users.map(u => u.id),
        valueFormatter: (params: any) => {
          const user = usersData.users.find(u => u.id === params.value);
          return user ? user.name : params.value;
        }
      }
    },
    {
      field: 'forecastedLaunchDate',
      headerName: 'Launch Date',
      filter: 'agDateColumnFilter',
      cellRenderer: DateCellRenderer,
      editable: true,
      minWidth: 130,
      cellClass: 'cell-center',
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      filter: 'agDateColumnFilter',
      cellRenderer: DateCellRenderer,
      sort: 'desc',
      minWidth: 130,
      cellClass: 'cell-center',
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

  useEffect(() => {
    if (columnApi && typeof columnApi.getAllColumns === 'function') {
      const allColumnIds = columnApi.getAllColumns().map((col: any) => col.getColId());
      columnApi.autoSizeColumns(allColumnIds, false);
    }
  }, [certifications, columnApi]);

  const onCellValueChanged = useCallback((event: any) => {
    const updatedCertification = { ...event.data };
    const updatedCertifications = certifications.map(cert =>
      cert.id === updatedCertification.id ? updatedCertification : cert
    );
    storage.saveCertifications(updatedCertifications);
  }, [certifications]);

  const onRowDoubleClicked = useCallback((event: any) => {
    setSelectedCertification(event.data);
  }, []);

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const selectAllTypes = () => {
    setSelectedTypes(prev => 
      prev.length === projectTypes.length ? [] : [...projectTypes]
    );
  };

  useEffect(() => {
    if (gridApi) {
      const filterInstance = gridApi.getFilterInstance('type');
      if (selectedTypes.length > 0) {
        filterInstance.setModel({
          type: 'set',
          values: selectedTypes,
        });
      } else {
        filterInstance.setModel(null);
      }
      gridApi.onFilterChanged();
    }
  }, [selectedTypes, gridApi]);

  useEffect(() => {
    if (gridApi) {
      const filterInstance = gridApi.getFilterInstance('status');
      if (selectedStatus) {
        filterInstance.setModel({
          type: 'set',
          values: [selectedStatus],
        });
      } else {
        filterInstance.setModel(null);
      }
      gridApi.onFilterChanged();
    }
  }, [selectedStatus, gridApi]);

  useEffect(() => {
    if (viewMode === 'grid' && gridApi) {
      const typeFilter = gridApi.getFilterInstance('type');
      if (typeFilter && typeof typeFilter.setModel === 'function') {
        if (selectedTypes.length > 0) {
          typeFilter.setModel({ type: 'set', values: selectedTypes });
        } else {
          typeFilter.setModel(null);
        }
      }
      const statusFilter = gridApi.getFilterInstance('status');
      if (statusFilter && typeof statusFilter.setModel === 'function') {
        if (selectedStatus) {
          statusFilter.setModel({ type: 'set', values: [selectedStatus] });
        } else {
          statusFilter.setModel(null);
        }
      }
      gridApi.onFilterChanged();
    }
  }, [viewMode, gridApi, selectedTypes, selectedStatus]);

  const statusCounts = statusOrder.map(stage => ({
    stage,
    total: certifications.filter(cert => (cert.status || '').replace(/\s+/g, '_') === stage).length,
  }));

  const projectTypeCounts = projectTypes.map(type => ({
    type,
    count: certifications.filter(cert => cert.type === type).length
  }));

  const totalActive = certifications.filter(cert => cert.status !== 'CLOSED').length;

  const currentUser = usersData.users[0];
  const userInitials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="p-8 mx-auto">
      {!selectedCertification ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Device Certification Dashboard</h1>
              <p className="text-sm text-gray-500">Manage and track your device certification requests</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out shadow-sm"
                onClick={onNewCertification}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Certification
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certifications..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex items-center">
                {usersData.users.map((user, index) => (
                  <UserBubble key={user.id} user={user} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <ShareIcon className="w-5 h-5" />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
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
                  {isStatusOverviewExpanded ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {isStatusOverviewExpanded && (
                <div className="grid grid-cols-3 gap-4">
                  {statusCounts.map(({ stage, total }) => (
                    <button
                      key={stage}
                      onClick={() => {
                        if (gridApi) {
                          const filterInstance = gridApi.getFilterInstance('status');
                          filterInstance.setModel({
                            type: 'set',
                            values: [stage],
                          });
                          gridApi.onFilterChanged();
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all ${getStatusColor(stage)} hover:shadow-sm`}
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

          <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-gray-700">Type:</span>
              <button
                onClick={selectAllTypes}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTypes.length === projectTypes.length
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              {projectTypeCounts.map(({ type, count }) => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                    selectedTypes.includes(type)
                      ? getTypeColor(type)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type} ({count})
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center ml-6">
              <span className="font-medium text-gray-700">Status:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ minWidth: 120 }}
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}</option>
                ))}
              </select>
            </div>
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
          </div>

          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications
                .filter(cert => selectedTypes.length === 0 || selectedTypes.includes(cert.type))
                .filter(cert => selectedStatus === '' || cert.status === selectedStatus)
                .map((cert) => (
                  <CertificationCard 
                    key={cert.id} 
                    certification={cert}
                    onClick={() => setSelectedCertification(cert)}
                  />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div 
                className="ag-theme-alpine w-full" 
                style={{ 
                  height: 'auto', 
                  minHeight: 200,
                  ...gridTheme
                }}
              >
                <AgGridReact
                  rowData={certifications}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  onGridReady={onGridReady}
                  onCellValueChanged={onCellValueChanged}
                  onRowDoubleClicked={onRowDoubleClicked}
                  rowSelection="multiple"
                  enableRangeSelection={true}
                  copyHeadersToClipboard={true}
                  rowGroupPanelShow="always"
                  groupDisplayType="multipleColumns"
                  animateRows={true}
                  suppressRowClickSelection={true}
                  suppressCellFocus={true}
                  context={{ setSelectedCertification }}
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
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <ViewCertificationPanel
          certification={selectedCertification}
          onUpdate={(updated) => {
            const updatedCertifications = certifications.map(cert =>
              cert.id === updated.id ? updated : cert
            );
            storage.saveCertifications(updatedCertifications);
            setCertifications(updatedCertifications);
            setSelectedCertification(null);
          }}
          onUpdateNoClose={(updated) => {
            const updatedCertifications = certifications.map(cert =>
              cert.id === updated.id ? updated : cert
            );
            storage.saveCertifications(updatedCertifications);
            setCertifications(updatedCertifications);
            setSelectedCertification(updated);
          }}
          onCancel={() => setSelectedCertification(null)}
        />
      )}
    </div>
  );
};