import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  useReactFlow,
  ReactFlowProvider,
  NodeProps,
  Position,
} from "reactflow";

// Initial nodes (states) for the workflow with category
const START_NODE = { id: "start", type: "startNode", data: { label: "Start" }, position: { x: 50, y: 100 } };
const STOP_NODE = { id: "stop", type: "stopNode", data: { label: "Stop" }, position: { x: 800, y: 100 } };
const initialNodes = [START_NODE, STOP_NODE];

// Initial edges (transitions)
const initialEdges: any[] = [];

// Custom Start Node
const StartNode = ({ data, selected }: NodeProps<any>) => {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        background: "#374151",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: selected ? "2px solid #2563eb" : "none",
      }}
    >
      {data.label}
      <Handle type="source" position={Position.Right} style={{ background: "#374151", width: "8px", height: "8px" }} />
    </div>
  );
};

// Custom State Node (Rectangle with rounded corners)
const CustomNode = ({ data, selected }: NodeProps<any>) => {
  const backgroundColor = data.category === "Done" ? "#d1fae5" : data.category === "In Progress" ? "#e0f2fe" : "#e6f0ff";
  return (
    <div
      style={{
        background: backgroundColor,
        border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "10px 15px",
        width: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: "14px",
        color: "#374151",
        position: "relative",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "#2563eb", width: "8px", height: "8px" }} />
      <div style={{ fontWeight: "bold" }}>{data.label}</div>
      <Handle type="source" position={Position.Right} style={{ background: "#2563eb", width: "8px", height: "8px" }} />
    </div>
  );
};

// Custom Stop Node
const StopNode = ({ data, selected }: NodeProps<any>) => {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        background: "#991b1b",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: selected ? "2px solid #991b1b" : "none",
      }}
    >
      {data.label}
      <Handle type="target" position={Position.Left} style={{ background: "#991b1b", width: "8px", height: "8px" }} />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode, startNode: StartNode, stopNode: StopNode };

// Main WorkflowDesigner component wrapped in ReactFlowProvider
function WorkflowDesigner() {
  return (
    <ReactFlowProvider>
      <WorkflowDesignerContent />
    </ReactFlowProvider>
  );
}

