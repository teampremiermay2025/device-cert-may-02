import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  useReactFlow,
  ReactFlowProvider,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

// Sample JSON data for tasks associated with states
const tasksData = {
  "To Do": [
    { id: "t1", title: "Define project scope", status: "Not Started" },
    { id: "t2", title: "Gather requirements", status: "In Progress" },
  ],
  "In Progress": [
    { id: "t3", title: "Develop feature A", status: "In Progress" },
    { id: "t4", title: "Write unit tests", status: "Not Started" },
  ],
  "In Review": [
    { id: "t5", title: "Code review for feature A", status: "In Progress" },
    { id: "t6", title: "Fix review comments", status: "Not Started" },
  ],
  "Done": [
    { id: "t7", title: "Deploy feature A", status: "Completed" },
  ],
  "Planning": [
    { id: "t8", title: "Create project timeline", status: "Not Started" },
    { id: "t9", title: "Assign team roles", status: "In Progress" },
  ],
  "Forecast": [
    { id: "t10", title: "Estimate resource needs", status: "Not Started" },
    { id: "t11", title: "Predict project risks", status: "In Progress" },
  ],
};

// Initial nodes (states) for the workflow with category
const initialNodes = [
  { id: "start", type: "startNode", data: { label: "Start" }, position: { x: 50, y: 100 } },
  { id: "1", type: "customNode", data: { label: "To Do", category: "To Do" }, position: { x: 150, y: 100 } },
  { id: "2", type: "customNode", data: { label: "In Progress", category: "In Progress" }, position: { x: 300, y: 200 } },
  { id: "3", type: "customNode", data: { label: "In Review", category: "In Progress" }, position: { x: 450, y: 100 } },
  { id: "4", type: "customNode", data: { label: "Done", category: "Done" }, position: { x: 600, y: 100 } },
];

// Initial edges (transitions)
const initialEdges = [
  { id: "e-start-1", source: "start", target: "1", label: "Create", data: { label: "Create", anyStatus: false } },
  { id: "e1-2", source: "1", target: "2", label: "Any", data: { label: "Any", anyStatus: true } },
  { id: "e2-3", source: "2", target: "3", label: "Any", data: { label: "Any", anyStatus: true } },
  { id: "e3-4", source: "3", target: "4", label: "Any", data: { label: "Any", anyStatus: true } },
];

