import React, { useState } from 'react';
import { FanUserProfile, TreeNode, NodeTransfer } from '../hooks/index';
import { useFanProfile } from '../hooks/useFanProfile';
import OrganizationChart from '../components/OrganizationChart';
import UserProfileSidebar from '../components/UserProfileSidebar';
import { OrganizationChartHelper } from '../hooks/organizationChartHelper';

function Heirarchy() {
  const { 
    loading, 
    error, 
    treeData, 
    setTreeData 
  } = useFanProfile();
  
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleClickNode = (node: TreeNode) => {
    if (selectedNode && selectedNode.id === node.id) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSelectedNode(node);
      setSidebarOpen(true);
    }
  };

  const handleDragNode = (transfer: NodeTransfer) => {
    // Create a helper instance with the current tree data
    const helper = new OrganizationChartHelper([...treeData]);
    
    // Move the node using the helper
    const success = helper.moveNode(transfer.node.id, transfer.destination.id);
    
    if (success) {
      // Update the tree data with the new structure
      setTreeData(helper.getData());
    }
  };

  const handleAddNode = (transfer: NodeTransfer) => {
    // Create a helper instance with the current tree data
    const helper = new OrganizationChartHelper([...treeData]);
    
    // Add the node using the helper
    const success = helper.addNode(transfer.node.id, transfer.destination.id, transfer.node);
    
    if (success) {
      // Update the tree data with the new structure
      setTreeData(helper.getData());
    }
  };

  const handleEditNode = (transfer: NodeTransfer) => {
    // In a real application, this would open a form or modal to edit the node
    // For simplicity, we're not implementing the full editing functionality here
    console.log('Edit node:', transfer.node);
  };

  const handleDeleteNode = (transfer: { id: string }) => {
    // Create a helper instance with the current tree data
    const helper = new OrganizationChartHelper([...treeData]);
    
    // Delete the node using the helper
    const success = helper.deleteNode(transfer.id);
    
    if (success) {
      // Update the tree data with the new structure
      setTreeData(helper.getData());
      
      // If the deleted node was selected, close the sidebar
      if (selectedNode && selectedNode.id === transfer.id) {
        setSidebarOpen(false);
        setSelectedNode(null);
      }
    }
  };

  const handleUpdateNode = (nodeId: string, updatedData: Partial<FanUserProfile>) => {
    // Create a helper instance with the current tree data
    const helper = new OrganizationChartHelper([...treeData]);
    
    // Find the node to update
    const nodeToUpdate = helper.findNodeById(nodeId);
    
    if (nodeToUpdate) {
      // Update the node data
      nodeToUpdate.data = {
        ...nodeToUpdate.data,
        ...updatedData
      };
      
      // Update the selected node if it's the one being modified
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            ...updatedData
          }
        });
      }
      
      // Update the tree data with the modified node
      setTreeData(helper.getData());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading user hierarchy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-red-600">Error loading data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="flex h-full">
        <div className="flex-1 overflow-auto">
          <OrganizationChart 
            data={treeData}
            onClickNode={handleClickNode}
            onDragNode={handleDragNode}
            onAddNode={handleAddNode}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNode}
          />
        </div>
        
        <UserProfileSidebar 
          node={selectedNode}
          onClose={() => setSidebarOpen(false)}
          onUpdateNode={handleUpdateNode}
        />
      </div>
    </div>
  );
}

export default Heirarchy;