import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Connection,
  MarkerType,
  Node,
  Edge,
  NodeTypes,
  Position,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WorkflowDesigner from './WorkflowDesigner';

const STAGE_COLORS: Record<string, string> = {
  PLANNING: '#2563eb', // blue
  'TA COMPLETE': '#22c55e', // green
  CLOSED: '#22c55e', // green
};

const CERTIFICATION_STAGES = [
  'FORECAST',
  'PLANNING',
  'SUBMITTED',
  'SUBMISSION_REVIEW',
  'DEVICE_ENTRY',
  'DEVICE_TESTING',
  'TAQ_REVIEW',
  'TA_COMPLETE',
  'CLOSED',
] as const;
type CertificationStage = typeof CERTIFICATION_STAGES[number];

const getNodeColor = (stage: string) => {
  if (stage === 'PLANNING') return STAGE_COLORS.PLANNING;
  if (stage === 'TA COMPLETE' || stage === 'CLOSED') return STAGE_COLORS.CLOSED;
  return '#d1d5db'; // gray
};

const nodeTypes: NodeTypes = {
  stage: ({ data, id, isConnectable }) => (
    <div
      className="rounded-lg border-2 shadow-sm px-6 py-3 min-w-[120px] text-center relative"
      style={{
        background: getNodeColor(data.label),
        color: ['PLANNING', 'TA_COMPLETE', 'CLOSED'].includes(data.label) ? 'white' : 'black',
        borderColor: '#888',
        fontWeight: 'bold',
      }}
    >
      {/* Add handles for linking */}
      <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translate(-50%, -50%)' }}>
        <div className="w-3 h-3 bg-blue-400 rounded-full" style={{ cursor: 'pointer' }} data-handle="target" />
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' }}>
        <div className="w-3 h-3 bg-blue-400 rounded-full" style={{ cursor: 'pointer' }} data-handle="source" />
      </div>
      {data.label}
    </div>
  ),
};

type SortableNodeItemProps = {
  node: Node;
  idx: number;
  editingIdx: number | null;
  editValue: CertificationStage | '';
  setEditValue: React.Dispatch<React.SetStateAction<CertificationStage | ''>>;
  handleEditStage: (idx: number) => void;
  handleEditSave: (idx: number) => void;
  handleDeleteStage: (idx: number) => void;
  setEditingIdx: React.Dispatch<React.SetStateAction<number | null>>;
  nodes: Node[];
};
const SortableNodeItem: React.FC<SortableNodeItemProps> = ({ node, idx, editingIdx, editValue, setEditValue, handleEditStage, handleEditSave, handleDeleteStage, setEditingIdx, nodes }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
      className="mb-2 flex items-center"
    >
      {editingIdx === idx ? (
        <>
          <select
            value={editValue}
            onChange={e => setEditValue(e.target.value as CertificationStage)}
            className="border px-1 py-0.5 rounded mr-2"
            autoFocus
          >
            <option value="">Select stage</option>
            {CERTIFICATION_STAGES.filter(s => !nodes.some(n => n.data.label === s) || s === nodes[idx].data.label).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="text-green-600 mr-1"
            onClick={() => handleEditSave(idx)}
            disabled={!editValue || (editValue !== nodes[idx].data.label && nodes.some((n, i) => n.data.label === editValue && i !== idx))}
          >✔</button>
          <button
            className="text-gray-500"
            onClick={() => setEditingIdx(null)}
          >✖</button>
        </>
      ) : (
        <>
          <span
            className="inline-block px-2 py-1 rounded flex-1"
            style={{
              background: getNodeColor(node.data.label),
              color: ['PLANNING', 'TA_COMPLETE', 'CLOSED'].includes(node.data.label) ? 'white' : 'black',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {node.data.label}
          </span>
          <button
            className="ml-2 text-blue-600"
            onClick={() => handleEditStage(idx)}
            title="Edit"
          >✎</button>
          <button
            className="ml-1 text-red-600"
            onClick={() => handleDeleteStage(idx)}
            title="Delete"
          >🗑</button>
        </>
      )}
    </li>
  );
};

export const WorkflowModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { selectedWorkflow, updateWorkflow } = useWorkflowStore();
  const initialNodes: Node[] = selectedWorkflow?.nodes?.length
    ? selectedWorkflow.nodes
    : (selectedWorkflow?.stages || []).map((stage, i) => ({
        id: stage.id,
        type: 'stage',
        position: { x: 100 + (i % 3) * 200, y: 100 + Math.floor(i / 3) * 120 },
        data: { label: stage.name },
      }));
  const initialEdges: Edge[] = selectedWorkflow?.edges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<CertificationStage | ''>('');
  const [newStage, setNewStage] = useState<CertificationStage | ''>('');
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeLabel, setEdgeLabel] = useState('');

  // Sidebar node management
  const handleAddStage = () => {
    if (newStage && !nodes.some(n => n.data.label === newStage)) {
      const newNode: Node = {
        id: newStage.toLowerCase().replace(/\s+/g, '-'),
        type: 'stage',
        position: { x: 100, y: 100 + nodes.length * 80 },
        data: { label: newStage },
      };
      setNodes(nds => [...nds, newNode]);
      setNewStage('');
    }
  };

  const handleEditStage = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(nodes[idx].data.label);
  };

  const handleEditSave = (idx: number) => {
    if (editValue && !nodes.some((n, i) => n.data.label === editValue && i !== idx)) {
      setNodes(nds => nds.map((n, i) => i === idx ? { ...n, data: { ...n.data, label: editValue } } : n));
      setEditingIdx(null);
      setEditValue('');
    }
  };

  const handleDeleteStage = (idx: number) => {
    const nodeId = nodes[idx].id;
    setNodes(nds => nds.filter((_, i) => i !== idx));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setEditingIdx(null);
    setEditValue('');
  };

  // React Flow edge connect
  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 } }, eds));
  }, [setEdges]);

  // Edge delete (select and delete key)
  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId));
  }, [setEdges]);

  // Edge label editing
  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setEditingEdgeId(edge.id);
    setEdgeLabel(typeof edge.label === 'string' ? edge.label : (edge.label ? String(edge.label) : ''));
  };
  const handleEdgeLabelSave = () => {
    setEdges(eds => eds.map(e => e.id === editingEdgeId ? { ...e, label: edgeLabel } : e));
    setEditingEdgeId(null);
    setEdgeLabel('');
  };

  // Save workflow
  const handleSaveWorkflow = () => {
    if (!selectedWorkflow) return;
    // Map nodes to stages for persistence
    const updatedStages = nodes.map((node) => ({
      id: node.id,
      name: node.data.label,
      tasks: selectedWorkflow.stages.find(s => s.id === node.id)?.tasks || [],
    }));
    // Ensure all node.type and edge.label are strings
    const safeNodes = nodes.map(n => ({ ...n, type: typeof n.type === 'string' ? n.type : 'stage' }));
    const safeEdges = edges.map(e => ({ ...e, label: typeof e.label === 'string' ? e.label : (e.label ? String(e.label) : undefined) }));
    updateWorkflow({
      ...selectedWorkflow,
      nodes: safeNodes,
      edges: safeEdges,
      stages: updatedStages,
      updatedAt: new Date().toISOString(),
    });
    alert('Workflow saved!');
  };

  return (
    <div style={{ height: '100%' }}>
      <WorkflowDesigner />
    </div>
  );
}; 