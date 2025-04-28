import { FC } from 'react';
import { CertificationRequest } from '../types';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

interface ReleaseDetailsProps {
  certification: CertificationRequest;
}

const workflowStages = [
  { id: 'forecast', label: 'FORECAST', position: { x: 0, y: 100 } },
  { id: 'planning', label: 'PLANNING', position: { x: 200, y: 100 } },
  { id: 'submitted', label: 'SUBMITTED', position: { x: 400, y: 100 } },
  { id: 'submission_review', label: 'SUBMISSION REVIEW', position: { x: 600, y: 100 } },
  { id: 'device_entry', label: 'DEVICE ENTRY', position: { x: 800, y: 100 } },
  { id: 'device_testing', label: 'DEVICE TESTING', position: { x: 1000, y: 100 } },
  { id: 'taq_review', label: 'TAQ REVIEW', position: { x: 1200, y: 100 } },
  { id: 'ta_complete', label: 'TA COMPLETE', position: { x: 1400, y: 100 } },
  { id: 'closed', label: 'CLOSED', position: { x: 1600, y: 100 } },
];

export const ReleaseDetails: FC<ReleaseDetailsProps> = ({ certification }) => {
  const nodes = workflowStages.map(stage => ({
    id: stage.id,
    type: 'default',
    position: stage.position,
    data: { 
      label: stage.label,
    },
    style: {
      background: stage.label === certification.status ? '#93c5fd' : '#f3f4f6',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      width: 150,
    },
  }));

  const edges = workflowStages.slice(0, -1).map((stage, index) => ({
    id: `e${stage.id}-${workflowStages[index + 1].id}`,
    source: stage.id,
    target: workflowStages[index + 1].id,
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-6">Release Details</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1">{certification.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Affects Version</dt>
                <dd className="mt-1">{certification.affectsVersion}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Component</dt>
                <dd className="mt-1">{certification.components}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Device Details</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Device Issue Key</dt>
                <dd className="mt-1">{certification.darpKey}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Device Vendor</dt>
                <dd className="mt-1">{certification.vendor}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Device Type</dt>
                <dd className="mt-1">{certification.deviceType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Device Model</dt>
                <dd className="mt-1">{certification.deviceModel}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Marketing Name</dt>
                <dd className="mt-1">{certification.deviceMarketingName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Code Name</dt>
                <dd className="mt-1">{certification.deviceCodeName}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">People</h3>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Assignee</dt>
              <dd className="mt-1">{certification.assignee}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Reporter</dt>
              <dd className="mt-1">{certification.reporter}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Primary PC</dt>
              <dd className="mt-1">{certification.primaryPC}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Dates</h3>
          <dl className="grid grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1">{new Date(certification.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated</dt>
              <dd className="mt-1">{new Date(certification.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Forecasted DE Date</dt>
              <dd className="mt-1">{certification.forecastedDEDate}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Forecasted TA Date</dt>
              <dd className="mt-1">{certification.forecastedTADate}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Sub-Tasks</h3>
          <div className="space-y-2">
            {certification.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.status === 'DONE'}
                    className="mr-3 rounded border-gray-300"
                    readOnly
                  />
                  <span>{task.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{task.status}</span>
                  <span className="text-sm text-gray-500">{task.assignee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Workflow Status</h3>
        <div style={{ height: '400px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};