// Separate content component to use React Flow hooks
function WorkflowDesignerContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(initialEdges);
  const [showTransitionLabels, setShowTransitionLabels] = useState(true);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const { zoomIn, zoomOut } = useReactFlow();

  // Ensure Start and Stop nodes always exist
  useEffect(() => {
    setNodes((nds: any[]) => {
      let changed = false;
      let newNodes = nds;
      if (!nds.find(n => n.id === 'start')) {
        newNodes = [START_NODE, ...newNodes];
        changed = true;
      }
      if (!nds.find(n => n.id === 'stop')) {
        newNodes = [...newNodes, STOP_NODE];
        changed = true;
      }
      // Remove duplicates
      newNodes = newNodes.filter((n, i, arr) => arr.findIndex(x => x.id === n.id) === i);
      return changed ? newNodes : nds;
    });
  }, [setNodes]);

  // Load saved workflow on mount
  useEffect(() => {
    const savedNodes = localStorage.getItem("workflowNodes");
    const savedEdges = localStorage.getItem("workflowEdges");
    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    const savedNodes = localStorage.getItem("workflowNodes");
    const savedEdges = localStorage.getItem("workflowEdges");
    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
    }
  }, [setNodes, setEdges]);

  const onNodeClick = (event: any, node: any) => {
    setSelectedElement({ type: "node", data: node });
  };

  const onEdgeClick = (event: any, edge: any) => {
    setSelectedElement({ type: "edge", data: edge });
  };

  const onPaneClick = () => {
    setSelectedElement(null);
  };

  const onConnect = useCallback(
    (params: any) => {
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

  const addStatus = (category: any) => {
    const newId = (nodes.length + 1).toString();
    const newLabel = category === "To Do" ? `To Do ${newId}` : category === "In Progress" ? `In Progress ${newId}` : `Done ${newId}`;
    const newPosition = { x: 150 + (nodes.length - 1) * 150, y: 100 };
    const newNode = {
      id: newId,
      type: "customNode",
      data: { label: newLabel, category },
      position: newPosition,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addRule = () => {
    alert("Add Rule functionality coming soon!");
  };

  // Save workflow to localStorage
  const saveWorkflow = () => {
    localStorage.setItem("workflowNodes", JSON.stringify(nodes));
    localStorage.setItem("workflowEdges", JSON.stringify(edges));
    const stateNames = nodes.filter((node) => node.type !== "startNode").map((node) => node.data.label);
    localStorage.setItem("workflowStates", JSON.stringify(stateNames));
    window.dispatchEvent(new Event("workflowUpdated"));
    alert("Workflow saved!");
  };

  const discardChanges = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedElement(null);
  };

  const updateStatus = (updatedData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedElement.data.id ? { ...node, data: { ...node.data, ...updatedData } } : node
      )
    );
    setSelectedElement((prev: any) => ({ ...prev, data: { ...prev.data, data: { ...prev.data.data, ...updatedData } } }));
  };

  const deleteStatus = () => {
    if (selectedElement.data.id === 'start' || selectedElement.data.id === 'stop') return;
    const nodeId = selectedElement.data.id;
    setNodes((nds: any[]) => nds.filter((node: any) => node.id !== nodeId));
    setEdges((eds: any[]) => eds.filter((edge: any) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedElement(null);
  };

  const updateTransition = (newLabel: any) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === selectedElement.data.id
          ? { ...edge, label: newLabel, data: { ...edge.data, label: newLabel } }
          : edge
      )
    );
    setSelectedElement((prev: any) => ({
      ...prev,
      data: { ...prev.data, label: newLabel, data: { ...prev.data.data, label: newLabel } },
    }));
  };

  const deleteTransition = () => {
    setEdges((eds) => eds.filter((edge) => edge.id !== selectedElement.data.id));
    setSelectedElement(null);
  };

  // Add new node to the graph
  const addNodeToGraph = () => {
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      type: "customNode",
      data: { label: `New Node`, category: "To Do" },
      position: { x: 200 + nodes.length * 50, y: 200 },
    };
    setNodes((nds: any[]) => [...nds, newNode]);
  };

  // Drag and drop from Workflow Nodes list
  const onDropNode = (nodeId: string, position: { x: number; y: number }) => {
    setNodes((nds: any[]) => nds.map(n => n.id === nodeId ? { ...n, position } : n));
  };

  // Only show user-created nodes in the Workflow Nodes list
  const userNodes = nodes.filter(n => n.type === 'customNode');

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      fontFamily: "Arial, sans-serif",
    } as any,
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as any,
    } as any,
    header: {
      padding: "0.75rem 1rem",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    } as any,
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    } as any,
    headerRight: {
      display: "flex",
      gap: "0.5rem",
    } as any,
    headerTitle: {
      fontSize: "1rem",
      fontWeight: "bold",
      color: "#374151",
    } as any,
    headerIcons: {
      display: "flex",
      gap: "0.25rem",
    } as any,
    headerIcon: {
      width: "16px",
      height: "16px",
      borderRadius: "50%",
    } as any,
    headerTabs: {
      display: "flex",
      gap: "0.5rem",
      marginLeft: "0.5rem",
    } as any,
    headerTab: {
      padding: "0.25rem 0.75rem",
      borderRadius: "0.375rem",
      backgroundColor: "#f3f4f6",
      color: "#374151",
      cursor: "pointer",
      fontSize: "0.875rem",
      transition: "background-color 0.2s",
    } as any,
    headerTabHover: {
      backgroundColor: "#e5e7eb",
    } as any,
    actionButton: {
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      border: "none",
      cursor: "pointer",
      fontSize: "0.875rem",
      transition: "background-color 0.2s",
    } as any,
    updateButton: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
    } as any,
    updateButtonHover: {
      backgroundColor: "#1e40af",
    } as any,
    discardButton: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    } as any,
    discardButtonHover: {
      backgroundColor: "#e5e7eb",
    } as any,
    canvasContainer: {
      flex: 1,
      display: "flex",
      position: "relative" as any,
    } as any,
    canvas: {
      flex: 1,
      height: "calc(100vh - 70px)",
    } as any,
    controls: {
      position: "absolute" as any,
      top: "1rem",
      left: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: "#ffffff",
      padding: "0.5rem",
      borderRadius: "0.375rem",
      border: "1px solid #e5e7eb",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    } as any,
    controlButton: {
      padding: "0.25rem",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "0.875rem",
    } as any,
    rightPanel: {
      width: "300px",
      backgroundColor: "#ffffff",
      borderLeft: "1px solid #e5e7eb",
      padding: "1.5rem",
      boxSizing: "border-box" as any,
      overflowY: "auto",
      height: "100vh",
    } as any,
    panelSection: {
      marginBottom: "1.5rem",
    } as any,
    panelTitle: {
      fontSize: "1rem",
      fontWeight: "bold",
      color: "#374151",
      marginBottom: "0.5rem",
    } as any,
    panelText: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginBottom: "0.5rem",
    } as any,
    panelInput: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      fontSize: "0.875rem",
      marginBottom: "0.5rem",
    } as any,
    panelSelect: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      fontSize: "0.875rem",
      marginBottom: "0.5rem",
    } as any,
    panelCheckbox: {
      marginRight: "0.5rem",
    } as any,
    panelLink: {
      color: "#2563eb",
      textDecoration: "none",
      fontSize: "0.875rem",
      cursor: "pointer",
    } as any,
    panelLinkHover: {
      textDecoration: "underline",
    } as any,
    deleteButton: {
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      color: "#374151",
      cursor: "pointer",
      fontSize: "0.875rem",
      marginTop: "1rem",
      transition: "background-color 0.2s",
    } as any,
    deleteButtonHover: {
      backgroundColor: "#f3f4f6",
    } as any,
  };

  const STAGE_OPTIONS = [
    "FORECAST",
    "PLANNING",
    "SUBMITTED",
    "SUBMISSION REVIEW",
    "DEVICE ENTRY",
    "DEVICE TESTING",
    "TAQ REVIEW",
    "TA COMPLETE",
    "CLOSED"
  ];

  // Add a stage node to the graph if not already present
  const addStageNode = (stage: string) => {
    if (nodes.some(n => n.data.label === stage)) return;
    const newId = `node-${stage.replace(/\s+/g, '-')}-${Date.now()}`;
    const newNode = {
      id: newId,
      type: "customNode",
      data: { label: stage, category: "Stage" },
      position: { x: 200 + nodes.length * 50, y: 200 },
    };
    setNodes((nds: any[]) => [...nds, newNode]);
  };

  // Load workflow from localStorage
  const loadWorkflow = () => {
    const savedNodes = localStorage.getItem("workflowNodes");
    const savedEdges = localStorage.getItem("workflowEdges");
    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
      alert("Workflow loaded from local storage!");
    } else {
      alert("No saved workflow found.");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left: Dynamic list of workflow nodes (excluding Start/Stop) */}
      <div style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', padding: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Workflow Nodes</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {userNodes.map(node => (
            <li key={node.id} style={{ marginBottom: 8, background: '#f3f4f6', borderRadius: 4, padding: 8 }}>
              {node.data.label}
            </li>
          ))}
        </ul>
      </div>
      {/* Main: Top options and graph */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Top section with title, stage buttons, and save/load */}
        <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginRight: 32 }}>Workflow for Device Certification</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {STAGE_OPTIONS.map(stage => (
              <button key={stage} onClick={() => addStageNode(stage)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #2563eb', background: '#f3f4f6', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>{stage}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={saveWorkflow} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save</button>
            <button onClick={loadWorkflow} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Load</button>
          </div>
        </div>
        {/* Graph and Edit Panel */}
        <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges.map(edge => ({
                ...edge,
                label: showTransitionLabels ? edge.label : undefined,
                style: { stroke: edge.id === selectedElement?.data?.id ? "#1e40af" : "#2563eb", strokeWidth: 2 },
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
            </ReactFlow>
          </div>
          {/* Edit Panel (reuse existing logic) */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, background: '#fff', borderLeft: '1px solid #eee', height: '100%', overflowY: 'auto', padding: 24 }}>
            {selectedElement ? (
              selectedElement.type === "node" ? (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Status</div>
                  <input
                    type="text"
                    value={selectedElement.data.data.label}
                    onChange={(e) => updateStatus({ label: e.target.value })}
                    style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <select
                    value={selectedElement.data.data.category}
                    onChange={(e) => updateStatus({ category: e.target.value })}
                    style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  {selectedElement.data.id !== 'start' && selectedElement.data.id !== 'stop' && (
                    <button onClick={deleteStatus} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: 8, fontWeight: 600 }}>Delete status</button>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Transition</div>
                  <input
                    type="text"
                    value={selectedElement.data.label}
                    onChange={(e) => updateTransition(e.target.value)}
                    style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <div style={{ marginBottom: 8 }}>
                    From: {nodes.find((node) => node.id === selectedElement.data.source)?.data.label}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    To: {nodes.find((node) => node.id === selectedElement.data.target)?.data.label}
                  </div>
                  <button onClick={deleteTransition} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: 8, fontWeight: 600 }}>Delete transition</button>
                </>
              )
            ) : (
              <div style={{ color: '#6b7280' }}>Select a status or transition to edit its properties.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDesigner; 