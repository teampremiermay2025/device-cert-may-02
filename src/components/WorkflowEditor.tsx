import { useCallback, useState, DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  NodeProps,
  MarkerType,
  Connection,
  Handle,
  Position,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { PlusIcon } from '@heroicons/react/24/outline';

interface NodeData {
  label: string;
  description?: string;
  status?: 'pending' | 'active' | 'completed' | 'error';
}

const nodeTypes = {
  task: ({ data, isConnectable }: NodeProps) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm min-w-[200px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div className="text-sm font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  ),
  decision: ({ data, isConnectable }: NodeProps) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm rotate-45 min-w-[150px] min-h-[150px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ transform: 'rotate(-45deg)' }} />
      <div className="-rotate-45">
        <div className="text-sm font-medium">{data.label}</div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ transform: 'rotate(-45deg)' }} />
    </div>
  ),
  start: ({ data, isConnectable }: NodeProps) => (
    <div className="bg-green-100 border-2 border-green-500 rounded-full p-4 shadow-sm">
      <div className="text-sm font-medium text-green-700">{data.label}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  ),
  end: ({ data, isConnectable }: NodeProps) => (
    <div className="bg-red-100 border-2 border-red-500 rounded-full p-4 shadow-sm">
      <div className="text-sm font-medium text-red-700">{data.label}</div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
    </div>
  ),
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
  },
};

export const WorkflowEditor = () => {
  const { selectedWorkflow, updateWorkflow, predefinedTasks, addPredefinedTask } = useWorkflowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(selectedWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(selectedWorkflow?.edges || []);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
  }, [setEdges]);

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    const taskData = JSON.parse(event.dataTransfer.getData('application/json'));
    const position = {
      x: event.clientX - event.currentTarget.getBoundingClientRect().left,
      y: event.clientY - event.currentTarget.getBoundingClientRect().top,
    };

    const newNode: Node<NodeData> = {
      id: crypto.randomUUID(),
      type: 'task',
      position,
      data: { 
        label: taskData.label,
        description: taskData.description,
        status: 'pending',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddPredefinedTask = () => {
    if (!newTaskName || !newTaskCategory) return;
    
    addPredefinedTask(newTaskCategory, newTaskName);
    setNewTaskName('');
    setNewTaskCategory('');
    setShowAddTaskForm(false);
  };

  const handleSave = () => {
    if (selectedWorkflow) {
      updateWorkflow({
        ...selectedWorkflow,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Predefined Tasks Sidebar */}
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Predefined Tasks</h3>
            <button
              onClick={() => setShowAddTaskForm(!showAddTaskForm)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {showAddTaskForm && (
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                placeholder="Category"
                className="w-full px-2 py-1 border rounded"
              />
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task name"
                className="w-full px-2 py-1 border rounded"
              />
              <button
                onClick={handleAddPredefinedTask}
                className="w-full px-3 py-1 bg-blue-600 text-white rounded"
              >
                Add Task
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {Object.entries(predefinedTasks).map(([category, tasks]) => (
            <div key={category} className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({
                        label: task,
                        category,
                      }));
                    }}
                    className="p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100"
                  >
                    {task}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Editor */}
      <div className="flex-1">
        <div className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            
            <Panel position="top-right" className="bg-white p-2 rounded shadow">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Workflow
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};