import React, { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardProjects } from './DashBoardProjects';
import { 
  PencilIcon, 
  TrashIcon,
  CloudIcon, 
  ComputerDesktopIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import usersData from '../data/users.json';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CardData {
  id: string;
  title: string;
  count: number;
  statuses: { label: string; count: number; dotColor: 'orange' | 'green' | 'blue' }[];
  buttons: { label: string; style: 'view' | 'action' }[];
}

const SortableCard: React.FC<{
  card: CardData;
  removeCard: (id: string) => void;
  styles: any;
}> = ({ card, removeCard, styles }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const cardStyle = {
    ...styles.card,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={cardStyle}>
      <div style={styles.cardHeader}>
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <PencilIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={(e) => {
            e.stopPropagation();
            console.log(`Removing card with id: ${card.id}`); // Debug log
            removeCard(card.id);
          }}>
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div style={styles.count}><h2 style={styles.count} {...attributes} {...listeners}>{card.title}</h2>{card.count}</div>
      {card.statuses.map((status, i) => (
        <div key={i} style={styles.status}>
          <div style={{width:'50%', ...(status.label === 'DA EMR'? styles.labelAlign:'')}}>
            <span
              style={{
                ...styles.dot,
                ...(status.dotColor === 'orange'
                  ? styles.orangeDot
                  : status.dotColor === 'green'
                  ? styles.greenDot
                  : styles.blueDot),
              }}
            ></span>
            {status.label}
          </div>
          <div style={{width:'50%',...(status.label === 'DA EMR'? styles.countAlign:'')}}>
            <span style={styles.statusNumber}>{status.count}</span>
          </div>
        </div>
      ))}
      <div style={styles.actions}>
        {card.buttons.map((button, i) => (
          <button
            key={i}
            style={
              button.style === 'view'
                ? styles.viewButton
                : styles.actionButton
            }
            onClick={
              button.style === 'view'
                ? () => navigate('/projects')
                : undefined
            }
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ActivityItem for notifications
const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => {
  const user = usersData.users.find(u => u.id === activity.userId);
  if (!user) return null;
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };
  const getActivityMessage = () => {
    switch (activity.type) {
      case 'certification_created':
        return `created certification "${activity.details.projectName}"`;
      case 'certification_updated':
        return 'updated certification details';
      case 'task_created':
        return `created task "${activity.details.taskName}"`;
      case 'task_updated':
        return `updated task "${activity.details.taskName}"`;
      case 'task_status_changed':
        return `changed status of "${activity.details.taskName}" from ${activity.details.oldStatus} to ${activity.details.newStatus}`;
      case 'task_assigned':
        const oldAssignee = activity.details.oldAssignee ? usersData.users.find(u => u.id === activity.details.oldAssignee)?.name : 'unassigned';
        const newAssignee = activity.details.newAssignee ? usersData.users.find(u => u.id === activity.details.newAssignee)?.name : 'unassigned';
        return `reassigned task "${activity.details.taskName}" from ${oldAssignee} to ${newAssignee}`;
      case 'comment_added':
        return `commented on task "${activity.details.taskName}"`;
      case 'attachment_added':
        return `added attachment "${activity.details.attachmentName}" to task "${activity.details.taskName}"`;
      case 'stage_changed':
        return `moved certification from ${activity.details.oldStage} to ${activity.details.newStage}`;
      default:
        return 'performed an action';
    }
  };
  return (
    <div className="flex items-start gap-3 py-3 text-left">
      <div className="flex items-center gap-2" title={user.name}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-gray-200" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
        {getInitials(user.name)}
        </div>
      )}
      </div>
      <div className="flex-1 min-w-0">
      <div className="text-sm">
        <span className="font-medium">{user.name}</span>
        {' '}{getActivityMessage()}
      </div>
      <span className="text-xs text-gray-500">
        {new Date(activity.timestamp).toLocaleString()}
      </span>
      </div>
    </div>
  );
};

// DashboardWidgets Component
const DashboardWidgets: React.FC<{ styles: any }> = ({ }) => {
  const widgetData = [
    {
      title: "IR",
      count: "50",
      change: "+5",
      chartColor: "blue",
      chartData: {
        labels: ["", "", "", "", ""],
        datasets: [
          {
            label: "IR",
            data: [0.5,3,8,13,50],
            fill: true,
            backgroundColor: "rgba(0, 61, 122, 0.1)",
            borderColor: "rgb(0, 61, 122)",
            tension: 0.4,
          },
        ],
      },
    },
    {
      title: "EMR",
      count: "9",
      change: "-15",
      chartColor: "blue",
      chartData: {
        labels: ["", "", "", "", ""],
        datasets: [
          {
            label: "EMR",
            data: [34, 36, 38, 40, 43],
            fill: true,
            backgroundColor: "rgba(245, 130, 32, 0.1)",
            borderColor: "rgba(245, 130, 32, 1)",
            tension: 0.4,
          },
        ],
      },
    },
    {
      title: "SMR",
      count: "4",
      change: "+1",
      chartColor: "blue",
      chartData: {
        labels: ["", "", "", "", ""],
        datasets: [
          {
            label: "SMR",
            data: [33800, 33900, 33700, 34000, 34034],
            fill: true,
            backgroundColor: "rgba(0, 153, 0, 0.1)",
            borderColor: "rgba(0, 153, 0,1)",
            tension: 0.4,
          },
        ],
      },
    },
    {
      title: "BYOD",
      count: "3",
      change: "",
      chartColor: "orange",
      chartData: {
        labels: ["", "", "", "", ""],
        datasets: [
          {
            label: "BYOD",
            data: [300, 301, 300.5, 301.5, 302],
            fill: true,
            backgroundColor: "rgba(0, 176, 240, 0.1)",
            borderColor: "rgba(0, 176, 240, 1)",
            tension: 0.4,
          },
        ],
      },
    },
  ];

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    maintainAspectRatio: false,
  };

  const widgetStyles = {
    widgetContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      width: '100%',
      height: '400px',
      padding: '16px',
      paddingLeft: '52px',
    },
    widget: {
      backgroundColor: '#ffffff',
      borderRadius: '1rem',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      width: '400px',
    },
    widgetTitle: {
      fontSize: '16px',
      fontWeight: 500 as const,
      color: '#4b5563',
      marginBottom: '8px',
    },
    widgetCount: {
      fontSize: '24px',
      fontWeight: 700 as const,
      color: '#1f2937',
    },
    widgetChange: {
      fontSize: '14px',
      color: '#4b5563',
    },
    chart: {
      height: '50px',
    },
  };

  return (
    <div style={widgetStyles.widgetContainer}>
      {widgetData.map((widget, index) => (
        <div key={index} style={widgetStyles.widget}>
          <div>
            <div style={widgetStyles.widgetTitle}>{widget.title}</div>
            <div style={widgetStyles.widgetCount}>{widget.count}</div>
            <div style={widgetStyles.widgetChange}>{widget.change}</div>
          </div>
          <div style={widgetStyles.chart}>
            <Line data={widget.chartData} options={chartOptions} />
          </div>
        </div>
      ))}
    </div>
  );
};

// New Grid Component for Inflight Work in Progress
const InflightWorkGrid: React.FC<{ styles: any }> = ({}) => {
  const dummyData = [
    {
      id: "WIP001",
      projectName: "IoT Sensor Integration",
      status: "In Progress",
      owner: "Alice Smith",
      startDate: "2025-03-15",
      estimatedCompletion: "2025-06-20",
    },
    {
      id: "WIP002",
      projectName: "Non-IoT Device Testing",
      status: "In Progress",
      owner: "Bob Johnson",
      startDate: "2025-04-01",
      estimatedCompletion: "2025-07-10",
    },
    {
      id: "WIP003",
      projectName: "Firmware Update Rollout",
      status: "On Hold",
      owner: "Clara Williams",
      startDate: "2025-02-20",
      estimatedCompletion: "2025-08-15",
    },
    {
      id: "WIP004",
      projectName: "Security Patch Deployment",
      status: "In Progress",
      owner: "David Brown",
      startDate: "2025-04-10",
      estimatedCompletion: "2025-06-30",
    },
  ];

  const gridStyles = {
    gridContainer: {
      marginTop: '16px',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      padding: '16px',
    },
    gridTitle: {
      fontSize: '1.25rem',
      fontWeight: 600 as const,
      color: '#1f2937',
      marginBottom: '16px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
    },
    th: {
      padding: '12px',
      fontSize: '14px',
      fontWeight: 600 as const,
      color: '#4b5563',
      borderBottom: '1px solid #e5e7eb',
    },
    td: {
      padding: '12px',
      fontSize: '14px',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb',
    },
  };

  return (
    <div style={gridStyles.gridContainer}>
      <h3 style={gridStyles.gridTitle}>Inflight Work in Progress</h3>
      <table style={gridStyles.table}>
        <thead>
          <tr>
            <th style={gridStyles.th}>ID</th>
            <th style={gridStyles.th}>Project Name</th>
            <th style={gridStyles.th}>Status</th>
            <th style={gridStyles.th}>Owner</th>
            <th style={gridStyles.th}>Start Date</th>
            <th style={gridStyles.th}>Estimated Completion</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((item) => (
            <tr key={item.id}>
              <td style={gridStyles.td}>{item.id}</td>
              <td style={gridStyles.td}>{item.projectName}</td>
              <td style={gridStyles.td}>{item.status}</td>
              <td style={gridStyles.td}>{item.owner}</td>
              <td style={gridStyles.td}>{item.startDate}</td>
              <td style={gridStyles.td}>{item.estimatedCompletion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DashBoardHome = () => {
  const initialCards: CardData[] = [
    {
      id: '1',
      title: 'IoT',
      count: 3,
      statuses: [
        { label: 'DA IR', count: 2, dotColor: 'orange' },
        { label: 'DA EMR', count: 1, dotColor: 'green' },
      ],
      buttons: [
        { label: 'View all projects', style: 'view' },
        { label: 'Start new certification', style: 'action' },
      ],
    },
    {
      id: '2',
      title: 'Non-IoT ',
      count: 8,
      statuses: [
        { label: 'DA IR', count: 7, dotColor: 'orange' },
        { label: 'DA EMR', count: 1, dotColor: 'green' },
      ],
      buttons: [
        { label: 'View all projects', style: 'view' },
        { label: 'Start new certification', style: 'action' },
      ],
    },
    {
      id: '3',
      title: 'Defects ',
      count: 20,
      statuses: [
        { label: 'DA IR', count: 17, dotColor: 'orange' },
        { label: 'DA EMR', count: 3, dotColor: 'blue' },
      ],
      buttons: [
        { label: 'View all projects', style: 'view' },
        { label: 'Start new certification', style: 'action' },
      ],
    },
  ];

  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Aggregate all activities from all certifications
  const allActivities = (() => {
    let activities: any[] = [];
    try {
      const certs = JSON.parse(localStorage.getItem('certifications') || '[]');
      certs.forEach((cert: any) => {
        if (cert.activities && Array.isArray(cert.activities)) {
          activities = activities.concat(cert.activities.map((a: any) => ({...a, certification: cert})));
        }
      });
    } catch {}
    // Sort by timestamp descending
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  })();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const updatedCards = [...cards];
    const [moved] = updatedCards.splice(oldIndex, 1);
    updatedCards.splice(newIndex, 0, moved);
    setCards(updatedCards);
  };

  const removeCard = (id: string) => {
    console.log(`Attempting to remove card with id: ${id}`); // Debug log
    setCards((prev) => {
      const newCards = prev.filter((card) => card.id !== id);
      console.log('Updated cards:', newCards); // Debug log
      return newCards;
    });
  };

  const chartData = {
    labels: ["TAQ Review", "Submitted", "TA Review Complete", "Planning", "Cancelled", "Device Testing", "TA Rescinded", "Forecast"],
    datasets: [
      {
        label: "IR",
        data: [6, 2, 8, 2, 1, 6, 1, 14],
        backgroundColor: "rgb(0, 61, 122)",
      },
      {
        label: "EMR",
        data: [1, 0, 2, 1, 1, 1, 1, 1],
        backgroundColor: "rgb(245, 130, 32)",
      },
      {
        label: "SMR",
        data: [0, 1, 1, 0, 0, 1, 0, 0],
        backgroundColor: "rgb(0, 153, 0)",
      },
      {
        label: "BYOD",
        data: [1, 0, 1, 0, 1, 0, 0, 1],
        backgroundColor: "rgb(0, 176, 240)",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'IoT Certification Pipeline',
        font: {
          size: 18,
        },
      },
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 18,
        ticks: {
          stepSize: 2,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const styles = {
    dashboardContainer: {
      padding: '16px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb',
      color: '#1f2937',
      width: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: 700 as const,
      margin: 0,
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
    },
    actionItems: {
      marginBottom: '16px',
    },
    actionTitle: {
      fontSize: '1rem',
      fontWeight: 600 as const,
      color: 'rgb(37 99 235 / var(--tw-text-opacity, 1)',
      display: 'flex',
      alignItems: 'center',
    },
    actionIcon: {
      color: '#f59e0b',
      marginRight: '6px',
      fontSize: '16px',
    },
    cards: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
      width: '100%',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '1rem',
      padding: '16px',
      maxWidth: '32%',
      minWidth: '32%',
      flex: 1,
      boxShadow:
        '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'right',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 500 as const,
      margin: '0 0 12px',
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#6b7280',
    },
    labelAlign:{
      marginLeft:'14px',
    },
    countAlign:{
      marginRight:'5px',
    },
    count: {
      fontSize: '28px',
      fontWeight: 700 as const,
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
    },
    status: {
      display: 'flex',
      fontSize: '16px',
      marginBottom: '4px',
      color: '#4b5563',
    },
    dot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      marginRight: '6px',
      display:'inline-block',
    },
    orangeDot: {
      backgroundColor: '#f97316',
    },
    greenDot: {
      backgroundColor: '#10b981',
    },
    blueDot: {
      backgroundColor: '#3b82f6',
    },
    statusNumber: {
      marginLeft: 'auto',
      fontWeight: 600 as const,
      color: '#374151',
    },
    actions: {
      display: 'flex',
      gap: '32px',
      marginTop: '12px',
      justifyContent: 'center',
    },
    viewButton: {
      padding: '6px 12px',
      borderRadius: '.5rem',
      fontSize: '12px',
      cursor: 'pointer',
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      color: '#374151',
      fontWeight: 500 as const,
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '.5rem',
      fontSize: '12px',
      cursor: 'pointer',
      backgroundColor: 'rgb(37 99 235 / var(--tw-bg-opacity, 1))',
      border: 'none',
      color: '#ffffff',
      fontWeight: 500 as const,
    },
    tabContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px',
      borderBottom: '1px solid #e5e7eb',
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      color: '#1f2937',
      fontSize:'20px',
      fontWeight: 500 as const,
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
    },
    activeTab: {
      color: 'rgb(30 58 138 / var(--tw-text-opacity, 1))',
      borderBottom: '2px solid #2563eb',
    },
    tabIcon: {
      width: '20px',
      height: '20px',
    },
    filterContainer: {
      marginBottom: '16px',
    },
    filterTitle: {
      fontSize: '1rem',
      fontWeight: 600 as const,
      color: '#1f2937',
      marginBottom: '8px',
      textAlign: 'left' as const
    },
    filterDropdowns: {
      display: 'flex',
      gap: '16px',
    },
    dropdown: {
      padding: '8px 12px',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer',
    },
    chartContainer: {
      marginTop: '16px',
      height: '400px',
      width: '50%',
    },
    chartAndWidgetsContainer: {
      display: 'flex',
      gap: '16px',
      width: '100%',
    },
    widgetsContainer: {
      marginTop: '16px',
      height: '400px',
      width: '50%',
    },
  };

  const [activeTab, setActiveTab] = useState('IoT');

  const tabs = [
    { name: 'IoT', icon: CloudIcon },
    { name: 'Non IoT', icon: ComputerDesktopIcon },
  ];

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Welcome, Michel</h1>
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="p-2 rounded-full hover:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <BellIcon className="w-7 h-7 text-gray-500" />
            {allActivities.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-y-auto animate-fade-in"
                 style={{ boxShadow: '0 8px 32px rgba(30, 64, 175, 0.18)', border: 'none' }}>
              <div className="p-4 border-b font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">Notifications</div>
              <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                {allActivities.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-8">No recent activity</div>
                ) : (
                  allActivities.slice(0, 30).map((activity, idx) => (
                    <ActivityItem key={activity.id + idx} activity={activity} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={styles.actionItems}>
        <span style={styles.actionTitle}>
          <span style={styles.actionIcon}>★</span> Prod: Device Pipeline Certification
        </span>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cards.map((card) => card.id)} strategy={horizontalListSortingStrategy}>
            <div style={styles.cards}>
              {cards.map((card) => (
                <SortableCard key={card.id} card={card} removeCard={removeCard} styles={styles} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div style={styles.tabContainer}>
        {tabs.map((tab) => (
          <div
            key={tab.name}
            style={{
              ...styles.tab,
              ...(activeTab === tab.name ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab(tab.name)}
          >
            <tab.icon style={styles.tabIcon} />
            {tab.name}
          </div>
        ))}
      </div>
      <div style={styles.filterContainer}>
        <h3 style={styles.filterTitle}>Filters</h3>
        <div style={styles.filterDropdowns}>
          <select style={styles.dropdown}>
            <option>Last 30 days</option>
            <option>Last 60 days</option>
            <option>Last 90 days</option>
          </select>
          <select style={styles.dropdown}>
            <option>Stock</option>
            <option>BYOD</option>
            <option>Cricket Freelance</option>
            <option>Cricket IRTA</option>
            <option>MVNO</option>
          </select>
          <select style={styles.dropdown}>
            <option>FN Devices</option>
          </select>
          <select style={styles.dropdown}>
            <option>Owner</option>
            <option>I’m the OEM Lead</option>
            <option>I’m the DPD Lead</option>
          </select>
          <select style={styles.dropdown}>
            <option>Status</option>
          </select>
        </div>
      </div>
      <div style={styles.chartAndWidgetsContainer}>
        <div style={styles.chartContainer}>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div style={styles.widgetsContainer}>
          <DashboardWidgets styles={styles} />
        </div>
      </div>
      {/* <InflightWorkGrid styles={styles} /> */}
      <DashboardProjects/>
    </div>
  );
};