// Custom Start Node
const StartNode = ({ data, selected }) => {
  return (
    <div
      className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${
        selected ? "border-2 border-blue-600" : ""
      }`}
    >
      {data.label}
      <Handle type="source" position="right" className="w-2 h-2 bg-gray-700" />
    </div>
  );
};

// Custom State Node (Rectangle with rounded corners)
const CustomNode = ({ data, selected }) => {
  const backgroundColor =
    data.category === "Done"
      ? "bg-green-100"
      : data.category === "In Progress"
      ? "bg-blue-100"
      : "bg-blue-50";
  return (
    <div
      className={`bg-white border-2 rounded-lg p-3 w-32 flex items-center justify-center text-center text-sm text-gray-700 shadow-sm ${
        selected ? "border-blue-600" : "border-gray-300"
      } ${backgroundColor}`}
    >
      <Handle type="target" position="left" className="w-2 h-2 bg-blue-600" />
      <div className="font-bold">{data.label}</div>
      <Handle type="source" position="right" className="w-2 h-2 bg-blue-600" />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode, startNode: StartNode };

// Modal Component for Creating a New Task
const CreateTaskModal = ({ isOpen, onClose, onSave, stateLabel }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState("Not Started");

  const handleSave = () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }
    onSave({ id: crypto.randomUUID(), title: taskTitle, status: taskStatus });
    setTaskTitle("");
    setTaskStatus("Not Started");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Create Task for {stateLabel}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Enter task title"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Main JiraWorkflowEditor component wrapped in ReactFlowProvider
function JiraWorkflowEditor() {
  return (
    <ReactFlowProvider>
      <JiraWorkflowEditorContent />
    </ReactFlowProvider>
  );
}

// Separate content component to use React Flow hooks
function JiraWorkflowEditorContent() {
  // State for nodes, edges, transition labels, and selected element
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showTransitionLabels, setShowTransitionLabels] = useState(true);
  const [selectedElement, setSelectedElement] = useState(null);
  const [savedWorkflows, setSavedWorkflows] = useState([]); // State for saved workflows
  const [workflowName, setWorkflowName] = useState(""); // State for workflow name
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null); // Track selected saved workflow
  const [tasks, setTasks] = useState(tasksData); // State for tasks data
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false); // State for create task modal

  const { zoomIn, zoomOut } = useReactFlow();

  // Load saved workflows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("jiraWorkflows");
    if (saved) {
      setSavedWorkflows(JSON.parse(saved));
    }
  }, []);

  // Load a saved workflow
  const loadWorkflow = (workflow) => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setWorkflowName(workflow.name);
    setSelectedWorkflowId(workflow.id);
    setSelectedElement(null); // Reset selected element when loading a new workflow
  };

  // Handle node click to select a status
  const onNodeClick = (event, node) => {
    setSelectedElement({ type: "node", data: node });
  };

  // Handle edge click to select a transition
  const onEdgeClick = (event, edge) => {
    setSelectedElement({ type: "edge", data: edge });
  };

  // Handle pane click to deselect
  const onPaneClick = () => {
    setSelectedElement(null);
  };

  // Handle connecting nodes (creating transitions)
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        label: "Any",
        data: { label: "Any", anyStatus: true },
        style: { stroke: "#2563eb", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Add a new status based on the category clicked
  const addStatus = (category) => {
    const newId = (nodes.length + 1).toString();
    const newLabel =
      category === "To Do"
        ? `To Do ${newId}`
        : category === "In Progress"
        ? `In Progress ${newId}`
        : `Done ${newId}`;
    const newPosition = { x: 150 + (nodes.length - 1) * 150, y: category === "In Progress" ? 200 : 100 };
    const newNode = {
      id: newId,
      type: "customNode",
      data: { label: newLabel, category },
      position: newPosition,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Save workflow to localStorage
  const saveWorkflow = () => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name before saving.");
      return;
    }

    // Check if a workflow with the same name already exists
    const existingWorkflowIndex = savedWorkflows.findIndex(
      (w) => w.name.toLowerCase() === workflowName.toLowerCase()
    );

    let updatedWorkflows;
    const newWorkflow = {
      id: crypto.randomUUID(), // Always generate a new ID for a new workflow
      name: workflowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    };

    if (existingWorkflowIndex !== -1) {
      // Update existing workflow if name matches
      updatedWorkflows = [...savedWorkflows];
      updatedWorkflows[existingWorkflowIndex] = newWorkflow;
      setSelectedWorkflowId(newWorkflow.id);
    } else {
      // Add new workflow
      updatedWorkflows = [...savedWorkflows, newWorkflow];
      setSelectedWorkflowId(null); // Reset selectedWorkflowId for new workflow
    }

    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem("jiraWorkflows", JSON.stringify(updatedWorkflows));
    alert("Workflow saved!");
  };

  // Discard changes
  const discardChanges = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedElement(null);
    setWorkflowName("");
    setSelectedWorkflowId(null);
  };

  // Update status (node) name or category
  const updateStatus = (updatedData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedElement.data.id
          ? { ...node, data: { ...node.data, ...updatedData } }
          : node
      )
    );
    setSelectedElement((prev) => ({
      ...prev,
      data: { ...prev.data, data: { ...prev.data.data, ...updatedData } },
    }));
  };

  // Delete status (node) and related edges
  const deleteStatus = () => {
    const nodeId = selectedElement.data.id;
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    setSelectedElement(null);
  };

  // Update transition (edge) name
  const updateTransition = (newLabel) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === selectedElement.data.id
          ? { ...edge, label: newLabel, data: { ...edge.data, label: newLabel } }
          : edge
      )
    );
    setSelectedElement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        label: newLabel,
        data: { ...prev.data.data, label: newLabel },
      },
    }));
  };

  // Delete transition (edge)
  const deleteTransition = () => {
    setEdges((eds) => eds.filter((edge) => edge.id !== selectedElement.data.id));
    setSelectedElement(null);
  };

  // Delete a saved workflow
  const deleteSavedWorkflow = (workflowId) => {
    const updatedWorkflows = savedWorkflows.filter((w) => w.id !== workflowId);
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem("jiraWorkflows", JSON.stringify(updatedWorkflows));
    if (selectedWorkflowId === workflowId) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setSelectedElement(null);
      setWorkflowName("");
      setSelectedWorkflowId(null);
    }
  };

  // Handle task click
  const handleTaskClick = (task) => {
    alert("Task clicked: " + task.title + " (To be enhanced)");
  };

  // Handle adding a new task
  const handleAddTask = (newTask) => {
    if (selectedElement && selectedElement.type === "node") {
      const stateLabel = selectedElement.data.data.label;
      setTasks((prevTasks) => ({
        ...prevTasks,
        [stateLabel]: [...(prevTasks[stateLabel] || []), newTask],
      }));
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Saved Workflows */}
      <div className="w-64 bg-white border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Saved Workflows</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {savedWorkflows.length === 0 ? (
            <div className="p-4">
              <p className="text-sm text-gray-500">No saved workflows yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {savedWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedWorkflowId === workflow.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div
                    onClick={() => loadWorkflow(workflow)}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-medium">{workflow.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(workflow.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering loadWorkflow
                        deleteSavedWorkflow(workflow.id);
                      }}
                      className="text-red-600 hover:bg-red-100 p-1 rounded"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-3 bg-white border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-gray-700">
              Workflow Editor
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => addStatus("To Do")}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                To-do status
              </button>
              <button
                onClick={() => addStatus("In Progress")}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                In-progress status
              </button>
              <button
                onClick={() => addStatus("Done")}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                Done status
              </button>
              <button
                onClick={() => alert("Drag between statuses to create a transition")}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                Transition
              </button>
              <button
                onClick={() => alert("Add Rule functionality coming soon!")}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                Rule
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
              className="px-3 py-1 border rounded-md text-sm"
            />
            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Workflow
            </button>
            <button
              onClick={discardChanges}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Discard Changes
            </button>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 flex relative">
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-white p-2 rounded-md border shadow-sm z-10">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showTransitionLabels}
                onChange={(e) => setShowTransitionLabels(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Show transition labels</span>
            </div>
            <button onClick={() => zoomOut()} className="p-1 hover:bg-gray-100 rounded">
              🔍-
            </button>
            <button onClick={() => zoomIn()} className="p-1 hover:bg-gray-100 rounded">
              🔍+
            </button>
          </div>
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges.map((edge) => ({
                ...edge,
                label: showTransitionLabels ? edge.label : undefined,
                style: {
                  stroke: edge.id === selectedElement?.data?.id ? "#1e40af" : "#2563eb",
                  strokeWidth: 2,
                },
              }))}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{
                style: { stroke: "#2563eb", strokeWidth: 2 },
                labelStyle: { fill: "#374151", fontSize: "12px" },
                labelBgStyle: { fill: "#ffffff", padding: 5 },
              }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Right Panel - Editor Panel and Tasks */}
      <div className="w-80 bg-white border-l p-6 overflow-y-auto h-full">
        {selectedElement ? (
          <>
            {selectedElement.type === "node" ? (
              <>
                {/* Status Edit Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Status</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Statuses capture the stages of your working process.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={selectedElement.data.data.label}
                      onChange={(e) => updateStatus({ label: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedElement.data.data.category}
                      onChange={(e) => updateStatus({ category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Transitions</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Transitions connect statuses. They represent actions people take to move work items through your workflow.
                    </p>
                    {edges
                      .filter((edge) => edge.target === selectedElement.data.id)
                      .map((edge) => (
                        <div
                          key={edge.id}
                          className="flex items-center space-x-2 mb-2"
                        >
                          <input
                            type="checkbox"
                            checked={edge.data.anyStatus}
                            disabled
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-gray-500">
                            Allow issues in any status to move to this one
                          </span>
                          <a
                            href="#"
                            onClick={() =>
                              setSelectedElement({ type: "edge", data: edge })
                            }
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {edge.label} →{" "}
                            {nodes.find((node) => node.id === edge.target)?.data
                              .label}
                          </a>
                        </div>
                      ))}
                  </div>
                  {selectedElement.data.id !== "start" && selectedElement.data.id !== "stop" && (
                    <button
                      onClick={deleteStatus}
                      className="w-full px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Delete status
                    </button>
                  )}
                </div>

                {/* Tasks Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Tasks</h3>
                  {tasks[selectedElement.data.data.label]?.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {tasks[selectedElement.data.data.label].map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        >
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.status}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">No tasks for this status.</p>
                  )}
                  <button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Transition Edit Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Transition
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Transitions connect statuses. They represent actions people take to move work items through your workflow.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={selectedElement.data.label}
                      onChange={(e) => updateTransition(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      From:{" "}
                      {
                        nodes.find(
                          (node) => node.id === selectedElement.data.source
                        )?.data.label
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      To:{" "}
                      {
                        nodes.find(
                          (node) => node.id === selectedElement.data.target
                        )?.data.label
                      }
                    </p>
                  </div>
                  <button
                    onClick={deleteTransition}
                    className="w-full px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Delete transition
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Select a status or transition to edit its properties.
          </p>
        )}

        {/* Create Task Modal */}
        {selectedElement && selectedElement.type === "node" && (
          <CreateTaskModal
            isOpen={showCreateTaskModal}
            onClose={() => setShowCreateTaskModal(false)}
            onSave={handleAddTask}
            stateLabel={selectedElement.data.data.label}
          />
        )}
      </div>
    </div>
  );
}

export default JiraWorkflowEditor;